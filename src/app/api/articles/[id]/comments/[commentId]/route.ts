import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

// PUT /api/articles/:id/comments/:commentId - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in to update a comment' },
      { status: 401 }
    );
  }

  const { commentId } = params;
  const { content } = await request.json();

  if (!content || content.trim() === '') {
    return NextResponse.json(
      { error: 'Comment content is required' },
      { status: 400 }
    );
  }

  try {
    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the comment exists and belongs to the user
    const comment = await prisma.$queryRaw`
      SELECT * FROM Comment 
      WHERE id = ${commentId} AND authorId = ${user.id}
    `;

    if (!Array.isArray(comment) || comment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found or you are not authorized to update it' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Update the comment
    await prisma.$executeRaw`
      UPDATE Comment
      SET content = ${content}, updatedAt = ${now}
      WHERE id = ${commentId}
    `;

    // Get the updated comment with author info
    const updatedComment = await prisma.$queryRaw`
      SELECT 
        c.id, c.content, c.createdAt, c.updatedAt, c.articleId, c.authorId, c.parentId, c.likes,
        u.name as authorName, u.image as authorImage
      FROM Comment c
      JOIN User u ON c.authorId = u.id
      WHERE c.id = ${commentId}
    `;

    if (!Array.isArray(updatedComment) || updatedComment.length === 0) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comment: updatedComment[0],
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/:id/comments/:commentId - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in to delete a comment' },
      { status: 401 }
    );
  }

  const { commentId } = params;

  try {
    // Get user ID and role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the comment exists
    const comment = await prisma.$queryRaw`
      SELECT * FROM Comment WHERE id = ${commentId}
    `;

    if (!Array.isArray(comment) || comment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if the user is the author or an admin
    const isAuthor = comment[0].authorId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this comment' },
        { status: 403 }
      );
    }

    // Delete the comment
    await prisma.$executeRaw`
      DELETE FROM Comment WHERE id = ${commentId}
    `;

    return NextResponse.json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
