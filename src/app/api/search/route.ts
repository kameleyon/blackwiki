import { NextResponse } from 'next/server'
import { searchArticles } from '@/lib/db'
import { searchWikipedia } from '@/lib/wikipedia'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    )
  }

  try {
    // Search both sources in parallel
    const [localResults, wikiResults] = await Promise.all([
      searchArticles(query),
      searchWikipedia(query)
    ])

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
    }))

    // Combine results, with local results first
    const combinedResults = {
      query,
      results: [
        ...formattedLocalResults.sort((a, b) => {
          if (a.views === b.views) {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          }
          return (b.views || 0) - (a.views || 0)
        }),
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
