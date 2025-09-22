import { NextResponse } from 'next/server'
import { searchArticles, getSearchFilterOptions } from '@/lib/db'
import { searchWikipedia } from '@/lib/wikipedia'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  // Parse filter parameters
  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const authors = searchParams.get('authors')?.split(',').filter(Boolean) || []
  const dateFrom = searchParams.get('dateFrom') || undefined
  const dateTo = searchParams.get('dateTo') || undefined
  const sortBy = searchParams.get('sortBy') as 'relevance' | 'recent' | 'views' | 'title' || 'relevance'
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const includeWikipedia = searchParams.get('includeWikipedia') !== 'false'

  // Allow searches with any combination of filters (including date-only searches)
  if (!query && categories.length === 0 && tags.length === 0 && authors.length === 0 && !dateFrom && !dateTo) {
    return NextResponse.json(
      { error: 'Search query or at least one filter is required' },
      { status: 400 }
    )
  }

  try {
    // Build filter options for advanced search
    const filters = {
      categories,
      tags,
      authors,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      limit
    }

    // Search local articles with filters (always include this)
    const localResults = await searchArticles(query, filters)

    // Search Wikipedia only if query is provided and not filtered to specific local content
    const wikiResults = (includeWikipedia && query && categories.length === 0 && tags.length === 0 && authors.length === 0) 
      ? await searchWikipedia(query)
      : []

    // Transform local results to match the format
    const formattedLocalResults = localResults.map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      source: 'AfroWiki' as const,
      url: `/articles/${article.slug}`,
      categories: article.categories,
      tags: article.tags,
      author: article.author,
      views: article.views,
      updatedAt: article.updatedAt,
      createdAt: article.createdAt,
    }))

    // Transform Wikipedia results to match the format
    const formattedWikiResults = wikiResults.map((result) => ({
      ...result,
      source: 'wikipedia' as const,
      categories: undefined,
      tags: undefined,
      author: undefined,
      views: undefined,
      updatedAt: undefined,
      createdAt: undefined,
    }))

    // Combine results - sorting is handled by the database for local results
    const combinedResults = {
      query,
      filters: {
        categories,
        tags,
        authors,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      },
      results: [
        ...formattedLocalResults,
        ...formattedWikiResults
      ],
      totalResults: formattedLocalResults.length + formattedWikiResults.length,
      sources: {
        AfroWiki: formattedLocalResults.length,
        wikipedia: formattedWikiResults.length,
      },
    }

    return NextResponse.json(combinedResults)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}

