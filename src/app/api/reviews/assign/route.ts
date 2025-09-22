import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const assignReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  assigneeId: z.string().min(1, 'Assignee ID is required'),
  notes: z.string().optional()
});

// POST /api/reviews/assign - Assign reviewer to review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and editors can assign reviews
    const userRole = session.user.role || 'user';
    if (!['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validation = assignReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { reviewId, assigneeId, notes } = validation.data;

    // Check if review exists  
    const currentReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        article: {
          select: { id: true, title: true, author: { select: { name: true, email: true } } }
        }
      }
    });

    if (!currentReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if assignee exists and has appropriate role
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId }
    });

    if (!assignee) {
      return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
    }

    if (!['editor', 'admin'].includes(assignee.role || '')) {
      return NextResponse.json({ 
        error: 'Can only assign to editors or admins' 
      }, { status: 400 });
    }

    // Use transaction for atomic assignment
    const updatedReview = await prisma.$transaction(async (tx) => {
      // Update the review with proper role semantics
      const review = await tx.review.update({
        where: { id: reviewId },
        data: {
          assigneeId, // Set the actual reviewer
          reviewerId: assigneeId, // Set reviewer to the assigned person
          status: 'in_progress',
          updatedAt: new Date(),
          metadata: JSON.stringify({
            ...(currentReview.metadata ? JSON.parse(currentReview.metadata) : {}),
            assignedBy: session.user.id,
            assignedAt: new Date(),
            assignmentNotes: notes || null
          })
        },
        include: {
          article: {
            select: { id: true, title: true, slug: true }
          },
          assignee: {
            select: { id: true, name: true, email: true, image: true }
          },
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Update reviewer reputation for being assigned
      await tx.user.update({
        where: { id: assigneeId },
        data: {
          reviewerReputation: {
            increment: 1
          }
        }
      });

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'review_assigned',
          targetType: 'Review',
          targetId: reviewId,
          details: JSON.stringify({
            assigneeId,
            assigneeName: assignee.name,
            articleTitle: currentReview.article?.title,
            notes
          })
        }
      });

      return review;
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: `Review assigned to ${assignee.name}`
    });

  } catch (error) {
    console.error('Review assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to assign review' },
      { status: 500 }
    );
  }
}

// GET /api/reviews/assign - Get available reviewers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and editors can see reviewer list
    const userRole = session.user.role || 'user';
    if (!['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reviewType = searchParams.get('type') || '';

    // Get available reviewers (editors and admins)
    const reviewers = await prisma.user.findMany({
      where: {
        role: {
          in: ['editor', 'admin']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        expertise: true,
        reviewerReputation: true,
        _count: {
          select: {
            reviewTasks: {
              where: {
                status: 'in_progress'
              }
            }
          }
        }
      },
      orderBy: [
        { reviewerReputation: 'desc' },
        { name: 'asc' }
      ]
    });

    // Calculate workload and availability
    const reviewersWithStats = reviewers.map(reviewer => ({
      ...reviewer,
      currentWorkload: reviewer._count.reviewTasks,
      isAvailable: reviewer._count.reviewTasks < 5, // Max 5 active reviews
      specializations: reviewer.expertise ? reviewer.expertise.split(',').map(s => s.trim()) : []
    }));

    return NextResponse.json({
      reviewers: reviewersWithStats,
      total: reviewers.length
    });

  } catch (error) {
    console.error('Reviewers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available reviewers' },
      { status: 500 }
    );
  }
}