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

    // Validate stage data
    const validStages = ['technical', 'editorial', 'final'];
    if (!validStages.includes(currentStage)) {
      return NextResponse.json({ error: 'Invalid current stage' }, { status: 400 });
    }

    for (const [type, stage] of Object.entries(stages)) {
      if (!validStages.includes(type)) {
        return NextResponse.json({ error: `Invalid stage type: ${type}` }, { status: 400 });
      }
      
      const validStatuses = ['pending', 'in_progress', 'completed', 'blocked'];
      if (!validStatuses.includes(stage.status)) {
        return NextResponse.json({ error: `Invalid status: ${stage.status}` }, { status: 400 });
      }
      
      // Validate score if provided
      if (stage.score !== null && stage.score !== undefined && (stage.score < 1 || stage.score > 100)) {
        return NextResponse.json({ error: 'Score must be between 1 and 100' }, { status: 400 });
      }
    }

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

      // Track changes for audit logging
      const auditDetails: any = {
        articleId: params.id,
        currentStage,
        stagesUpdated: Object.keys(stages),
      };

      // Update reviews for each stage
      for (const [type, stage] of Object.entries(stages)) {
        const existingReview = article.reviews.find(r => r.type === type);
        
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
            ...(stage.status === 'completed' && !existingReview?.completedAt ? { completedAt: new Date() } : {}),
          },
        });

        // Track significant changes
        if (existingReview?.status !== stage.status) {
          auditDetails[`${type}_status_change`] = {
            from: existingReview?.status || 'none',
            to: stage.status
          };
        }
      }

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'review_state_updated',
          targetType: 'Article',
          targetId: params.id,
          details: JSON.stringify(auditDetails),
        },
      });

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
