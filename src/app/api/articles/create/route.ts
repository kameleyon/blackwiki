import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";

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
    const { 
      title, 
      content, 
      summary, 
      categories = "", 
      tags = "",
      image = "",
      imageAlt = "",
      imageWidth = 0,
      imageHeight = 0
    } = data;

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create article with all data
    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        slug,
        authorId: user.id,
        image,
        imageAlt,
        imageWidth,
        imageHeight,
        isPublished: true,
        views: 0,
      },
    });

    // If categories provided, create/connect them
    if (categories.trim()) {
      await Promise.all(
        categories.split(',').map(async (name: string) => {
          const trimmedName = name.trim();
          if (trimmedName) {
            const category = await prisma.category.upsert({
              where: { name: trimmedName },
              create: { 
                name: trimmedName,
                description: null,
              },
              update: {},
            });
            await prisma.article.update({
              where: { id: article.id },
              data: {
                categories: {
                  connect: { id: category.id }
                }
              }
            });
          }
        })
      );
    }

    // If tags provided, create/connect them
    if (tags.trim()) {
      await Promise.all(
        tags.split(',').map(async (name: string) => {
          const trimmedName = name.trim();
          if (trimmedName) {
            const tag = await prisma.tag.upsert({
              where: { name: trimmedName },
              create: { name: trimmedName },
              update: {},
            });
            await prisma.article.update({
              where: { id: article.id },
              data: {
                tags: {
                  connect: { id: tag.id }
                }
              }
            });
          }
        })
      );
    }

    // Get the final article with all relations
    const finalArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json({
      message: "Article created successfully",
      article: finalArticle,
    });
  } catch (error) {
    console.error("Article creation error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
