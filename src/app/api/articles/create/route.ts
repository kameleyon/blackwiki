import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";
import { processArticleContent } from "@/lib/markdownCleaner";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const data = await request.json();
    const { title, content, summary, categories, tags, image, imageAlt } = data;

    // Create slug from title
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Clean and process the content before saving
    const cleanedContent = processArticleContent(content);
    const cleanedSummary = processArticleContent(summary);

    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        content: cleanedContent,
        summary: cleanedSummary,
        slug,
        image,
        imageAlt,
        authorId: user.id,
        status: "draft",
        // Connect existing categories
        categories: {
          connect: categories.map((id: string) => ({ id })),
        },
        // Create new tags if they don't exist
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag.trim() },
            create: { name: tag.trim() },
          })),
        },
      },
    });

    return NextResponse.json({
      message: "Article created successfully",
      articleId: article.id,
    });
  } catch (error) {
    console.error("Article creation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
