import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { checkArticleFacts } from "@/lib/factChecker";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, content } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const result = await checkArticleFacts(title, content);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to check facts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Fact check completed",
      analysis: result.analysis,
    });
  } catch (error) {
    console.error("Fact checking error:", error);
    return NextResponse.json(
      { error: "Failed to check facts" },
      { status: 500 }
    );
  }
}
