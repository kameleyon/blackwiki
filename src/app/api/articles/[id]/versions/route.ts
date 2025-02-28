import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Get all versions of an article
export async function GET(
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

    // Only allow author or admin to view versions
    if (article.author.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versions = await prisma.version.findMany({
      where: { articleId: params.id },
      orderBy: { number: 'desc' },
      include: {
        edit: {
          select: {
            type: true,
            summary: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Error fetching versions' },
      { status: 500 }
    );
  }
}

// Create a new version
export async function POST(
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

    // Only allow author or admin to create versions
    if (article.author.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, type = 'content', summary = null } = body;

    // Get the latest version number
    const latestVersion = await prisma.version.findFirst({
      where: { articleId: params.id },
      orderBy: { number: 'desc' },
    });

    const newVersionNumber = (latestVersion?.number || 0) + 1;

    // Create new version and edit in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const edit = await tx.edit.create({
        data: {
          content,
          type,
          summary,
          userId: user.id,
          articleId: params.id,
        },
      });

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

      return version;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Error creating version' },
      { status: 500 }
    );
  }
}
