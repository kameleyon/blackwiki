import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Ensure the user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body as JSON
    const body = await request.json();
    const { title, content, categories, tags, imageUrl: image } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    // Generate a summary and slug for the article
    const summary = content.slice(0, 150); // first 150 characters as summary
    const slug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();

    // Create a new article in the database, ensuring categories and tags have default values if not provided.
    // Use null for the image field if no imageUrl is provided.
    try {
      const article = await prisma.article.create({
        data: {
          title,
          content,
          categories: categories || "",
          tags: tags || "",
          image,
          authorId: user.id,
          status: "pending", // Set default article status as pending
          summary,
          slug,
        },
      });
      return NextResponse.json(article, { status: 201 });
    } catch (dbError: any) {
      console.error("Database error creating article:", dbError);
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ error: "Failed to create article." }, { status: 500 });
  }
}
