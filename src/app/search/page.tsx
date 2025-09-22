"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import AdvancedSearchForm, { SearchParams } from '@/components/search/AdvancedSearchForm';
import SearchResults from '@/components/search/SearchResults';
import { Metadata } from 'next';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  image?: string | null;
  views: number;
  likes: number;
  createdAt: string;
  contentLength: number;
  readingTime: number;
  titleHighlight?: string | null;
  summaryHighlight?: string | null;
  author: {
    name: string | null;
    image?: string | null;
  };
  categories: Array<{
    name: string;
  }>;
  _count: {
    comments: number;
    edits: number;
    watchers: number;
  };
}

interface SearchResponse {
  articles: Article[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
  filters: any;
  categoryStats: Array<{
    name: string;
    _count: {
      articles: number;
    };
  }>;
  searchStats: {
    totalResults: number;
    hasResults: boolean;
  };
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Initial search from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query || searchParams.toString()) {
      handleSearch({
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || '',
        sortBy: searchParams.get('sortBy') || 'relevance',
        contentType: searchParams.get('contentType') || '',
        status: searchParams.get('status') || 'published'
      });
    }
  }, [searchParams]);

  const handleSearch = async (searchForm: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(searchForm).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      const response = await fetch(`/api/search/advanced?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data: SearchResponse = await response.json();
      setSearchResults(data);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!searchResults || !searchResults.pagination.hasMore) return;
    
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('offset', (searchResults.pagination.offset + searchResults.pagination.limit).toString());
      
      const response = await fetch(`/api/search/advanced?${params.toString()}`);
      const data: SearchResponse = await response.json();
      
      // Append new results
      setSearchResults(prev => prev ? {
        ...data,
        articles: [...prev.articles, ...data.articles]
      } : data);
      
    } catch (err) {
      console.error('Load more error:', err);
      setError('Failed to load more results');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FiSearch className="text-white/60" size={32} />
          <h1 className="text-3xl font-normal">Advanced Search</h1>
        </div>
        <p className="text-white/70">
          Discover articles across our collection of {searchResults?.searchStats.totalResults || '2,125+'} 
          articles about African and Black history, culture, and achievements.
        </p>
      </div>

      {/* Advanced Search Form */}
      <AdvancedSearchForm 
        onSearch={handleSearch}
        isLoading={isLoading}
        categories={searchResults?.categoryStats.map(cat => ({
          name: cat.name,
          count: cat._count?.articles || 0
        })) || []}
      />

      {/* Search Results */}
      {hasSearched ? (
        <SearchResults
          articles={searchResults?.articles || []}
          isLoading={isLoading}
          error={error}
          pagination={searchResults?.pagination || {
            total: 0,
            limit: 20,
            offset: 0,
            hasMore: false,
            totalPages: 0,
            currentPage: 1
          }}
          searchStats={searchResults?.searchStats || {
            totalResults: 0,
            hasResults: false
          }}
          query={searchResults?.filters?.query || ''}
          onLoadMore={handleLoadMore}
        />
      ) : (
        /* Search suggestions when no search has been made */
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium mb-2">Start Your Discovery</h3>
          <p className="text-white/60 mb-8">
            Search through our comprehensive collection of African and Black history articles
          </p>
          
          {/* Popular search suggestions */}
          <div className="max-w-4xl mx-auto">
            <h4 className="text-lg font-medium mb-4 text-left">Popular Topics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Ancient Egypt',
                'Civil Rights Movement', 
                'African Independence',
                'Jazz Music',
                'Black Literature',
                'African Kingdoms',
                'Slavery and Freedom',
                'Contemporary Africa'
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSearch({ 
                    q: topic, 
                    category: '', 
                    dateFrom: '', 
                    dateTo: '', 
                    sortBy: 'relevance', 
                    contentType: '', 
                    status: 'published' 
                  })}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium">{topic}</div>
                  <div className="text-sm text-white/60">Explore articles</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}