import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { type Article } from '@prisma/client';

// Define the review stage data type
interface ReviewStageData {
  status: string;
  feedback: string | null;
  score: number | null;
  blockReason?: string;
  checklist: { id: string; label: string; completed: boolean }[];
}

type ReviewWithUser = {
  id: string;
  type: string;
  status: string;
  feedback: string | null;
  score: number | null;
  checklist: string;
  metadata: string | null;
  reviewerId: string;
  assigneeId: string;
  reviewer: {
    id: string;
    name: string | null;
    image: string | null;
  };
  assignee: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type ArticleWithRelations = Article & {
  reviewState: {
    id: string;
    articleId: string;
    currentStage: string;
    startedAt: Date;
    lastUpdatedAt: Date;
  } | null;
  reviews: Array<ReviewWithUser>;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        reviewState: true,
        reviews: {
          include: {
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
        },
      },
    }) as ArticleWithRelations | null;

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Only allow author, reviewers, or admin to view review state
    const isReviewer = article.reviews.some(
      (review) => review.reviewerId === user.id || review.assigneeId === user.id
    );
    if (
      article.authorId !== user.id &&
      !isReviewer &&
      user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      currentStage: article.reviewState?.currentStage || 'technical',
      stages: article.reviews.reduce<Record<string, ReviewStageData>>((acc, review) => {
        const stageData: ReviewStageData = {
          status: review.status,
          feedback: review.feedback,
          score: review.score,
          blockReason: review.metadata ? (JSON.parse(review.metadata) as { blockReason?: string }).blockReason : undefined,
          checklist: review.checklist ? JSON.parse(review.checklist) : [],
        };
        return { ...acc, [review.type]: stageData };
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching review state:', error);
    return NextResponse.json(
      { error: 'Error fetching review state' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        reviewState: true,
        reviews: {
          include: {
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
        },
      },
    }) as ArticleWithRelations | null;

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Only allow reviewers or admin to update review state
    const isReviewer = article.reviews.some(
      (review) => review.reviewerId === user.id || review.assigneeId === user.id
    );
    if (!isReviewer && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentStage, stages } = body as {
      currentStage: string;
      stages: Record<string, ReviewStageData>;
    };

    // Update review state in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or create review state
      const reviewState = await tx.reviewState.upsert({
        where: { articleId: params.id },
        create: {
          articleId: params.id,
          currentStage,
          startedAt: new Date(),
          lastUpdatedAt: new Date(),
        },
        update: {
          currentStage,
          lastUpdatedAt: new Date(),
        },
      });

      // Update reviews for each stage
      for (const [type, stage] of Object.entries(stages)) {
        await tx.review.upsert({
          where: {
            articleId_type: {
              articleId: params.id,
              type,
            },
          },
          create: {
            articleId: params.id,
            type,
            status: stage.status,
            feedback: stage.feedback,
            score: stage.score,
            checklist: JSON.stringify(stage.checklist),
            metadata: JSON.stringify({ blockReason: stage.blockReason }),
            reviewerId: user.id,
            assigneeId: user.id, // For now, assign to self
          },
          update: {
            status: stage.status,
            feedback: stage.feedback,
            score: stage.score,
            checklist: JSON.stringify(stage.checklist),
            metadata: JSON.stringify({ blockReason: stage.blockReason }),
          },
        });
      }

      return reviewState;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating review state:', error);
    return NextResponse.json(
      { error: 'Error updating review state' },
      { status: 500 }
    );
  }
}
