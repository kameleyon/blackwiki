import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

// GET /api/articles/:id/comments - Get all comments for an article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const articleId = params.id;

  try {
    // Check if the Comment table exists
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Comment'
    `;

    if (!Array.isArray(tableExists) || tableExists.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    // Get all comments for the article
    const comments = await prisma.$queryRaw`
      SELECT 
        c.id, c.content, c.createdAt, c.updatedAt, c.articleId, c.authorId, c.parentId, c.likes,
        u.name as authorName, u.image as authorImage
      FROM Comment c
      JOIN User u ON c.authorId = u.id
      WHERE c.articleId = ${articleId}
      ORDER BY c.createdAt DESC
    `;

    return NextResponse.json({ comments: Array.isArray(comments) ? comments : [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', comments: [] },
      { status: 500 }
    );
  }
}

// POST /api/articles/:id/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in to comment' },
      { status: 401 }
    );
  }

  const articleId = params.id;
  const { content, parentId } = await request.json();

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
      select: { id: true, name: true, image: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if the Comment table exists
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Comment'
    `;

    if (!Array.isArray(tableExists) || tableExists.length === 0) {
      // Create the Comment table if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE Comment (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL,
          articleId TEXT NOT NULL,
          authorId TEXT NOT NULL,
          parentId TEXT,
          likes INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (articleId) REFERENCES Article(id) ON DELETE CASCADE,
          FOREIGN KEY (authorId) REFERENCES User(id) ON DELETE CASCADE,
          FOREIGN KEY (parentId) REFERENCES Comment(id) ON DELETE SET NULL
        )
      `;
    }

    // Generate a unique ID for the comment
    const commentId = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    // Create the comment using raw SQL
    await prisma.$executeRaw`
      INSERT INTO Comment (id, content, createdAt, updatedAt, articleId, authorId, parentId, likes)
      VALUES (
        ${commentId},
        ${content},
        ${now},
        ${now},
        ${articleId},
        ${user.id},
        ${parentId || null},
        0
      )
    `;

    // Return the created comment
    return NextResponse.json({
      comment: {
        id: commentId,
        content,
        authorId: user.id,
        authorName: user.name,
        authorImage: user.image,
        createdAt: now,
        updatedAt: now,
        parentId: parentId || null,
        articleId,
        likes: 0,
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
