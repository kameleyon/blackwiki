import { NextResponse } from 'next/server';
import { searchArticles } from '@/lib/db';
import { searchWikipedia } from '@/lib/wikipedia';
import { prisma } from '@/lib/db';

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

    // Debug: Check if there are ANY articles in the database at all
    const allArticles = await prisma.article.findMany({
      take: 5, // Just get a few to check
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        status: true,
      },
    });
    console.log('Debug - Sample of all articles in database:', allArticles);

    // Debug: Try a direct query for the specific term
    const directQuery = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query.toLowerCase() } },
          { content: { contains: query.toLowerCase() } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        status: true,
      },
    });
    console.log(`Debug - Direct query for "${query}":`, directQuery);

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
      source: 'AfroWiki' as const,
      url: `/articles/${article.slug}`,
      categories: article.categories,
      tags: article.tags,
      author: article.author,
      views: article.views,
      updatedAt: article.updatedAt,
    }));

    // Transform Wikipedia results to match the format
    const formattedWikiResults = wikiResults.map((result) => ({
      ...result,
      source: 'wikipedia' as const,
      categories: undefined,
      tags: undefined,
      author: undefined,
      views: undefined,
      updatedAt: undefined,
    }));

    // Combine results, with local results first
    const combinedResults = {
      query,
      results: [
        ...formattedLocalResults.sort((a, b) => {
          if (a.views === b.views) {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }
          return (b.views || 0) - (a.views || 0);
        }),
        ...formattedWikiResults
      ],
      totalResults: formattedLocalResults.length + formattedWikiResults.length,
      sources: {
        AfroWiki: formattedLocalResults.length,
        wikipedia: formattedWikiResults.length,
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
