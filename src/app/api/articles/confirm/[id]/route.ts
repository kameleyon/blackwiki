import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const [session, formData] = await Promise.all([
      getServerSession(),
      request.formData(),
    ]);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const action = formData.get("action") as string;
    const articleId = context.params.id;

    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        authorId: session.user.id,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (action === "confirm") {
      // Update article status to "in review"
      await prisma.article.update({
        where: { id: articleId },
        data: {
          status: "in review",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Article submitted for review",
        redirect: "/dashboard",
      });
    } else if (action === "cancel") {
      // Delete the article
      await prisma.article.delete({
        where: { id: articleId },
      });

      return NextResponse.json({
        message: "Article cancelled",
        redirect: "/dashboard",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Article confirmation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
