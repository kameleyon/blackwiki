import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/discussions/[targetType]/[targetId] - Get all discussion messages
export async function GET(
  request: NextRequest,
  { params }: { params: { targetType: string; targetId: string } }
) {
  const { targetType, targetId } = params;

  if (!['article', 'user'].includes(targetType)) {
    return NextResponse.json(
      { error: 'Invalid target type' },
      { status: 400 }
    );
  }

  try {
    // Check if the target exists
    if (targetType === 'article') {
      const article = await prisma.article.findUnique({
        where: { id: targetId },
        select: { id: true }
      });
      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
    } else if (targetType === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true }
      });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Get all discussion messages for the target
    const messages = await prisma.discussionMessage.findMany({
      where: {
        targetId,
        targetType
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format messages for the frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      authorId: message.authorId,
      authorName: message.author.name,
      authorImage: message.author.image,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt?.toISOString(),
      parentId: message.parentId,
      targetId: message.targetId,
      targetType: message.targetType
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching discussion messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/discussions/[targetType]/[targetId] - Create a new discussion message
export async function POST(
  request: NextRequest,
  { params }: { params: { targetType: string; targetId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in to post messages' },
      { status: 401 }
    );
  }

  const { targetType, targetId } = params;
  const { content, parentId } = await request.json();

  if (!['article', 'user'].includes(targetType)) {
    return NextResponse.json(
      { error: 'Invalid target type' },
      { status: 400 }
    );
  }

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
      select: { id: true, name: true, image: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the target exists
    if (targetType === 'article') {
      const article = await prisma.article.findUnique({
        where: { id: targetId },
        select: { id: true }
      });
      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
    } else if (targetType === 'user') {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true }
      });
      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Verify parent message exists if parentId is provided
    if (parentId) {
      const parentMessage = await prisma.discussionMessage.findUnique({
        where: { id: parentId },
        select: { id: true, targetId: true, targetType: true }
      });
      
      if (!parentMessage || parentMessage.targetId !== targetId || parentMessage.targetType !== targetType) {
        return NextResponse.json(
          { error: 'Parent message not found or invalid' },
          { status: 400 }
        );
      }
    }

    // Create the discussion message
    const message = await prisma.discussionMessage.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        targetId,
        targetType,
        parentId: parentId || null
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
      id: message.id,
      content: message.content,
      authorId: message.authorId,
      authorName: message.author.name,
      authorImage: message.author.image,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt?.toISOString(),
      parentId: message.parentId,
      targetId: message.targetId,
      targetType: message.targetType
    };

    return NextResponse.json({ 
      message: formattedMessage,
      success: true 
    });
  } catch (error) {
    console.error('Error creating discussion message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}