import { NextRequest, NextResponse } from 'next/server';

interface CrossrefAuthor {
  family?: string;
  given?: string;
  name?: string;
}

interface ReferenceData {
  title: string;
  authors: string[];
  year: string;
  type: string;
  doi: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const doi = searchParams.get('id');

  if (!doi) {
    return NextResponse.json(
      { error: 'DOI parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Crossref API for DOI lookup
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AfroWiki/1.0 (https://afrowiki.org; mailto:info@afrowiki.org)'
      }
    });

    if (!response.ok) {
      throw new Error(`Crossref API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const item = data.message;

    // Extract relevant information
    const referenceData: ReferenceData = {
      title: item.title ? item.title[0] : '',
      authors: item.author ? item.author.map((author: CrossrefAuthor) => {
        if (author.family && author.given) {
          return `${author.family}, ${author.given}`;
        } else if (author.name) {
          return author.name;
        }
        return '';
      }).filter(Boolean) : [],
      year: item.published ? 
        (item['published-print'] ? 
          item['published-print']['date-parts'][0][0].toString() : 
          (item['published-online'] ? 
            item['published-online']['date-parts'][0][0].toString() : 
            '')) : '',
      type: mapCrossrefType(item.type),
      doi: doi,
    };

    // Add journal information if available
    if (item['container-title'] && item['container-title'].length > 0) {
      referenceData.journal = item['container-title'][0];
    }

    // Add volume, issue, and pages if available
    if (item.volume) {
      referenceData.volume = item.volume;
    }

    if (item.issue) {
      referenceData.issue = item.issue;
    }

    if (item.page) {
      referenceData.pages = item.page;
    }

    // Add publisher if available
    if (item.publisher) {
      referenceData.publisher = item.publisher;
    }

    return NextResponse.json(referenceData);
  } catch (error) {
    console.error('Error fetching DOI information:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch DOI information' },
      { status: 500 }
    );
  }
}

// Map Crossref document types to our reference types
function mapCrossrefType(crossrefType: string): string {
  const typeMap: Record<string, string> = {
    'journal-article': 'journal',
    'proceedings-article': 'conference',
    'book': 'book',
    'book-chapter': 'book',
    'dissertation': 'thesis',
    'report': 'other',
    'standard': 'other',
    'dataset': 'other',
    'posted-content': 'other',
    'journal-issue': 'journal',
    'book-part': 'book',
    'other': 'other',
    'monograph': 'book',
    'reference-book': 'book',
    'book-set': 'book',
    'book-series': 'book',
    'edited-book': 'book',
    'book-track': 'book',
    'book-section': 'book',
    'proceedings': 'conference',
    'proceedings-series': 'conference',
    'journal': 'journal',
    'journal-volume': 'journal',
    'component': 'other',
    'reference-entry': 'other',
    'report-series': 'other',
    'report-component': 'other',
    'standard-series': 'other',
  };

  return typeMap[crossrefType] || 'other';
}
