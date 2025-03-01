import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const filter = searchParams.get('filter') || 'all';
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build the base query conditions
    let whereConditions: any = { authorId: userId };
    
    // Apply filter
    if (filter !== 'all') {
      if (filter === 'edits') {
        // Get edits
        const edits = await prisma.edit.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit + 1, // Take one more to check if there are more results
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        });
        
        const hasMore = edits.length > limit;
        const contributions = edits.slice(0, limit).map(edit => ({
          id: edit.id,
          type: 'edit',
          title: edit.article.title,
          summary: edit.summary || undefined,
          createdAt: edit.createdAt.toISOString(),
          articleId: edit.articleId,
          articleTitle: edit.article.title,
          articleSlug: edit.article.slug,
        }));
        
        return NextResponse.json({
          contributions,
          hasMore,
        });
      } else if (filter === 'comments') {
        // Get comments
        const comments = await prisma.comment.findMany({
          where: { authorId: userId },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit + 1,
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        });
        
        const hasMore = comments.length > limit;
        const contributions = comments.slice(0, limit).map(comment => ({
          id: comment.id,
          type: 'comment',
          title: comment.article.title,
          summary: comment.content.length > 100 
            ? `${comment.content.substring(0, 100)}...` 
            : comment.content,
          createdAt: comment.createdAt.toISOString(),
          articleId: comment.articleId,
          articleTitle: comment.article.title,
          articleSlug: comment.article.slug,
        }));
        
        return NextResponse.json({
          contributions,
          hasMore,
        });
      } else if (filter === 'talk') {
    // Get talk messages - handle case where ArticleTalk might not be available yet
    let talkMessages: any[] = [];
    try {
      // @ts-ignore - ArticleTalk might not be recognized by TypeScript yet
      talkMessages = await prisma.articleTalk.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit + 1,
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn('ArticleTalk model not available yet:', err);
      // Continue without talk messages
    }
    
    const hasMore = talkMessages.length > limit;
    const contributions = talkMessages.slice(0, limit).map((talk: any) => ({
      id: talk.id,
      type: 'talk',
      title: talk.article.title,
      summary: talk.content.length > 100 
        ? `${talk.content.substring(0, 100)}...` 
        : talk.content,
      createdAt: talk.createdAt.toISOString(),
      articleId: talk.articleId,
      articleTitle: talk.article.title,
      articleSlug: talk.article.slug,
    }));
        
        return NextResponse.json({
          contributions,
          hasMore,
        });
      } else if (filter === 'articles') {
        // Get articles
        const articles = await prisma.article.findMany({
          where: { authorId: userId },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit + 1,
        });
        
        const hasMore = articles.length > limit;
        const contributions = articles.slice(0, limit).map(article => ({
          id: article.id,
          type: 'article',
          title: article.title,
          summary: article.summary.length > 100 
            ? `${article.summary.substring(0, 100)}...` 
            : article.summary,
          createdAt: article.createdAt.toISOString(),
          articleId: article.id,
          articleTitle: article.title,
          articleSlug: article.slug,
        }));
        
        return NextResponse.json({
          contributions,
          hasMore,
        });
      }
    }
    
    // If filter is 'all' or not recognized, combine all contribution types
    // Get edits
    const edits = await prisma.edit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
    
    // Get comments
    const comments = await prisma.comment.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
    
    // Get talk messages - handle case where ArticleTalk might not be available yet
    let talkMessages: any[] = [];
    try {
      // @ts-ignore - ArticleTalk might not be recognized by TypeScript yet
      talkMessages = await prisma.articleTalk.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn('ArticleTalk model not available yet:', err);
      // Continue without talk messages
    }
    
    // Get articles
    const articles = await prisma.article.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    // Combine all contributions
    let allContributions = [
      ...edits.map(edit => ({
        id: edit.id,
        type: 'edit' as const,
        title: edit.article.title,
        summary: edit.summary || undefined,
        createdAt: edit.createdAt,
        articleId: edit.articleId,
        articleTitle: edit.article.title,
        articleSlug: edit.article.slug,
      })),
      ...comments.map(comment => ({
        id: comment.id,
        type: 'comment' as const,
        title: comment.article.title,
        summary: comment.content.length > 100 
          ? `${comment.content.substring(0, 100)}...` 
          : comment.content,
        createdAt: comment.createdAt,
        articleId: comment.articleId,
        articleTitle: comment.article.title,
        articleSlug: comment.article.slug,
      })),
      ...talkMessages.map((talk: any) => ({
        id: talk.id,
        type: 'talk' as const,
        title: talk.article.title,
        summary: talk.content.length > 100 
          ? `${talk.content.substring(0, 100)}...` 
          : talk.content,
        createdAt: talk.createdAt,
        articleId: talk.articleId,
        articleTitle: talk.article.title,
        articleSlug: talk.article.slug,
      })),
      ...articles.map(article => ({
        id: article.id,
        type: 'article' as const,
        title: article.title,
        summary: article.summary.length > 100 
          ? `${article.summary.substring(0, 100)}...` 
          : article.summary,
        createdAt: article.createdAt,
        articleId: article.id,
        articleTitle: article.title,
        articleSlug: article.slug,
      })),
    ];
    
    // Sort by date (newest first)
    allContributions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply pagination
    const paginatedContributions = allContributions.slice(offset, offset + limit + 1);
    const hasMore = paginatedContributions.length > limit;
    
    // Format dates for JSON
    const formattedContributions = paginatedContributions.slice(0, limit).map(contribution => ({
      ...contribution,
      createdAt: contribution.createdAt.toISOString(),
    }));
    
    return NextResponse.json({
      contributions: formattedContributions,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user contributions' },
      { status: 500 }
    );
  }
}
