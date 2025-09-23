// This file fixes the build error by using dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

async function getRandomArticle() {
  try {
    // Skip during build if no database URL
    if (!process.env.DATABASE_URL) {
      console.log('No DATABASE_URL found, skipping database query');
      return null;
    }
    
    const count = await prisma.article.count({
      where: {
        isPublished: true,
        isArchived: false
      }
    });
    
    if (count === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * count);
    const article = await prisma.article.findFirst({
      where: {
        isPublished: true,
        isArchived: false
      },
      select: {
        id: true,
        slug: true
      },
      skip: randomIndex,
    });
    
    return article;
  } catch (error) {
    console.error('Error fetching random article:', error);
    return null;
  }
}

export default async function RandomArticlePage() {
  const article = await getRandomArticle();
  
  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Articles Found</h1>
          <p className="text-gray-600 mb-4">
            The database might be empty or not connected. Please check back later.
          </p>
          <a 
            href="/search" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Browse articles instead
          </a>
        </div>
      </div>
    );
  }
  
  // Redirect to the article page
  redirect(`/articles/${article.slug}`);
}