import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function RandomArticlePage() {
  // Get total count of published articles
  const totalArticles = await prisma.article.count({
    where: {
      isPublished: true,
      isArchived: false
    }
  });

  if (totalArticles === 0) {
    redirect('/search?message=No articles available');
  }

  // Generate random offset
  const randomOffset = Math.floor(Math.random() * totalArticles);

  // Get random article
  const randomArticle = await prisma.article.findFirst({
    where: {
      isPublished: true,
      isArchived: false
    },
    select: {
      slug: true
    },
    skip: randomOffset,
    take: 1
  });

  if (!randomArticle) {
    redirect('/search?message=No articles found');
  }

  // Redirect to the random article
  redirect(`/articles/${randomArticle.slug}`);
}