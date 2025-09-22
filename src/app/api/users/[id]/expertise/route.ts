import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, expertise: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's articles with categories to analyze expertise
    const articles = await prisma.article.findMany({
      where: { 
        authorId: userId,
        isPublished: true
      },
      include: {
        categories: true,
        tags: true,
        _count: {
          select: {
            edits: true,
            comments: true
          }
        }
      }
    });

    // Get user's edits across all articles to understand contribution patterns
    const edits = await prisma.edit.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            categories: true,
            tags: true
          }
        }
      }
    });

    // Get user's reviews to understand expertise validation
    const reviews = await prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        article: {
          select: {
            categories: true,
            tags: true
          }
        }
      }
    });

    // Calculate expertise based on actual contributions
    const expertiseData = calculateUserExpertise(user, articles, edits, reviews);

    return NextResponse.json(expertiseData);
  } catch (error) {
    console.error('Error fetching user expertise:', error);
    return NextResponse.json(
      { error: 'Failed to calculate user expertise' },
      { status: 500 }
    );
  }
}

// Helper function to calculate actual expertise from contributions
function calculateUserExpertise(
  user: any,
  articles: any[],
  edits: any[],
  reviews: any[]
) {
  const expertiseAreas: { [key: string]: number } = {};
  
  // Parse declared expertise from user profile
  const declaredExpertise = user.expertise ? 
    user.expertise.split(',').map((area: string) => area.trim()) : [];
  
  // Initialize declared expertise areas with base scores
  declaredExpertise.forEach((area: string) => {
    expertiseAreas[area] = 20; // Base score for declared expertise
  });

  // Calculate expertise from article creation (highest weight)
  articles.forEach(article => {
    article.categories.forEach((category: any) => {
      const area = category.name;
      expertiseAreas[area] = (expertiseAreas[area] || 0) + 15;
      
      // Bonus for articles with many edits/comments (shows depth of work)
      const engagementBonus = Math.min(10, article._count.edits * 2 + article._count.comments);
      expertiseAreas[area] += engagementBonus;
    });
    
    // Also consider tags as secondary expertise indicators
    article.tags.forEach((tag: any) => {
      const area = tag.name;
      expertiseAreas[area] = (expertiseAreas[area] || 0) + 5;
    });
  });

  // Calculate expertise from edits (medium weight)
  edits.forEach(edit => {
    if (edit.article) {
      edit.article.categories?.forEach((category: any) => {
        const area = category.name;
        expertiseAreas[area] = (expertiseAreas[area] || 0) + 3;
      });
      
      edit.article.tags?.forEach((tag: any) => {
        const area = tag.name;
        expertiseAreas[area] = (expertiseAreas[area] || 0) + 1;
      });
    }
  });

  // Calculate expertise from reviews (shows validation by peers)
  reviews.forEach(review => {
    if (review.article) {
      review.article.categories?.forEach((category: any) => {
        const area = category.name;
        expertiseAreas[area] = (expertiseAreas[area] || 0) + 8; // Reviews show expertise validation
      });
    }
  });

  // Normalize scores to 0-100 scale and sort by relevance
  const maxScore = Math.max(...Object.values(expertiseAreas), 1);
  const normalizedExpertise: { [key: string]: number } = {};
  
  Object.entries(expertiseAreas).forEach(([area, score]) => {
    normalizedExpertise[area] = Math.min(100, Math.round((score / maxScore) * 100));
  });

  // Sort by score and return top 8 areas
  const sortedAreas = Object.entries(normalizedExpertise)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  const result = {
    areas: sortedAreas.map(([area, score]) => ({ area, score })),
    totalContributions: articles.length + edits.length + reviews.length,
    expertiseMetrics: {
      articlesCreated: articles.length,
      editsContributed: edits.length,
      reviewsCompleted: reviews.length,
      categoryCoverage: new Set(
        [...articles, ...edits, ...reviews].flatMap(item => 
          item.article?.categories?.map((cat: any) => cat.name) || []
        )
      ).size
    }
  };

  return result;
}