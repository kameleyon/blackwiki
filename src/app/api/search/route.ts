import { NextResponse } from 'next/server';
import { searchArticles } from '@/lib/db';
import { searchWikipedia } from '@/lib/wikipedia';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Search query:', query); // Debug log

    // Search both sources in parallel
    const [localResults, wikiResults] = await Promise.all([
      searchArticles(query),
      searchWikipedia(query),
    ]);

    console.log('Local results:', localResults); // Debug log
    console.log('Wiki results:', wikiResults); // Debug log

    // Transform local results to match the format
    const formattedLocalResults = localResults.map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      source: 'blackwiki' as const,
      url: `/articles/${article.slug}`,
      categories: article.categories.map((c: { name: string }) => c.name),
      tags: article.tags.map((t: { name: string }) => t.name),
    }));

    // Combine and sort results
    // Local results appear first, followed by Wikipedia results
    const combinedResults = {
      query,
      results: [...formattedLocalResults, ...wikiResults],
      totalResults: formattedLocalResults.length + wikiResults.length,
      sources: {
        blackwiki: formattedLocalResults.length,
        wikipedia: wikiResults.length,
      },
    };

    console.log('Combined results:', combinedResults); // Debug log
    return NextResponse.json(combinedResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
