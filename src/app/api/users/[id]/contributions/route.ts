import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, articles, edits, reviews, comments
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const contributions: any[] = [];

    if (type === 'all' || type === 'articles') {
      const articles = await prisma.article.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          createdAt: true,
          updatedAt: true,
          isPublished: true,
          status: true,
          views: true,
          likes: true,
          categories: {
            select: { name: true }
          },
          _count: {
            select: {
              edits: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'articles' ? limit : Math.min(20, limit),
        skip: type === 'articles' ? offset : 0
      });

      articles.forEach(article => {
        contributions.push({
          type: 'article_created',
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          timestamp: article.createdAt,
          data: {
            isPublished: article.isPublished,
            status: article.status,
            views: article.views,
            likes: article.likes,
            categories: article.categories.map(c => c.name),
            edits: article._count.edits,
            comments: article._count.comments
          }
        });
      });
    }

    if (type === 'all' || type === 'edits') {
      const edits = await prisma.edit.findMany({
        where: { userId: userId },
        select: {
          id: true,
          content: true,
          summary: true,
          type: true,
          createdAt: true,
          changeSize: true,
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'edits' ? limit : Math.min(15, limit),
        skip: type === 'edits' ? offset : 0
      });

      edits.forEach(edit => {
        contributions.push({
          type: 'article_edited',
          id: edit.id,
          title: edit.article.title,
          slug: edit.article.slug,
          summary: edit.summary || 'No edit summary',
          timestamp: edit.createdAt,
          data: {
            articleId: edit.article.id,
            editType: edit.type,
            changeSize: edit.changeSize
          }
        });
      });
    }

    if (type === 'all' || type === 'reviews') {
      const reviews = await prisma.review.findMany({
        where: { reviewerId: userId },
        select: {
          id: true,
          type: true,
          status: true,
          score: true,
          feedback: true,
          createdAt: true,
          completedAt: true,
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'reviews' ? limit : Math.min(10, limit),
        skip: type === 'reviews' ? offset : 0
      });

      reviews.forEach(review => {
        contributions.push({
          type: 'review_completed',
          id: review.id,
          title: review.article.title,
          slug: review.article.slug,
          summary: `${review.type} review - ${review.status}`,
          timestamp: review.completedAt || review.createdAt,
          data: {
            articleId: review.article.id,
            reviewType: review.type,
            status: review.status,
            score: review.score,
            feedback: review.feedback
          }
        });
      });
    }

    if (type === 'all' || type === 'comments') {
      const comments = await prisma.comment.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          likes: true,
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          parent: {
            select: {
              id: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'comments' ? limit : Math.min(10, limit),
        skip: type === 'comments' ? offset : 0
      });

      comments.forEach(comment => {
        contributions.push({
          type: 'comment_posted',
          id: comment.id,
          title: comment.article.title,
          slug: comment.article.slug,
          summary: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
          timestamp: comment.createdAt,
          data: {
            articleId: comment.article.id,
            likes: comment.likes,
            isReply: !!comment.parent,
            updatedAt: comment.updatedAt
          }
        });
      });
    }

    // Sort all contributions by timestamp
    contributions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination for mixed results
    const paginatedContributions = contributions.slice(offset, offset + limit);

    // Calculate summary stats
    const stats = {
      totalArticles: await prisma.article.count({ where: { authorId: userId } }),
      publishedArticles: await prisma.article.count({ where: { authorId: userId, isPublished: true } }),
      totalEdits: await prisma.edit.count({ where: { userId } }),
      totalReviews: await prisma.review.count({ where: { reviewerId: userId } }),
      totalComments: await prisma.comment.count({ where: { authorId: userId } }),
      completedReviews: await prisma.review.count({ where: { reviewerId: userId, status: 'completed' } })
    };

    return NextResponse.json({
      contributions: paginatedContributions,
      stats,
      pagination: {
        total: contributions.length,
        limit,
        offset,
        hasMore: offset + limit < contributions.length
      },
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}