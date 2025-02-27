import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

// POST /api/articles/:id/comments/:commentId/like - Like a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const resolvedParams = await params;
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in to like a comment' },
      { status: 401 }
    );
  }

  const { commentId } = resolvedParams;

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

    // Check if the CommentLike table exists
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='CommentLike'
    `;

    if (!Array.isArray(tableExists) || tableExists.length === 0) {
      // Create the CommentLike table if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE CommentLike (
          id TEXT PRIMARY KEY,
          commentId TEXT NOT NULL,
          userId TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (commentId) REFERENCES Comment(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
          UNIQUE(commentId, userId)
        )
      `;
    }

    // Check if the user has already liked the comment
    const existingLike = await prisma.$queryRaw`
      SELECT * FROM CommentLike 
      WHERE commentId = ${commentId} AND userId = ${user.id}
    `;

    if (Array.isArray(existingLike) && existingLike.length > 0) {
      return NextResponse.json({
        message: 'You have already liked this comment',
      });
    }

    // Generate a unique ID for the like
    const likeId = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    // Create the like
    await prisma.$executeRaw`
      INSERT INTO CommentLike (id, commentId, userId, createdAt)
      VALUES (
        ${likeId},
        ${commentId},
        ${user.id},
        ${now}
      )
    `;

    // Increment the likes count on the comment
    await prisma.$executeRaw`
      UPDATE Comment
      SET likes = likes + 1
      WHERE id = ${commentId}
    `;

    // Get the updated comment
    const updatedComment = await prisma.$queryRaw`
      SELECT * FROM Comment WHERE id = ${commentId}
    `;

    // Type assertion for the raw query result
    if (Array.isArray(updatedComment) && updatedComment.length > 0) {
      const comment = updatedComment[0] as { likes: number };
      
      return NextResponse.json({
        message: 'Comment liked successfully',
        likes: comment.likes,
      });
    }
    
    return NextResponse.json({
      message: 'Comment liked successfully',
      likes: 1, // Default to 1 if we can't get the updated count for some reason
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    );
  }
}
