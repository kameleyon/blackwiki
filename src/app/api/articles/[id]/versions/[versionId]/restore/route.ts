import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
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

    // Only allow author or admin to restore versions
    if (article.author.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the version to restore
    const versionToRestore = await prisma.version.findUnique({
      where: { id: params.versionId },
    });

    if (!versionToRestore) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Get the latest version number
    const latestVersion = await prisma.version.findFirst({
      where: { articleId: params.id },
      orderBy: { number: 'desc' },
    });

    const newVersionNumber = (latestVersion?.number || 0) + 1;

    // Create new version and edit in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create an edit record for the restore action
      const edit = await tx.edit.create({
        data: {
          content: versionToRestore.content,
          type: 'restore',
          summary: `Restored version ${versionToRestore.number}`,
          userId: user.id,
          articleId: params.id,
        },
      });

      // Create a new version with the restored content
      const version = await tx.version.create({
        data: {
          number: newVersionNumber,
          content: versionToRestore.content,
          articleId: params.id,
          editId: edit.id,
        },
      });

      // Create a diff between the current and restored versions
      if (latestVersion) {
        await tx.diff.create({
          data: {
            changes: JSON.stringify({
              from: latestVersion.content,
              to: versionToRestore.content,
            }),
            fromVersionId: latestVersion.id,
            toVersionId: version.id,
          },
        });
      }

      // Update the article content
      await tx.article.update({
        where: { id: params.id },
        data: {
          content: versionToRestore.content,
          updatedAt: new Date(),
        },
      });

      return version;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error restoring version:', error);
    return NextResponse.json(
      { error: 'Error restoring version' },
      { status: 500 }
    );
  }
}
