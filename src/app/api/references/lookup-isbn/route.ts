import { NextRequest, NextResponse } from 'next/server';

interface OpenLibraryAuthor {
  name: string;
}

interface ReferenceData {
  title: string;
  authors: string[];
  year: string;
  type: string;
  isbn: string;
  publisher?: string;
  edition?: string;
  location?: string;
  url?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isbn = searchParams.get('id');

  if (!isbn) {
    return NextResponse.json(
      { error: 'ISBN parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Use Open Library API for ISBN lookup
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`);

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const bookKey = `ISBN:${isbn}`;
    
    if (!data[bookKey]) {
      return NextResponse.json(
        { error: 'ISBN not found' },
        { status: 404 }
      );
    }

    const book = data[bookKey];

    // Extract relevant information
    const referenceData: ReferenceData = {
      title: book.title || '',
      authors: book.authors ? book.authors.map((author: OpenLibraryAuthor) => {
        // Format as "Last, First" if possible
        const nameParts = author.name.split(' ');
        if (nameParts.length > 1) {
          const lastName = nameParts.pop();
          const firstName = nameParts.join(' ');
          return `${lastName}, ${firstName}`;
        }
        return author.name;
      }) : [],
      year: book.publish_date ? extractYear(book.publish_date) : '',
      type: 'book',
      isbn: isbn,
    };

    // Add publisher if available
    if (book.publishers && book.publishers.length > 0) {
      referenceData.publisher = book.publishers[0].name;
    }

    // Add edition if available
    if (book.edition_name) {
      referenceData.edition = book.edition_name;
    }

    // Add location (publish place) if available
    if (book.publish_places && book.publish_places.length > 0) {
      referenceData.location = book.publish_places[0].name;
    }

    // Add URL to Open Library
    if (book.url) {
      referenceData.url = book.url;
    }

    return NextResponse.json(referenceData);
  } catch (error) {
    console.error('Error fetching ISBN information:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch ISBN information' },
      { status: 500 }
    );
  }
}

// Extract year from a date string
function extractYear(dateString: string): string {
  // Try to extract a 4-digit year
  const yearMatch = dateString.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return yearMatch[0];
  }
  
  return '';
}
