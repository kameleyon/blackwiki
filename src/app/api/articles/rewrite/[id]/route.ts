import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArticleRewriterAgent } from '@/lib/articleRewriter';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user can rewrite this article (admin or article author)
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: { authorId: true, title: true }
    });

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    if (user.role !== 'admin' && article.authorId !== user.id) {
      return new NextResponse("Forbidden - You can only rewrite your own articles or be an admin", { status: 403 });
    }

    const { options = {} } = await request.json();

    console.log(`Starting rewrite for article: ${article.title}`);

    // Rewrite the article
    const result = await ArticleRewriterAgent.rewriteArticle(params.id, {
      enhanceFactualContent: true,
      addSources: true,
      preserveOriginalStructure: false,
      ...options
    });

    if (result.success) {
      console.log(`Rewrite successful: expanded by ${result.expansionFactor}x, quality score: ${result.qualityScore}`);
      
      return NextResponse.json({
        message: "Article rewritten successfully",
        result: {
          originalLength: result.originalLength,
          newLength: result.newLength,
          expansionFactor: Math.round(result.expansionFactor * 100) / 100,
          qualityScore: result.qualityScore,
          factualAdditions: result.factualAdditions
        }
      });
    } else {
      console.error(`Rewrite failed: ${result.error}`);
      return new NextResponse(`Rewrite failed: ${result.error}`, { status: 500 });
    }

  } catch (error) {
    console.error("Article rewrite error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get article info and rewrite potential
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        updatedAt: true,
        views: true,
        author: {
          select: { name: true }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            number: true,
            createdAt: true
          }
        }
      }
    });

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    const currentLength = article.content.length;
    const estimatedNewLength = Math.round(currentLength * 2.5);
    const hasRecentVersions = article.versions.length > 1;

    return NextResponse.json({
      article: {
        id: article.id,
        title: article.title,
        currentLength,
        summaryLength: article.summary.length,
        lastUpdated: article.updatedAt,
        views: article.views,
        author: article.author.name,
        versionCount: article.versions.length
      },
      rewriteEstimate: {
        estimatedNewLength,
        expansionFactor: 2.5,
        hasRecentVersions,
        canRewrite: currentLength < 3000 // Don't rewrite already long articles
      }
    });

  } catch (error) {
    console.error("Error getting article rewrite info:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}