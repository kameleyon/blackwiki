import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const filter = searchParams.get("filter") || "all";
    const timeRange = searchParams.get("timeRange") || "24h";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 50;

    // Calculate time filter
    let timeFilter: Date | undefined;
    const now = new Date();
    
    switch (timeRange) {
      case "1h":
        timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = undefined;
    }

    // Build where clause
    const whereClause: any = {};
    
    if (timeFilter) {
      whereClause.timestamp = {
        gte: timeFilter
      };
    }

    if (articleId) {
      whereClause.targetId = articleId;
      whereClause.targetType = "Article";
    }

    if (filter !== "all") {
      switch (filter) {
        case "articles":
          whereClause.action = {
            in: ["article_created", "article_updated", "article_status_changed", "article_deleted"]
          };
          break;
        case "users":
          whereClause.action = {
            in: ["user_registered", "user_role_changed", "user_profile_updated"]
          };
          break;
        case "reviews":
          whereClause.action = {
            in: ["review_assigned", "review_completed", "review_submitted"]
          };
          break;
      }
    }

    // Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: "desc"
      },
      take: limit
    });

    // Transform the data
    const changes = auditLogs.map(log => {
      const details = log.details ? JSON.parse(log.details) : {};
      
      return {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        user: {
          id: log.user?.id || "system",
          name: log.user?.name || "System"
        },
        action: log.action,
        targetType: log.targetType || "Unknown",
        targetId: log.targetId || "",
        details: {
          articleTitle: details.articleTitle,
          changeSize: details.changeSize || details.wordCountDiff,
          editSummary: details.editSummary || details.summary,
          changeType: details.changeType || details.type,
          oldValue: details.oldValue || details.previousValue,
          newValue: details.newValue || details.newValue
        }
      };
    });

    return NextResponse.json(changes);

  } catch (error) {
    console.error("Error fetching changes:", error);
    return NextResponse.json(
      { error: "Failed to fetch changes" },
      { status: 500 }
    );
  }
}