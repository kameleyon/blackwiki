import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all reviews that are either unassigned or assigned to the current user
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { assigneeId: null },
          { assigneeId: session.user.id }
        ],
        status: {
          in: ["pending", "in_progress"]
        }
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            summary: true,
            content: true,
            categories: {
              select: {
                name: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { 
          article: {
            reviewState: {
              priority: "desc"
            }
          }
        },
        { createdAt: "desc" }
      ]
    });

    // Transform the data for the frontend
    const reviewTasks = reviews.map(review => {
      const wordCount = review.article.content.split(/\s+/).length;
      const estimatedTime = Math.ceil(wordCount / 200) + " min"; // Assuming 200 words per minute reading speed
      
      return {
        id: review.id,
        articleId: review.article.id,
        articleTitle: review.article.title,
        articleSummary: review.article.summary,
        type: review.type,
        priority: "normal", // Default priority, will be updated when reviewState is available
        status: review.status,
        dueDate: null, // Will be populated from reviewState if available
        assigneeId: review.assigneeId,
        assigneeName: review.assignee?.name,
        createdAt: review.createdAt.toISOString(),
        wordCount,
        category: review.article.categories[0]?.name || "General",
        estimatedTime
      };
    });

    // Fetch review states for priority and due dates
    const articleIds = reviewTasks.map(task => task.articleId);
    const reviewStates = await prisma.reviewState.findMany({
      where: {
        articleId: {
          in: articleIds
        }
      }
    });

    // Map review states to tasks
    const reviewStateMap = new Map(reviewStates.map(state => [state.articleId, state]));
    
    const enrichedTasks = reviewTasks.map(task => {
      const reviewState = reviewStateMap.get(task.articleId);
      if (reviewState) {
        task.priority = reviewState.priority;
        task.dueDate = reviewState.dueDate?.toISOString() || null;
      }
      return task;
    });

    return NextResponse.json(enrichedTasks);
  } catch (error) {
    console.error("Error fetching community reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}