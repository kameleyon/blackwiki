import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentArticleId = searchParams.get('articleId');
    const limitParam = searchParams.get('limit');
    // Safely parse and clamp limit to prevent crashes
    const parsedLimit = Number(limitParam);
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 10)) : 5;

    if (!currentArticleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Fetch the current article's categories and tags server-side for security
    const currentArticle = await prisma.article.findUnique({
      where: { id: currentArticleId },
      select: {
        categories: {
          select: { id: true }
        },
        tags: {
          select: { id: true }
        }
      }
    });

    if (!currentArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const categoryIds = currentArticle.categories.map(cat => cat.id);
    const tagIds = currentArticle.tags.map(tag => tag.id);

    interface RelatedArticle {
      id: string;
      title: string;
      slug: string;
      summary: string;
      createdAt: Date;
      views: number;
      categories: { id: string; name: string; }[];
      tags: { id: string; name: string; }[];
    }

    let relatedArticles: RelatedArticle[] = [];

    if (categoryIds.length > 0 || tagIds.length > 0) {
      // Find articles that share categories or tags with the current article
      relatedArticles = await prisma.article.findMany({
        where: {
          AND: [
            { id: { not: currentArticleId } }, // Exclude current article
            { isPublished: true }, // Only published articles
            {
              OR: [
                // Articles with matching categories
                ...(categoryIds.length > 0 ? [{
                  categories: {
                    some: {
                      id: { in: categoryIds }
                    }
                  }
                }] : []),
                // Articles with matching tags
                ...(tagIds.length > 0 ? [{
                  tags: {
                    some: {
                      id: { in: tagIds }
                    }
                  }
                }] : [])
              ]
            }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          createdAt: true,
          views: true,
          categories: {
            select: {
              id: true,
              name: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { views: 'desc' }, // Prioritize popular articles
          { createdAt: 'desc' } // Then by recency
        ],
        take: limit
      });
    }

    // If we don't have enough related articles, fill with popular recent articles
    if (relatedArticles.length < limit) {
      const additionalArticles = await prisma.article.findMany({
        where: {
          AND: [
            { id: { not: currentArticleId } },
            { id: { notIn: relatedArticles.map(a => a.id) } }, // Exclude already found articles
            { isPublished: true }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          createdAt: true,
          views: true,
          categories: {
            select: {
              id: true,
              name: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { views: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit - relatedArticles.length
      });

      relatedArticles = [...relatedArticles, ...additionalArticles];
    }

    return NextResponse.json(relatedArticles);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related articles' },
      { status: 500 }
    );
  }
}