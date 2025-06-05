import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.string().min(1, { message: 'Status cannot be empty' }),
  // Add other potential fields related to status change if needed, e.g., reason
});

// Define valid article statuses based on schema comments
const VALID_STATUSES = [
  'draft',
  'pending_review',
  'technical_review',
  'editorial_review',
  'final_review',
  'changes_requested',
  'approved',
  'rejected',
  'archived',
];

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.article.findUnique({ // Use prisma
      where: { slug: params.slug },
      select: { status: true },
    });

    if (!article) {
      return new NextResponse('Article not found', { status: 404 });
    }

    return NextResponse.json({ status: article.status });
  } catch (error) {
    console.error('[ARTICLE_STATUS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(); // Call without authOptions

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Authorization check: Allow admins or potentially specific roles later
    // For now, restricting to admin for simplicity
    if (session.user.role !== 'admin') {
      // TODO: Implement more granular role-based access control for status changes
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.errors), {
        status: 400,
      });
    }

    const { status } = validation.data;

    if (!VALID_STATUSES.includes(status)) {
      return new NextResponse(`Invalid status value: ${status}`, { status: 400 });
    }

    const article = await prisma.article.findUnique({ // Use prisma
      where: { slug: params.slug },
      select: { id: true, status: true }, // Select current status for audit log
    });

    if (!article) {
      return new NextResponse('Article not found', { status: 404 });
    }

    const oldStatus = article.status;

    // Update the article status
    const updatedArticle = await prisma.article.update({ // Use prisma
      where: { slug: params.slug },
      data: {
        status: status,
        // Potentially update isPublished based on status
        isPublished: status === 'approved',
        isArchived: status === 'archived',
      },
    });

    // Create an audit log entry
    await prisma.auditLog.create({ // Use prisma
      data: {
        action: 'article_status_changed',
        targetType: 'Article',
        targetId: article.id,
        userId: session.user.id,
        details: JSON.stringify({
          oldStatus: oldStatus,
          newStatus: status,
          slug: params.slug,
        }),
      },
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('[ARTICLE_STATUS_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
