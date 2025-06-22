import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';

// Only allow admins to import from Wikipedia
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check if article already exists
    const existingArticle = await prisma.article.findFirst({
      where: {
        OR: [
          { title },
          { metadata: { contains: `"wikipediaTitle":"${title}"` } }
        ]
      }
    });

    if (existingArticle) {
      return NextResponse.json({ 
        error: 'Article already exists in database',
        article: existingArticle 
      }, { status: 409 });
    }

    // Fetch from Wikipedia API
    const params = new URLSearchParams({
      action: 'query',
      prop: 'extracts|pageimages|categories|info',
      titles: title,
      exintro: 'true',
      explaintext: 'true',
      inprop: 'url',
      piprop: 'original',
      format: 'json',
      origin: '*'
    });

    const response = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
    const data = await response.json();
    
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const wikipediaArticle = pages[pageId];

    if (!wikipediaArticle || wikipediaArticle.missing) {
      return NextResponse.json({ 
        error: 'Article not found on Wikipedia' 
      }, { status: 404 });
    }

    // Create article with proper attribution
    const article = await prisma.article.create({
      data: {
        title: wikipediaArticle.title,
        content: `
${wikipediaArticle.extract || 'Content to be added.'}

---
*This article includes content from Wikipedia, which is licensed under the [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) license. [View original article](${wikipediaArticle.fullurl})*
        `.trim(),
        summary: wikipediaArticle.extract ? 
          wikipediaArticle.extract.substring(0, 200) + '...' : 
          'Summary not available.',
        slug: wikipediaArticle.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        authorId: session.user.id,
        status: 'draft', // Always import as draft for review
        image: wikipediaArticle.original?.source || null,
        metadata: JSON.stringify({
          source: 'Wikipedia',
          wikipediaPageId: wikipediaArticle.pageid,
          wikipediaTitle: wikipediaArticle.title,
          wikipediaUrl: wikipediaArticle.fullurl,
          importDate: new Date().toISOString(),
          importedBy: session.user.id,
          license: 'CC BY-SA 3.0',
          requiresReview: true
        })
      }
    });

    // Create an audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'wikipedia_import',
        targetType: 'Article',
        targetId: article.id,
        userId: session.user.id,
        details: JSON.stringify({
          wikipediaTitle: title,
          wikipediaPageId: wikipediaArticle.pageid,
          articleId: article.id
        })
      }
    });

    return NextResponse.json({
      message: 'Article imported successfully',
      article,
      attribution: {
        source: 'Wikipedia',
        license: 'CC BY-SA 3.0',
        originalUrl: wikipediaArticle.fullurl
      }
    });

  } catch (error) {
    console.error('Wikipedia import error:', error);
    return NextResponse.json({ 
      error: 'Failed to import article from Wikipedia' 
    }, { status: 500 });
  }
}

// Search Wikipedia for relevant articles
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    if (!query && !category) {
      return NextResponse.json({ 
        error: 'Query or category parameter is required' 
      }, { status: 400 });
    }

    let apiParams;
    
    if (category) {
      // Search by category
      apiParams = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: `Category:${category}`,
        cmlimit: '20',
        format: 'json',
        origin: '*'
      });
    } else {
      // Search by query
      apiParams = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query!,
        srlimit: '20',
        format: 'json',
        origin: '*'
      });
    }

    const response = await fetch(`${WIKIPEDIA_API_BASE}?${apiParams}`);
    const data = await response.json();

    const results = category ? 
      data.query.categorymembers : 
      data.query.search;

    return NextResponse.json({
      results: results.map((item: any) => ({
        title: item.title,
        pageid: item.pageid,
        snippet: item.snippet
      })),
      source: 'Wikipedia',
      license: 'CC BY-SA 3.0'
    });

  } catch (error) {
    console.error('Wikipedia search error:', error);
    return NextResponse.json({ 
      error: 'Failed to search Wikipedia' 
    }, { status: 500 });
  }
}