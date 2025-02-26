import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function searchArticles(query: string, currentUserId?: string) {
  // Log the search query for debugging
  console.log('Search query:', query);
  
  return prisma.article.findMany({
    where: {
      AND: [
        // Search in title, content, and summary
        {
          OR: [
            { title: { contains: query.toLowerCase() } },
            { content: { contains: query.toLowerCase() } },
            { summary: { contains: query.toLowerCase() } },
          ],
        },
        // Show only public articles or user's own articles
        {
          OR: [
            // Public articles (published or approved)
            {
              OR: [
                { isPublished: true },
                { status: 'approved' },
              ],
            },
            // Or articles owned by current user
            ...(currentUserId ? [{ authorId: currentUserId }] : []),
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

export async function getArticleBySlug(slug: string, currentUserId?: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      OR: [
        // Public articles (published or approved)
        {
          OR: [
            { isPublished: true },
            { status: 'approved' }
          ]
        },
        // Or articles owned by current user
        ...(currentUserId ? [{ authorId: currentUserId }] : [])
      ]
    },
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
