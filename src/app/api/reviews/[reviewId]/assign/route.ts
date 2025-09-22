import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow editors and admins to assign reviews
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { assigneeId } = body;

    if (!assigneeId) {
      return NextResponse.json({ error: 'assigneeId is required' }, { status: 400 });
    }

    // Verify the review exists
    const review = await prisma.review.findUnique({
      where: { id: params.reviewId },
      select: {
        id: true,
        articleId: true,
        type: true,
        status: true,
        assigneeId: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Verify the assignee exists and has permission
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: { id: true, role: true, name: true },
    });

    if (!assignee || (assignee.role !== 'editor' && assignee.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Assignee must be an editor or admin' },
        { status: 400 }
      );
    }

    // Update the review assignment
    const updatedReview = await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: params.reviewId },
        data: {
          assigneeId,
          status: review.status === 'pending' ? 'in_progress' : review.status,
          updatedAt: new Date(),
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              categories: {
                select: {
                  id: true,
                  name: true,
                },
              },
              reviewState: {
                select: {
                  currentStage: true,
                  priority: true,
                  dueDate: true,
                  isBlocked: true,
                  blockReason: true,
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'review_assigned',
          targetType: 'Review',
          targetId: params.reviewId,
          details: JSON.stringify({
            reviewId: params.reviewId,
            articleId: review.articleId,
            reviewType: review.type,
            assigneeId,
            assigneeName: assignee.name,
            previousAssigneeId: review.assigneeId,
            statusChange: review.status !== updated.status ? {
              from: review.status,
              to: updated.status,
            } : null,
          }),
        },
      });

      return updated;
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error assigning review:', error);
    return NextResponse.json(
      { error: 'Failed to assign review' },
      { status: 500 }
    );
  }
}

// Allow self-assignment via POST for convenience
export async function POST(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow editors and admins to self-assign
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create a new request with the current user as assignee
    const selfAssignRequest = new Request(request.url, {
      method: 'PUT',
      headers: request.headers,
      body: JSON.stringify({ assigneeId: user.id }),
    });

    return PUT(selfAssignRequest, { params });
  } catch (error) {
    console.error('Error self-assigning review:', error);
    return NextResponse.json(
      { error: 'Failed to self-assign review' },
      { status: 500 }
    );
  }
}