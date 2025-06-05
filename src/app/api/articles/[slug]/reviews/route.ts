import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db'; // Correct import
import { z } from 'zod';

// Schema for creating a new review assignment
const reviewCreateSchema = z.object({
  reviewerId: z.string().cuid({ message: 'Invalid reviewer ID' }),
  assigneeId: z.string().cuid({ message: 'Invalid assignee ID' }), // User assigned to perform the review
  type: z.string().min(1, { message: 'Review type cannot be empty' }), // e.g., technical, editorial, final
  // Optional fields like checklist template, initial metadata
  metadata: z.string().optional(),
  checklist: z.string().optional(), // JSON string
});

// Define valid review types
const VALID_REVIEW_TYPES = ['technical', 'editorial', 'final']; // Add more as needed

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.article.findUnique({ // Use prisma
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!article) {
      return new NextResponse('Article not found', { status: 404 });
    }

    const reviews = await prisma.review.findMany({ // Use prisma
      where: { articleId: article.id },
      include: {
        reviewer: { select: { id: true, name: true, image: true } }, // User who assigned
        assignee: { select: { id: true, name: true, image: true } }, // User who will perform
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[ARTICLE_REVIEWS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(); // Call without authOptions

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Authorization: Allow admins or potentially editors/owners to assign reviews
    // Restricting to admin for now
    if (session.user.role !== 'admin') {
      // TODO: Implement more granular role-based access control
      return new NextResponse('Forbidden', { status: 403 });
    }

    const article = await prisma.article.findUnique({ // Use prisma
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!article) {
      return new NextResponse('Article not found', { status: 404 });
    }

    const body = await request.json();
    const validation = reviewCreateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.errors), {
        status: 400,
      });
    }

    const { reviewerId, assigneeId, type, metadata, checklist } = validation.data;

    // Validate review type
    if (!VALID_REVIEW_TYPES.includes(type)) {
      return new NextResponse(`Invalid review type: ${type}`, { status: 400 });
    }

    // Check if a review of this type already exists for the article
    const existingReview = await prisma.review.findUnique({ // Use prisma
      where: {
        articleId_type: {
          articleId: article.id,
          type: type,
        },
      },
    });

    if (existingReview) {
      return new NextResponse(`A review of type '${type}' already exists for this article.`, { status: 409 }); // Conflict
    }

    // Create the new review assignment
    const newReview = await prisma.review.create({ // Use prisma
      data: {
        articleId: article.id,
        reviewerId: reviewerId, // Could be the assigning user (session.user.id) or specified
        assigneeId: assigneeId,
        type: type,
        status: 'pending', // Initial status
        metadata: metadata,
        checklist: checklist,
      },
    });

    // Create an audit log entry
    await prisma.auditLog.create({ // Use prisma
      data: {
        action: 'review_assigned',
        targetType: 'Review',
        targetId: newReview.id,
        userId: session.user.id, // User who assigned the review
        details: JSON.stringify({
          articleId: article.id,
          articleSlug: params.slug,
          assigneeId: assigneeId,
          reviewType: type,
        }),
      },
    });

    // Optionally, update the article status if assigning the first review
    // e.g., if status was 'draft', change to 'pending_review'
    // await prisma.article.update({ where: { id: article.id }, data: { status: 'pending_review' } }); // Use prisma

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('[ARTICLE_REVIEWS_POST]', error);
    // Handle potential Prisma errors like unique constraint violation if needed
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
