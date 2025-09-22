import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get total count of published articles
    const totalArticles = await prisma.article.count({
      where: {
        isPublished: true,
        isArchived: false
      }
    });

    if (totalArticles === 0) {
      return NextResponse.json(
        { error: 'No articles available' },
        { status: 404 }
      );
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
        id: true,
        title: true,
        slug: true,
        summary: true,
        image: true,
        views: true,
        createdAt: true,
        author: {
          select: {
            name: true
          }
        },
        categories: {
          select: {
            name: true
          }
        }
      },
      skip: randomOffset,
      take: 1
    });

    if (!randomArticle) {
      return NextResponse.json(
        { error: 'No articles found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      article: randomArticle,
      totalArticles
    });
  } catch (error) {
    console.error('Error fetching random article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random article' },
      { status: 500 }
    );
  }
}