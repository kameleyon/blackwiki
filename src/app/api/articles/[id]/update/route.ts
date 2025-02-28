import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Only allow author or admin to update
    if (article.author.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      summary,
      isPublished,
      categories,
      tags,
      editSummary = null,
    } = body;

    // Get the latest version number
    const latestVersion = await prisma.version.findFirst({
      where: { articleId: params.id },
      orderBy: { number: 'desc' },
    });

    const newVersionNumber = (latestVersion?.number || 0) + 1;

    // Update article and create version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create an edit record
      const edit = await tx.edit.create({
        data: {
          content,
          type: 'content',
          summary: editSummary,
          userId: user.id,
          articleId: params.id,
        },
      });

      // Create a new version
      const version = await tx.version.create({
        data: {
          number: newVersionNumber,
          content,
          articleId: params.id,
          editId: edit.id,
        },
      });

      // If this is not the first version, create a diff
      if (latestVersion) {
        await tx.diff.create({
          data: {
            changes: JSON.stringify({
              from: latestVersion.content,
              to: content,
            }),
            fromVersionId: latestVersion.id,
            toVersionId: version.id,
          },
        });
      }

      // Update the article
      const updatedArticle = await tx.article.update({
        where: { id: params.id },
        data: {
          title,
          content,
          summary,
          isPublished,
          categories: {
            set: [], // Clear existing categories
            connect: categories?.map((id: string) => ({ id })) || [],
          },
          tags: {
            set: [], // Clear existing tags
            connect: tags?.map((id: string) => ({ id })) || [],
          },
          updatedAt: new Date(),
        },
        include: {
          categories: true,
          tags: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return {
        article: updatedArticle,
        version,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Error updating article' },
      { status: 500 }
    );
  }
}
