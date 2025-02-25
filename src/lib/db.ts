import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function searchArticles(query: string) {
  // Log the search query for debugging
  console.log('Search query:', query);
  
  // Based on our test script, we found that articles might be approved but not published
  // So we need to check for either condition
  return prisma.article.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: query.toLowerCase() } },
            { content: { contains: query.toLowerCase() } },
            { summary: { contains: query.toLowerCase() } },
          ],
        },
        {
          OR: [
            { isPublished: true },
            { status: 'approved' },
          ],
        },
      ],
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
