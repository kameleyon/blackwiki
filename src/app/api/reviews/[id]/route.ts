import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const updateReviewSchema = z.object({
  assigneeId: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']).optional(),
  feedback: z.string().optional(),
  score: z.number().int().min(1).max(100).optional(),
  checklist: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// GET /api/reviews/[id] - Get specific review details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        article: {
          include: {
            author: {
              select: { id: true, name: true, email: true, image: true }
            },
            categories: {
              select: { id: true, name: true }
            },
            reviewState: true,
            _count: {
              select: {
                comments: true,
                edits: true,
                reviews: true
              }
            }
          }
        },
        reviewer: {
          select: { id: true, name: true, email: true, image: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check permissions
    const userRole = session.user.role || 'user';
    const isReviewer = review.reviewerId === session.user.id;
    const isAssignee = review.assigneeId === session.user.id;
    const isAuthor = review.article.authorId === session.user.id;
    const canAccess = ['admin', 'editor'].includes(userRole) || isReviewer || isAssignee || isAuthor;

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get other reviews for this article
    const relatedReviews = await prisma.review.findMany({
      where: {
        articleId: review.articleId,
        id: { not: review.id }
      },
      include: {
        reviewer: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      review,
      relatedReviews,
      permissions: {
        canEdit: ['admin', 'editor'].includes(userRole) || isAssignee,
        canAssign: ['admin', 'editor'].includes(userRole),
        canComplete: isAssignee || ['admin', 'editor'].includes(userRole),
        isAuthor
      }
    });

  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review details' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update review (assign reviewer, update status, add feedback)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const {
      assigneeId,
      status,
      feedback,
      score,
      checklist,
      notes
    } = validation.data;

    // Get current review - MUST include type for workflow stages
    const currentReview = await prisma.review.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        articleId: true,
        reviewerId: true,
        assigneeId: true,
        type: true, // CRITICAL: Required for currentStage computation
        status: true,
        createdAt: true,
        updatedAt: true,
        article: {
          select: { id: true, title: true, authorId: true }
        }
      }
    });

    if (!currentReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check permissions - field-level authorization
    const userRole = session.user.role || 'user';
    const isAssignee = currentReview.assigneeId === session.user.id;
    const isAuthor = currentReview.article.authorId === session.user.id;
    const canManage = ['admin', 'editor'].includes(userRole);
    
    // Only assigned reviewer or admin/editor can change status/score/assigneeId
    const canChangeReviewFields = canManage || isAssignee;
    
    // Authors can only add feedback/notes, cannot change review status
    if (!canManage && !isAssignee && !isAuthor) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Field-level authorization enforcement
    if ((assigneeId || status || score || checklist) && !canChangeReviewFields) {
      return NextResponse.json({ 
        error: 'Only assigned reviewers or editors can change review status and scoring' 
      }, { status: 403 });
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (assigneeId && canManage) {
      updateData.assigneeId = assigneeId;
    }

    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }

    if (score !== undefined) {
      updateData.score = score;
    }

    if (checklist) {
      updateData.checklist = JSON.stringify(checklist);
    }

    if (notes || assigneeId || status) {
      // Update metadata
      const currentMetadata = currentReview.metadata ? 
        JSON.parse(currentReview.metadata) : {};
      
      updateData.metadata = JSON.stringify({
        ...currentMetadata,
        ...(notes && { lastUpdate: notes }),
        ...(assigneeId && { assignedBy: session.user.id, assignedAt: new Date() }),
        lastModifiedBy: session.user.id,
        lastModifiedAt: new Date()
      });
    }

    // Use transaction for atomic updates
    const updatedReview = await prisma.$transaction(async (tx) => {
      // Update the review
      const review = await tx.review.update({
        where: { id: params.id },
        data: updateData,
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          reviewer: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Update review state if status changed - robust upsert
      if (status) {
        await tx.reviewState.upsert({
          where: { articleId: currentReview.articleId },
          update: {
            currentStage: status === 'completed' ? 'Completed' : `${currentReview.type} Review`,
            lastUpdatedAt: new Date()
          },
          create: {
            articleId: currentReview.articleId,
            currentStage: status === 'completed' ? 'Completed' : `${currentReview.type} Review`,
            overallStatus: 'In Progress',
            createdAt: new Date(),
            lastUpdatedAt: new Date()
          }
        });

        // Update article status based on review completion
        if (status === 'completed') {
          const allReviews = await tx.review.findMany({
            where: { articleId: currentReview.articleId }
          });

          const allCompleted = allReviews.every(r => r.status === 'completed');
          
          if (allCompleted) {
            await tx.article.update({
              where: { id: currentReview.articleId },
              data: { 
                status: 'approved',
                isPublished: true
              }
            });
          }
        }
      }

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'review_updated',
          targetType: 'Review',
          targetId: params.id,
          details: JSON.stringify({
            changes: updateData,
            articleId: currentReview.articleId
          })
        }
      });

      return review;
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}