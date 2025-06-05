import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db'; // Correct import
import { z } from 'zod';

// Schema for updating a review
const reviewUpdateSchema = z.object({
  status: z.string().optional(), // e.g., pending, in_progress, completed, rejected
  feedback: z.string().optional(),
  score: z.number().int().min(1).max(100).optional(), // Assuming a 1-100 score
  checklist: z.string().optional(), // JSON string
  metadata: z.string().optional(), // JSON string
});

// Define valid review statuses
const VALID_REVIEW_STATUSES = ['pending', 'in_progress', 'completed', 'rejected'];

export async function GET(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const review = await prisma.review.findUnique({ // Use prisma
      where: { id: params.reviewId },
      include: {
        article: { select: { id: true, title: true, slug: true } },
        reviewer: { select: { id: true, name: true, image: true } }, // User who assigned
        assignee: { select: { id: true, name: true, image: true } }, // User performing review
      },
    });

    if (!review) {
      return new NextResponse('Review not found', { status: 404 });
    }

    // Optional: Add authorization check if reviews should only be visible to involved parties/admins
    // const session = await getServerSession(); // Call without authOptions
    // if (session?.user?.id !== review.assigneeId && session?.user?.role !== 'admin') {
    //   return new NextResponse('Forbidden', { status: 403 });
    // }

    return NextResponse.json(review);
  } catch (error) {
    console.error('[REVIEW_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(); // Call without authOptions

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const review = await prisma.review.findUnique({ // Use prisma
      where: { id: params.reviewId },
      select: { assigneeId: true, status: true, articleId: true }, // Need articleId for audit log context
    });

    if (!review) {
      return new NextResponse('Review not found', { status: 404 });
    }

    // Authorization: Allow only the assignee or an admin to update the review
    if (session.user.id !== review.assigneeId && session.user.role !== 'admin') {
      return new NextResponse('Forbidden: Only the assignee or an admin can update this review.', { status: 403 });
    }

    const body = await request.json();
    const validation = reviewUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.errors), {
        status: 400,
      });
    }

    const { status, feedback, score, checklist, metadata } = validation.data;
    const updateData: any = {};
    const auditDetails: any = { reviewId: params.reviewId };

    if (status) {
      if (!VALID_REVIEW_STATUSES.includes(status)) {
        return new NextResponse(`Invalid status value: ${status}`, { status: 400 });
      }
      updateData.status = status;
      auditDetails.oldStatus = review.status;
      auditDetails.newStatus = status;
      // Mark completion time if status is 'completed' or 'rejected'
      if ((status === 'completed' || status === 'rejected') && review.status !== status) {
        updateData.completedAt = new Date();
      }
    }
    if (feedback !== undefined) {
      updateData.feedback = feedback;
      auditDetails.feedbackUpdated = true;
    }
    if (score !== undefined) {
      updateData.score = score;
      auditDetails.score = score;
    }
     if (checklist !== undefined) {
      updateData.checklist = checklist;
      auditDetails.checklistUpdated = true;
    }
     if (metadata !== undefined) {
      updateData.metadata = metadata;
      auditDetails.metadataUpdated = true;
    }

    if (Object.keys(updateData).length === 0) {
      return new NextResponse('No valid fields provided for update', { status: 400 });
    }

    // Update the review
    const updatedReview = await prisma.review.update({ // Use prisma
      where: { id: params.reviewId },
      data: updateData,
    });

    // Create an audit log entry
    await prisma.auditLog.create({ // Use prisma
      data: {
        action: 'review_updated',
        targetType: 'Review',
        targetId: params.reviewId,
        userId: session.user.id,
        details: JSON.stringify({
          ...auditDetails,
          articleId: review.articleId, // Add article context
        }),
      },
    });

    // TODO: Potentially trigger next steps in the workflow based on status change
    // e.g., if 'completed', update ReviewState or Article status

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('[REVIEW_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Optional DELETE handler (consider implications carefully)
/*
export async function DELETE(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(); // Call without authOptions

    if (!session?.user?.id || session.user.role !== 'admin') {
      return new NextResponse('Forbidden: Only admins can delete reviews.', { status: 403 });
    }

    const review = await prisma.review.findUnique({ // Use prisma
      where: { id: params.reviewId },
      select: { id: true, articleId: true, type: true, assigneeId: true } // For audit log
    });

    if (!review) {
      return new NextResponse('Review not found', { status: 404 });
    }

    await prisma.review.delete({ // Use prisma
      where: { id: params.reviewId },
    });

    // Create an audit log entry
    await prisma.auditLog.create({ // Use prisma
      data: {
        action: 'review_deleted',
        targetType: 'Review',
        targetId: params.reviewId,
        userId: session.user.id,
        details: JSON.stringify({
          articleId: review.articleId,
          reviewType: review.type,
          assigneeId: review.assigneeId,
        }),
      },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('[REVIEW_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
*/
