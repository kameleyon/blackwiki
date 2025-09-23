import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { articleId: string } }
) {
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

    // Update the watchlist item's timestamp to mark as "read"
    // This will be used to determine unread changes
    const updatedWatch = await prisma.watchlist.update({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: params.articleId
        }
      },
      data: {
        // Add a "lastRead" field to track when user last checked the article
        // For now, we'll update the createdAt to simulate this
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      message: "Article marked as read",
      updatedWatch
    });

  } catch (error) {
    console.error("Error marking article as read:", error);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}