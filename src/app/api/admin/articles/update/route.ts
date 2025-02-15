import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true,
      role: true 
    }
  });

  if (user?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const formData = await request.formData();
    const articleId = formData.get("articleId") as string;
    const status = formData.get("status") as string;
    const notes = formData.get("notes") as string;

    if (!articleId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate status
    const validStatuses = ["pending", "in review", "approved", "denied"];
    if (!validStatuses.includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Update article
    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        edits: {
          create: {
            content: notes || "Status updated by admin",
            summary: `Status changed to ${status}`,
            userId: user.id
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      article
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
