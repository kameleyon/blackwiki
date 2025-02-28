import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET: List all branches for an article
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
            name: true,
            image: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get all branches for this article
    const branches = await prisma.branch.findMany({
      where: { articleId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        mergedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Error fetching branches' },
      { status: 500 }
    );
  }
}

// POST: Create a new branch
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

    // Check if user has permission to create a branch
    // Only article author or collaborators can create branches
    const isAuthor = article.authorId === user.id;
    if (!isAuthor && user.role !== 'admin') {
      // TODO: Check if user is a collaborator
      // For now, only allow author and admin
      return NextResponse.json(
        { error: 'You do not have permission to create branches for this article' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, baseBranchId } = body;

    // Validate branch name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      );
    }

    // Check if branch name already exists for this article
    const existingBranch = await prisma.branch.findFirst({
      where: {
        articleId: params.id,
        name: name.trim(),
      },
    });

    if (existingBranch) {
      return NextResponse.json(
        { error: 'A branch with this name already exists' },
        { status: 400 }
      );
    }

    // Start a transaction to create the branch and associate versions
    const result = await prisma.$transaction(async (tx) => {
      // Check if this is the first branch for the article
      const branchCount = await tx.branch.count({
        where: { articleId: params.id },
      });

      const isDefault = branchCount === 0;

      // Create the new branch
      const newBranch = await tx.branch.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          articleId: params.id,
          userId: user.id,
          isDefault,
        },
      });

      // If a base branch is specified, copy its latest version to the new branch
      if (baseBranchId) {
        const baseBranch = await tx.branch.findUnique({
          where: { id: baseBranchId },
          include: {
            versions: {
              orderBy: { number: 'desc' },
              take: 1,
            },
          },
        });

        if (baseBranch && baseBranch.versions.length > 0) {
          const latestVersion = baseBranch.versions[0];
          
          // Create a new version in the new branch based on the latest version of the base branch
          const newVersion = await tx.version.create({
            data: {
              number: 1, // Start with version 1 in the new branch
              content: latestVersion.content,
              articleId: params.id,
              branchId: newBranch.id,
            },
          });

          // Create a branch version association
          await tx.branchVersion.create({
            data: {
              branchId: newBranch.id,
              versionId: newVersion.id,
            },
          });
        }
      } else if (isDefault) {
        // If this is the default branch and no base branch is specified,
        // create an initial version with the article's current content
        const newVersion = await tx.version.create({
          data: {
            number: 1,
            content: article.content,
            articleId: params.id,
            branchId: newBranch.id,
          },
        });

        // Create a branch version association
        await tx.branchVersion.create({
          data: {
            branchId: newBranch.id,
            versionId: newVersion.id,
          },
        });
      }

      return newBranch;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'Error creating branch' },
      { status: 500 }
    );
  }
}
