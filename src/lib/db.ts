import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function searchArticles(query: string) {
  const searchTerms = query.split(' ').filter(term => term.length > 0);
  
  return prisma.article.findMany({
    where: {
      AND: searchTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
          { summary: { contains: term, mode: 'insensitive' } },
          { categories: { some: { name: { contains: term, mode: 'insensitive' } } } },
          { tags: { some: { name: { contains: term, mode: 'insensitive' } } } },
        ],
      })),
      isPublished: true,
      status: 'approved',
    },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      },
      categories: true,
      tags: true,
    },
    orderBy: [
      { views: 'desc' },
      { updatedAt: 'desc' }
    ],
    take: 20,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      categories: true,
      tags: true,
      references: true,
    },
  });
}

export async function incrementArticleViews(id: string) {
  return prisma.article.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
  });
}
