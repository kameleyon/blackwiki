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

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: params.articleId }
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Check if already watching
    const existingWatch = await prisma.watchlist.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: params.articleId
        }
      }
    });

    if (existingWatch) {
      return NextResponse.json({ error: "Already watching this article" }, { status: 400 });
    }

    // Add to watchlist
    const watchItem = await prisma.watchlist.create({
      data: {
        userId: user.id,
        articleId: params.articleId
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "article_watched",
        targetType: "Article",
        targetId: params.articleId,
        details: JSON.stringify({
          articleTitle: article.title
        })
      }
    });

    return NextResponse.json({
      message: "Article added to watchlist",
      watchItem
    });

  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Remove from watchlist
    const deletedWatch = await prisma.watchlist.delete({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: params.articleId
        }
      }
    });

    // Get article title for audit log
    const article = await prisma.article.findUnique({
      where: { id: params.articleId },
      select: { title: true }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "article_unwatched",
        targetType: "Article",
        targetId: params.articleId,
        details: JSON.stringify({
          articleTitle: article?.title
        })
      }
    });

    return NextResponse.json({
      message: "Article removed from watchlist"
    });

  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}