import { PrismaClient, Article, User } from '@prisma/client'

// Type definitions
type ArticleWithRelations = Article & {
  author: User
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
  references: Array<{ id: string; url: string; title: string; description: string | null }>
}

type SearchResult = Pick<Article, 'id' | 'title' | 'summary' | 'slug' | 'content' | 'views' | 'updatedAt'> & {
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
  author: { id: string; name: string | null }
}

interface CacheEntry<T> {
  value: T
  timestamp: number
}

// Cache configuration
const cache = new Map<string, CacheEntry<unknown>>()
const DEFAULT_TTL = 3600000 // 1 hour

// Configure Prisma client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Cache helper functions
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = DEFAULT_TTL
): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined
  const now = Date.now()

  if (cached && now - cached.timestamp < ttl) {
    return cached.value
  }

  const value = await fetchFn()
  cache.set(key, { value, timestamp: now })
  return value
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// Article related functions
export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  return withCache(
    `article:${slug}`,
    () => prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        categories: {
          select: { id: true, name: true }
        },
        tags: {
          select: { id: true, name: true }
        },
        references: true
      }
    })
  )
}

export async function incrementArticleViews(articleId: string): Promise<void> {
  await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } }
  })
  clearCache(`article:${articleId}`)
}

export async function searchArticles(query: string): Promise<SearchResult[]> {
  const searchQuery = query.toLowerCase()
  
  const results = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: searchQuery } },
        { content: { contains: searchQuery } },
        { summary: { contains: searchQuery } }
      ],
      AND: [
        { isPublished: true },
        { status: 'approved' }
      ]
    },
    select: {
      id: true,
      title: true,
      summary: true,
      slug: true,
      content: true,
      views: true,
      updatedAt: true,
      categories: {
        select: { id: true, name: true }
      },
      tags: {
        select: { id: true, name: true }
      },
      author: {
        select: { id: true, name: true }
      }
    },
    orderBy: [
      { views: 'desc' },
      { updatedAt: 'desc' }
    ],
    take: 20
  })

  return results as SearchResult[]
}

// Query optimization helpers
type SelectFields = Record<string, boolean>
type IncludeFields = Record<string, boolean | Record<string, unknown>>

export function optimizeSelect<T extends SelectFields>(fields: T): { select: T } {
  return { select: fields }
}

export function optimizeInclude<T extends IncludeFields>(fields: T): { include: T } {
  return { include: fields }
}

export function optimizeQuery<T extends { include?: IncludeFields; select?: SelectFields }>(
  query: T
): T {
  const optimized = { ...query }
  const include = optimized.include ? { ...optimized.include } : undefined

  if (include) {
    Object.entries(include).forEach(([key, value]) => {
      if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
        delete include[key]
      }
    })

    if (Object.keys(include).length === 0) {
      delete optimized.include
    } else {
      optimized.include = include
    }
  }

  if (optimized.select && Object.keys(optimized.select).length === 0) {
    delete optimized.select
  }

  return optimized
}
