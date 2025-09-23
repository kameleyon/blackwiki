import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's watchlist with article details
    const watchlist = await prisma.watchlist.findMany({
      where: {
        userId: user.id
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            summary: true,
            slug: true,
            status: true,
            views: true,
            likes: true,
            updatedAt: true,
            author: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // For each watched article, check if there are unread changes
    const watchlistWithStatus = await Promise.all(
      watchlist.map(async (watch) => {
        // Find the latest change after the user added the article to watchlist
        const latestChange = await prisma.auditLog.findFirst({
          where: {
            targetType: "Article",
            targetId: watch.articleId,
            timestamp: {
              gt: watch.createdAt
            }
          },
          orderBy: {
            timestamp: "desc"
          }
        });

        return {
          ...watch,
          hasUnreadChanges: !!latestChange,
          lastChangeDate: latestChange?.timestamp?.toISOString() || watch.article.updatedAt.toISOString()
        };
      })
    );

    return NextResponse.json(watchlistWithStatus);

  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}