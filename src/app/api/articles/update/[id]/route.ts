import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const [session, data] = await Promise.all([
      getServerSession(),
      request.json(),
    ]);
    
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

    const { title, content, summary, categories, tags, image, imageAlt } = data;
    const articleId = context.params.id;

    // Verify article ownership
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        authorId: user.id,
      },
    });

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    // Create slug from title if it changed
    let slug = article.slug;
    if (title !== article.title) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await prisma.article.findFirst({ 
        where: { 
          slug,
          id: { not: articleId } // Exclude current article
        } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Update article
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        content,
        summary,
        slug,
        image,
        imageAlt,
        updatedAt: new Date(),
        // Update categories
        categories: {
          set: [], // Clear existing
          connect: categories.map((id: string) => ({ id })),
        },
        // Update tags
        tags: {
          set: [], // Clear existing
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag.trim() },
            create: { name: tag.trim() },
          })),
        },
      },
    });

    return NextResponse.json({
      message: "Article updated successfully",
      articleId: updatedArticle.id,
    });
  } catch (error) {
    console.error("Article update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
