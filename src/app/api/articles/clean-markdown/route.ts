import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processArticleContent } from '@/lib/markdownCleaner';
import { getCurrentUser } from '@/lib/auth';

/**
 * API endpoint to clean markdown in articles
 * 
 * POST /api/articles/clean-markdown
 * - Requires authentication
 * - Body: { articleId?: string } (if articleId is provided, only that article will be processed)
 * - Returns: { success: boolean, message: string, processed: number }
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { articleId } = body;
    
    // If articleId is provided, check if the user is the author or has admin/editor role
    if (articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { authorId: true, title: true, content: true }
      });
      
      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
      
      // Allow if user is the author or has admin/editor role
      const isAuthor = article.authorId === user.id;
      const hasRole = user.role === 'admin' || user.role === 'editor';
      
      if (!isAuthor && !hasRole) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
      
      // Process the content
      const cleanedContent = processArticleContent(article.content);
      
      // Update the article
      await prisma.article.update({
        where: { id: articleId },
        data: { content: cleanedContent },
      });
      
      return NextResponse.json({
        success: true,
        message: `Article "${article.title}" has been processed successfully.`,
        processed: 1,
      });
    } else {
      // For bulk operations, only admins and editors are allowed
      if (user.role !== 'admin' && user.role !== 'editor') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
      
      // Process all articles
      const articles = await prisma.article.findMany();
      
      // Process each article
      for (const article of articles) {
        const cleanedContent = processArticleContent(article.content);
        
        // Update the article
        await prisma.article.update({
          where: { id: article.id },
          data: { content: cleanedContent },
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'All articles have been processed successfully.',
        processed: articles.length,
      });
    }
  } catch (error) {
    console.error('Error cleaning markdown:', error);
    return NextResponse.json(
      { error: 'Failed to clean markdown' },
      { status: 500 }
    );
  }
}
