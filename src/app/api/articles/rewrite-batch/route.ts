import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArticleRewriterAgent } from '@/lib/articleRewriter';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has admin privileges for batch operations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== 'admin') {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    const { articleIds, options = {}, batchSize = 5 } = await request.json();

    // If no specific article IDs provided, get candidates (include all statuses for batch operation)
    const targetArticleIds = articleIds && articleIds.length > 0 
      ? articleIds 
      : await ArticleRewriterAgent.getCandidateArticles(50, true);

    if (targetArticleIds.length === 0) {
      return NextResponse.json({
        message: "No articles found for rewriting",
        results: []
      });
    }

    console.log(`Starting batch rewrite for ${targetArticleIds.length} articles`);

    // Process articles in batches
    const results = await ArticleRewriterAgent.rewriteArticlesBatch(
      targetArticleIds,
      {
        enhanceFactualContent: true,
        addSources: true,
        preserveOriginalStructure: false,
        ...options
      },
      batchSize
    );

    // Calculate statistics
    const successfulRewrites = results.filter((r: any) => r.success);
    const totalExpansion = successfulRewrites.reduce((sum: number, r: any) => sum + r.expansionFactor, 0);
    const averageExpansion = successfulRewrites.length > 0 
      ? totalExpansion / successfulRewrites.length 
      : 0;
    const averageQuality = successfulRewrites.length > 0
      ? successfulRewrites.reduce((sum: number, r: any) => sum + r.qualityScore, 0) / successfulRewrites.length
      : 0;

    console.log(`Batch rewrite completed: ${successfulRewrites.length}/${targetArticleIds.length} successful`);

    return NextResponse.json({
      message: `Batch rewrite completed`,
      statistics: {
        totalArticles: targetArticleIds.length,
        successfulRewrites: successfulRewrites.length,
        failedRewrites: results.filter((r: any) => !r.success).length,
        averageExpansionFactor: Math.round(averageExpansion * 100) / 100,
        averageQualityScore: Math.round(averageQuality * 100) / 100
      },
      results: results.map((r: any) => ({
        success: r.success,
        originalLength: r.originalLength,
        newLength: r.newLength,
        expansionFactor: Math.round(r.expansionFactor * 100) / 100,
        qualityScore: r.qualityScore,
        error: r.error
      }))
    });

  } catch (error) {
    console.error("Batch rewrite error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== 'admin') {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    // Get candidate articles for rewriting
    const candidateIds = await ArticleRewriterAgent.getCandidateArticles(100);
    
    // Get detailed info about candidates
    const candidates = await prisma.article.findMany({
      where: {
        id: { in: candidateIds }
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
        views: true,
        author: {
          select: { name: true }
        }
      }
    });

    const candidatesWithStats = candidates.map((article: any) => ({
      id: article.id,
      title: article.title,
      currentLength: article.content.length,
      lastUpdated: article.updatedAt,
      views: article.views,
      author: article.author.name,
      estimatedNewLength: Math.round(article.content.length * 2.5)
    }));

    return NextResponse.json({
      totalCandidates: candidatesWithStats.length,
      candidates: candidatesWithStats
    });

  } catch (error) {
    console.error("Error getting candidate articles:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}