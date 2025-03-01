import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import * as diff from 'diff';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;
    const { searchParams } = new URL(request.url);
    const fromVersionId = searchParams.get('fromVersion');
    const toVersionId = searchParams.get('toVersion');

    if (!fromVersionId || !toVersionId) {
      return NextResponse.json(
        { error: 'Both fromVersion and toVersion parameters are required' },
        { status: 400 }
      );
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if versions exist
    const fromVersion = await prisma.version.findUnique({
      where: { id: fromVersionId },
      include: {
        edit: {
          select: {
            summary: true,
            type: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const toVersion = await prisma.version.findUnique({
      where: { id: toVersionId },
      include: {
        edit: {
          select: {
            summary: true,
            type: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!fromVersion || !toVersion) {
      return NextResponse.json(
        { error: 'One or both versions not found' },
        { status: 404 }
      );
    }

    // Check if diff already exists in the database
    let diffRecord = await prisma.diff.findFirst({
      where: {
        fromVersionId,
        toVersionId,
      },
    });

    if (!diffRecord) {
      // Calculate diff
      const changes = diff.diffLines(fromVersion.content, toVersion.content);
      
      // Store diff in database
      diffRecord = await prisma.diff.create({
        data: {
          changes: JSON.stringify(changes),
          fromVersionId,
          toVersionId,
        },
      });
    }

    // Parse changes if stored as string
    const parsedChanges = typeof diffRecord.changes === 'string' 
      ? JSON.parse(diffRecord.changes) 
      : diffRecord.changes;

    return NextResponse.json({
      id: diffRecord.id,
      changes: parsedChanges,
      fromVersion: {
        id: fromVersion.id,
        number: fromVersion.number,
        createdAt: fromVersion.createdAt,
        edit: fromVersion.edit,
      },
      toVersion: {
        id: toVersion.id,
        number: toVersion.number,
        createdAt: toVersion.createdAt,
        edit: toVersion.edit,
      },
    });
  } catch (error) {
    console.error('Error generating diff:', error);
    return NextResponse.json(
      { error: 'Failed to generate diff comparison' },
      { status: 500 }
    );
  }
}
