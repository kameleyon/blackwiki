import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow editors and admins to view the review queue
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    const search = searchParams.get('search'); // Search in article title and content
    const type = searchParams.get('type'); // 'technical', 'editorial', 'final'
    const status = searchParams.get('status'); // 'pending', 'in_progress', 'completed', 'rejected'
    const priority = searchParams.get('priority'); // 'low', 'normal', 'high', 'urgent'
    const assignedTo = searchParams.get('assignedTo'); // 'me', 'unassigned', userId
    const category = searchParams.get('category');
    const dueDate = searchParams.get('dueDate'); // 'overdue', 'today', 'week'
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    // Build where conditions
    const whereConditions: any = {};
    
    if (type) whereConditions.type = type;
    if (status) whereConditions.status = status;
    
    if (assignedTo === 'me') {
      whereConditions.assigneeId = user.id;
    } else if (assignedTo === 'unassigned') {
      whereConditions.assigneeId = null;
    } else if (assignedTo && assignedTo !== 'all') {
      whereConditions.assigneeId = assignedTo;
    }

    // Handle article filtering
    const articleWhere: any = {};
    
    if (search) {
      articleWhere.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          summary: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    if (category) {
      articleWhere.categories = {
        some: {
          name: {
            contains: category,
            mode: 'insensitive'
          }
        }
      };
    }

    // Handle review state filtering
    let reviewStateWhere: any = {};
    if (priority) {
      reviewStateWhere.priority = priority;
    }

    if (dueDate) {
      const now = new Date();
      if (dueDate === 'overdue') {
        reviewStateWhere.dueDate = {
          lt: now
        };
      } else if (dueDate === 'today') {
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        reviewStateWhere.dueDate = {
          gte: todayStart,
          lte: todayEnd
        };
      } else if (dueDate === 'week') {
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        reviewStateWhere.dueDate = {
          lte: weekFromNow
        };
      }
    }

    // Combine filters for articles with review states
    if (Object.keys(reviewStateWhere).length > 0) {
      articleWhere.reviewState = reviewStateWhere;
    }

    // Build orderBy
    const orderBy: any = {};
    if (sort === 'priority') {
      orderBy.article = {
        reviewState: {
          priority: order
        }
      };
    } else if (sort === 'dueDate') {
      orderBy.article = {
        reviewState: {
          dueDate: order
        }
      };
    } else if (sort === 'title') {
      orderBy.article = {
        title: order
      };
    } else {
      orderBy[sort] = order;
    }

    // Get total count
    const totalCount = await prisma.review.count({
      where: {
        ...whereConditions,
        article: Object.keys(articleWhere).length > 0 ? articleWhere : undefined,
      },
    });

    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where: {
        ...whereConditions,
        article: Object.keys(articleWhere).length > 0 ? articleWhere : undefined,
      },
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
      orderBy,
      skip: offset,
      take: limit,
    });

    // Get summary statistics
    const stats = await prisma.review.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where: whereConditions,
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        statusCounts,
        totalReviews: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to create reviews
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { articleId, type, assigneeId, priority = 'normal', dueDate } = body;

    // Validate required fields
    if (!articleId || !type || !assigneeId) {
      return NextResponse.json(
        { error: 'Missing required fields: articleId, type, assigneeId' },
        { status: 400 }
      );
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if assignee exists and has permission
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

    const result = await prisma.$transaction(async (tx) => {
      // Create or update review
      const review = await tx.review.upsert({
        where: {
          articleId_type: {
            articleId,
            type,
          },
        },
        create: {
          articleId,
          type,
          status: 'pending',
          reviewerId: user.id,
          assigneeId,
        },
        update: {
          assigneeId,
          status: 'pending',
          updatedAt: new Date(),
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
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

      // Update or create review state
      await tx.reviewState.upsert({
        where: { articleId },
        create: {
          articleId,
          currentStage: type,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          startedAt: new Date(),
          lastUpdatedAt: new Date(),
        },
        update: {
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          lastUpdatedAt: new Date(),
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'review_assigned',
          targetType: 'Review',
          targetId: review.id,
          details: JSON.stringify({
            articleId,
            type,
            assigneeId,
            assigneeName: assignee.name,
            priority,
            dueDate,
          }),
        },
      });

      return review;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}