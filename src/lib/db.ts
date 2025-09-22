import { PrismaClient, Article, User } from '@prisma/client'

// Type definitions
type ArticleWithRelations = Article & {
  author: User
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
  references: Array<{ id: string; url: string; title: string; description: string | null }>
}

type SearchResult = Pick<Article, 'id' | 'title' | 'summary' | 'slug' | 'content' | 'views' | 'updatedAt' | 'createdAt'> & {
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

interface SearchFilters {
  categories?: string[];
  tags?: string[];
  authors?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'relevance' | 'recent' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export async function searchArticles(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
  const searchQuery = query.toLowerCase();
  const {
    categories = [],
    tags = [],
    authors = [],
    dateFrom,
    dateTo,
    sortBy = 'relevance',
    sortOrder = 'desc',
    limit = 20
  } = filters;

  // Build the where clause
  const whereConditions: any = {
    AND: [
      { isPublished: true },
      { status: 'approved' }
    ]
  };

  // Add text search
  if (query.trim()) {
    whereConditions.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { content: { contains: searchQuery, mode: 'insensitive' } },
      { summary: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  // Add category filter (by name - matches UI behavior)
  if (categories.length > 0) {
    whereConditions.AND.push({
      categories: {
        some: {
          name: { in: categories, mode: 'insensitive' }
        }
      }
    });
  }

  // Add tag filter (by name - matches UI behavior)
  if (tags.length > 0) {
    whereConditions.AND.push({
      tags: {
        some: {
          name: { in: tags, mode: 'insensitive' }
        }
      }
    });
  }

  // Add author filter
  if (authors.length > 0) {
    whereConditions.AND.push({
      author: {
        OR: authors.map(authorId => ({
          id: { equals: authorId }
        }))
      }
    });
  }

  // Add date range filter
  if (dateFrom || dateTo) {
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
    whereConditions.AND.push({
      updatedAt: dateFilter
    });
  }

  // Build order by clause
  let orderBy: any = [];
  switch (sortBy) {
    case 'recent':
      orderBy = [{ updatedAt: sortOrder }];
      break;
    case 'views':
      orderBy = [{ views: sortOrder }];
      break;
    case 'title':
      orderBy = [{ title: sortOrder }];
      break;
    default: // relevance
      orderBy = [
        { views: 'desc' },
        { updatedAt: 'desc' }
      ];
      break;
  }

  const results = await prisma.article.findMany({
    where: whereConditions,
    select: {
      id: true,
      title: true,
      summary: true,
      slug: true,
      content: true,
      views: true,
      updatedAt: true,
      createdAt: true,
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
    orderBy,
    take: limit
  });

  return results as SearchResult[];
}

// Get search filter options
export async function getSearchFilterOptions() {
  return withCache(
    'search:filter-options',
    async () => {
      const [categories, tags, authors] = await Promise.all([
        // Get categories with article counts
        prisma.category.findMany({
          select: {
            id: true,
            name: true,
            _count: {
              select: { articles: true }
            }
          },
          orderBy: { name: 'asc' }
        }),
        
        // Get tags with article counts
        prisma.tag.findMany({
          select: {
            id: true,
            name: true,
            _count: {
              select: { articles: true }
            }
          },
          orderBy: { name: 'asc' }
        }),
        
        // Get authors with published article counts
        prisma.user.findMany({
          where: {
            articles: {
              some: {
                isPublished: true,
                status: 'approved'
              }
            }
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: { 
                articles: {
                  where: {
                    isPublished: true,
                    status: 'approved'
                  }
                }
              }
            }
          },
          orderBy: { name: 'asc' }
        })
      ]);

      return {
        categories: categories.filter(cat => cat._count.articles > 0),
        tags: tags.filter(tag => tag._count.articles > 0),
        authors: authors.filter(author => author._count.articles > 0)
      };
    },
    1800000 // 30 minutes cache
  );
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
