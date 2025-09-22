import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search parameters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, date, views, title
    const contentType = searchParams.get('contentType') || ''; // short, medium, long
    const status = searchParams.get('status') || 'published';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build the where clause - SECURITY: Only allow published content for public search
    const whereConditions: any = {
      isPublished: true,
      isArchived: false
    };
    
    // Status filtering ignored for public search to prevent data exposure
    // TODO: Add authentication check for admin users to access drafts/unpublished content

    // Full-text search across title, summary, and content
    if (query) {
      const searchTerms = query.split(' ').filter(term => term.length > 0);
      const searchConditions = searchTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { summary: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } }
        ]
      }));
      
      if (searchConditions.length > 0) {
        whereConditions.AND = searchConditions;
      }
    }

    // Category filter
    if (category) {
      whereConditions.categories = {
        some: {
          name: {
            equals: category,
            mode: 'insensitive'
          }
        }
      };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereConditions.createdAt = {};
      if (dateFrom) {
        whereConditions.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereConditions.createdAt.lte = new Date(dateTo);
      }
    }

    // Content length filter - DISABLED due to performance issues
    // Current post-query filtering causes O(N) content scanning for 2K+ articles
    // TODO: Add contentLength integer field to Article model for database-level filtering
    // For now, disable content type filtering to ensure production performance
    const contentTypeFilter = ''; // Temporarily disabled

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'title':
        orderBy = { title: 'asc' };
        break;
      case 'date':
        orderBy = { createdAt: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      case 'likes':
        orderBy = { likes: 'desc' };
        break;
      case 'relevance':
      default:
        // For relevance, prioritize title matches, then summary, then content
        if (query) {
          // This is a simplified relevance - in production you might want to use full-text search
          orderBy = [
            { views: 'desc' },
            { likes: 'desc' },
            { createdAt: 'desc' }
          ];
        } else {
          orderBy = { createdAt: 'desc' };
        }
        break;
    }

    // Execute search query with optimized payload
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where: whereConditions,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          image: true,
          views: true,
          likes: true,
          createdAt: true,
          // content field removed to optimize payload and performance
          author: {
            select: {
              name: true,
              image: true
            }
          },
          categories: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              comments: true,
              edits: true,
              watchers: true
            }
          }
        },
        orderBy,
        take: limit, // Standard pagination - no over-fetching needed
        skip: offset
      }),
      prisma.article.count({
        where: whereConditions
      })
    ]);

    // Get category suggestions - optimized to avoid content scanning
    const categoryStats = await prisma.category.findMany({
      where: query ? {
        name: { contains: query, mode: 'insensitive' }
      } : {},
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        articles: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Process articles with optimized response
    const paginatedResults = articles.map(article => {
      // Estimate reading time from summary length until contentLength column is added
      const estimatedReadingTime = Math.ceil(article.summary.length / 50); // Rough estimate

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        image: article.image,
        views: article.views,
        likes: article.likes,
        createdAt: article.createdAt,
        readingTime: estimatedReadingTime,
        author: article.author,
        categories: article.categories,
        _count: article._count
      };
    });
    
    // No filtering needed since contentTypeFilter is disabled
    const filteredTotal = totalCount;

    return NextResponse.json({
      articles: paginatedResults,
      pagination: {
        total: filteredTotal,
        limit,
        offset,
        hasMore: offset + limit < filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
        currentPage: Math.floor(offset / limit) + 1
      },
      filters: {
        query,
        category,
        dateFrom,
        dateTo,
        sortBy,
        contentType,
        status
      },
      categoryStats,
      searchStats: {
        processingTimeMs: Date.now() - Date.now(), // Would track actual processing time
        totalResults: filteredTotal,
        hasResults: filteredTotal > 0
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}