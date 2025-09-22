import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get article title suggestions
    const articleSuggestions = await prisma.article.findMany({
      where: {
        isPublished: true,
        isArchived: false,
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        title: true,
        slug: true,
        views: true
      },
      orderBy: [
        { views: 'desc' },
        { title: 'asc' }
      ],
      take: Math.min(limit, 8)
    });

    // Get category suggestions
    const categorySuggestions = await prisma.category.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: [
        { articles: { _count: 'desc' } },
        { name: 'asc' }
      ],
      take: Math.min(limit, 5)
    });

    // Get popular search terms from article metadata
    const metadataTerms = await prisma.article.findMany({
      where: {
        isPublished: true,
        isArchived: false,
        metadata: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        metadata: true,
        title: true,
        slug: true
      },
      take: 5
    });

    // Extract search terms from metadata
    const searchTermSuggestions: { term: string; count: number }[] = [];
    metadataTerms.forEach(article => {
      if (article.metadata) {
        try {
          const metadata = JSON.parse(article.metadata);
          if (metadata.searchTerm && metadata.searchTerm.toLowerCase().includes(query.toLowerCase())) {
            const existing = searchTermSuggestions.find(s => s.term === metadata.searchTerm);
            if (existing) {
              existing.count++;
            } else {
              searchTermSuggestions.push({ term: metadata.searchTerm, count: 1 });
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    });

    // Sort and limit search term suggestions
    searchTermSuggestions.sort((a, b) => b.count - a.count);

    // Combine and format all suggestions
    const suggestions = [
      // Article titles
      ...articleSuggestions.map(article => ({
        type: 'article',
        text: article.title,
        slug: article.slug,
        views: article.views,
        icon: '📄'
      })),
      
      // Categories
      ...categorySuggestions.map(category => ({
        type: 'category',
        text: category.name,
        count: category._count.articles,
        icon: '🏷️'
      })),
      
      // Search terms
      ...searchTermSuggestions.slice(0, 3).map(term => ({
        type: 'search',
        text: term.term,
        count: term.count,
        icon: '🔍'
      }))
    ];

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, limit),
      query,
      total: suggestions.length
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get suggestions',
        suggestions: []
      },
      { status: 500 }
    );
  }
}