import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const submitReviewSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
  reviewType: z.enum(['technical', 'editorial', 'final'], {
    errorMap: () => ({ message: 'Review type must be technical, editorial, or final' })
  }),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

// POST /api/reviews - Submit article for review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = submitReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { articleId, reviewType, notes, priority } = validation.data;

    // Check if article exists and user has permission
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if user can submit this article for review
    const isAuthor = article.authorId === session.user.id;
    const isEditor = ['editor', 'admin'].includes(session.user.role || '');
    
    if (!isAuthor && !isEditor) {
      return NextResponse.json({ 
        error: 'You can only submit your own articles for review' 
      }, { status: 403 });
    }

    // Check if article already has an active review of this type
    const existingReview = await prisma.review.findUnique({
      where: {
        articleId_type: {
          articleId,
          type: reviewType
        }
      }
    });

    if (existingReview && ['pending', 'in_progress'].includes(existingReview.status)) {
      return NextResponse.json({ 
        error: `Article already has an active ${reviewType} review` 
      }, { status: 409 });
    }

    // Use transaction for FULL atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create the review with proper role separation - NO AUTO-ASSIGNMENT
      const review = await tx.review.create({
        data: {
          articleId,
          reviewerId: null, // No reviewer until assigned by admin/editor
          assigneeId: null, // No assignee until explicitly assigned
          type: reviewType,
          status: 'pending',
          feedback: notes || null,
          metadata: JSON.stringify({
            submittedBy: session.user.id,
            submitterName: session.user.name,
            submissionNotes: notes,
            priority,
            submittedAt: new Date()
          })
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              author: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      // Update article status
      await tx.article.update({
        where: { id: articleId },
        data: {
          status: 'pending_review'
        }
      });

      // Create review state INSIDE transaction for full atomicity
      await tx.reviewState.upsert({
        where: { articleId },
        update: {
          currentStage: `${reviewType} Review`,
          overallStatus: 'In Review',
          priority: priority || 'normal',
          lastUpdatedAt: new Date()
        },
        create: {
          articleId,
          currentStage: `${reviewType} Review`,
          overallStatus: 'In Review',
          priority: priority || 'normal',
          createdAt: new Date(),
          lastUpdatedAt: new Date()
        }
      });

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'review_submitted',
          targetType: 'Review',
          targetId: review.id, // Fixed: use 'review' not undefined 'correctedReview'
          details: JSON.stringify({
            articleId,
            reviewType,
            articleTitle: review.article.title,
            notes
          })
        }
      });

      return review; // Fixed: return 'review' not undefined 'correctedReview'
    });

    return NextResponse.json({
      success: true,
      review: result,
      message: `Article submitted for ${reviewType} review`
    });

  } catch (error) {
    console.error('Review submission error:', error);
    
    // Handle duplicate submission race condition - check Prisma error code
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Article already has an active review of this type' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit article for review' },
      { status: 500 }
    );
  }
}

// GET /api/reviews - Get review queue with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const assigneeId = searchParams.get('assigneeId') || '';
    const priority = searchParams.get('priority') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (type) {
      whereConditions.type = type;
    }

    if (assigneeId) {
      whereConditions.assigneeId = assigneeId;
    }

    // Role-based filtering
    const userRole = session.user.role || 'user';
    if (!['admin', 'editor'].includes(userRole)) {
      // Regular users can only see reviews for their own articles
      whereConditions.article = {
        is: {
          authorId: session.user.id
        }
      };
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereConditions,
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              author: {
                select: { id: true, name: true, email: true, image: true }
              }
            }
          },
          reviewer: {
            select: { id: true, name: true, email: true, image: true }
          },
          assignee: {
            select: { id: true, name: true, email: true, image: true }
          },
          // Comments count will be calculated separately if needed
        },
        orderBy: [
          { createdAt: 'desc' },
          { updatedAt: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.review.count({
        where: whereConditions
      })
    ]);

    // Get review stats - fix groupBy relation filter issue
    let statsWhereConditions = { ...whereConditions };
    
    // For groupBy, remove relation filters and get article IDs separately
    if (!['admin', 'editor'].includes(userRole)) {
      // Get user's article IDs first
      const userArticles = await prisma.article.findMany({
        where: { authorId: session.user.id },
        select: { id: true }
      });
      const articleIds = userArticles.map(a => a.id);
      
      // Replace relation filter with direct ID filter
      delete statsWhereConditions.article;
      statsWhereConditions.articleId = { in: articleIds };
    }

    const stats = await prisma.review.groupBy({
      by: ['status', 'type'],
      _count: {
        id: true
      },
      where: statsWhereConditions
    });

    return NextResponse.json({
      reviews,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      stats,
      canManageReviews: ['admin', 'editor'].includes(userRole)
    });

  } catch (error) {
    console.error('Review queue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review queue' },
      { status: 500 }
    );
  }
}