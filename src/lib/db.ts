import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function searchArticles(query: string) {
  return prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { summary: { contains: query } },
      ],
      isPublished: true,
    },
    include: {
      categories: true,
      tags: true,
    },
    take: 10,
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
