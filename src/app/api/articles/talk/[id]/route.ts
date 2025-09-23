import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET handler to fetch talk messages for an article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const articleId = id;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'general';

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

    // Fetch talk messages for the article and section
    const messages = await prisma.articleTalk.findMany({
      where: {
        articleId,
        section,
      },
      orderBy: {
        createdAt: 'asc',
      },
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

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching talk messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talk messages' },
      { status: 500 }
    );
  }
}

// POST handler to create a new talk message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'You must be logged in to post messages' },
        { status: 401 }
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

    const { content, section = 'general' } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    // Create the talk message
    const message = await prisma.articleTalk.create({
      data: {
        content,
        section,
        articleId,
        authorId: currentUser.id,
      },
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

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating talk message:', error);
    return NextResponse.json(
      { error: 'Failed to create talk message' },
      { status: 500 }
    );
  }
}
