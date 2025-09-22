import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PUT /api/discussions/message/[messageId] - Update a discussion message
export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in to edit messages' },
      { status: 401 }
    );
  }

  const { messageId } = params;
  const { content } = await request.json();

  if (!content || content.trim() === '') {
    return NextResponse.json(
      { error: 'Message content is required' },
      { status: 400 }
    );
  }

  try {
    // Get user ID
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

    // Get the message to verify ownership
    const message = await prisma.discussionMessage.findUnique({
      where: { id: messageId },
      select: { 
        id: true, 
        authorId: true, 
        targetId: true, 
        targetType: true 
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this message (author or admin)
    const canEdit = message.authorId === user.id || user.role === 'admin';
    if (!canEdit) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }

    // Update the message
    const updatedMessage = await prisma.discussionMessage.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    const formattedMessage = {
      id: updatedMessage.id,
      content: updatedMessage.content,
      authorId: updatedMessage.authorId,
      authorName: updatedMessage.author.name,
      authorImage: updatedMessage.author.image,
      createdAt: updatedMessage.createdAt.toISOString(),
      updatedAt: updatedMessage.updatedAt?.toISOString(),
      parentId: updatedMessage.parentId,
      targetId: updatedMessage.targetId,
      targetType: updatedMessage.targetType
    };

    return NextResponse.json({ 
      message: formattedMessage,
      success: true 
    });
  } catch (error) {
    console.error('Error updating discussion message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE /api/discussions/message/[messageId] - Delete a discussion message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in to delete messages' },
      { status: 401 }
    );
  }

  const { messageId } = params;

  try {
    // Get user ID
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

    // Get the message to verify permissions
    const message = await prisma.discussionMessage.findUnique({
      where: { id: messageId },
      select: { 
        id: true, 
        authorId: true, 
        targetId: true, 
        targetType: true 
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this message
    // Author can delete their own messages, target user can delete messages on their talk page, admins can delete any message
    const canDelete = 
      message.authorId === user.id || 
      (message.targetType === 'user' && message.targetId === user.id) ||
      user.role === 'admin';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this message' },
        { status: 403 }
      );
    }

    // Recursive function to get all descendant message IDs
    const getAllDescendantIds = async (parentId: string): Promise<string[]> => {
      const children = await prisma.discussionMessage.findMany({
        where: { parentId },
        select: { id: true }
      });
      
      let allIds: string[] = children.map(child => child.id);
      
      // Recursively get descendants of each child
      for (const child of children) {
        const descendantIds = await getAllDescendantIds(child.id);
        allIds = allIds.concat(descendantIds);
      }
      
      return allIds;
    };

    // Get all descendant IDs
    const descendantIds = await getAllDescendantIds(messageId);
    
    // Delete all descendants first, then the parent message (all in a transaction)
    await prisma.$transaction(async (tx) => {
      // Delete all descendants
      if (descendantIds.length > 0) {
        await tx.discussionMessage.deleteMany({
          where: { id: { in: descendantIds } }
        });
      }
      
      // Delete the parent message
      await tx.discussionMessage.delete({
        where: { id: messageId }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discussion message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}