import { SearchResult } from '@/types/index';

interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

interface WikiResponse {
  query?: {
    search?: WikiSearchResult[];
  };
}

type WikipediaSearchResult = Omit<SearchResult, 'categories' | 'tags' | 'author' | 'views' | 'updatedAt'>;

export async function searchWikipedia(query: string) {
  const searchUrl = new URL('https://en.wikipedia.org/w/api.php');
  searchUrl.search = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: `${query} black african history culture`,
    format: 'json',
    origin: '*',
    srlimit: '10',
    srprop: 'snippet',
  }).toString();

  try {
    const response = await fetch(searchUrl.toString());
    const data: WikiResponse = await response.json();
    
    const results: WikipediaSearchResult[] = data.query?.search?.map(result => ({
      id: result.pageid.toString(),
      title: result.title,
      summary: result.snippet.replace(/<\/?[^>]+(>|$)/g, ''), // Remove HTML tags
      source: 'wikipedia' as const,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
    })) || [];

    return results;
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return [];
  }
}

export async function getWikipediaArticle(title: string) {
  const articleUrl = new URL('https://en.wikipedia.org/w/api.php');
  articleUrl.search = new URLSearchParams({
    action: 'query',
    prop: 'extracts|info',
    exintro: '1',
    titles: title,
    format: 'json',
    origin: '*',
    inprop: 'url',
  }).toString();

  try {
    const response = await fetch(articleUrl.toString());
    const data = await response.json();
    const pages = data.query?.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    return {
      title: page.title,
      content: page.extract,
      url: page.fullurl,
      source: 'wikipedia',
    };
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return null;
  }
}
