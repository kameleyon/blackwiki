"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiEye, FiHeart, FiMessageSquare, FiEdit, FiClock, FiUser, FiBookmark } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

// Safe text highlighting function that prevents XSS
function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  
  const searchTerms = query.split(' ').filter(term => term.length > 1);
  if (searchTerms.length === 0) return text;
  
  // Escape HTML in the original text to prevent XSS
  const escapedText = text.replace(/[&<>"']/g, (match) => {
    const escapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return escapeMap[match];
  });
  
  let result = escapedText;
  
  searchTerms.forEach(term => {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    result = result.replace(regex, '<mark class="bg-gray-600 text-white px-1 rounded">$1</mark>');
  });
  
  // Only return JSX if highlighting was applied, otherwise return plain text
  if (result !== escapedText) {
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  }
  
  return text;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  image?: string | null;
  views: number;
  likes: number;
  createdAt: string;
  readingTime: number;
  searchQuery?: string;
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

interface SearchResultsProps {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
  searchStats: {
    totalResults: number;
    hasResults: boolean;
  };
  query: string;
  onLoadMore: () => void;
}

export default function SearchResults({
  articles,
  isLoading,
  error,
  pagination,
  searchStats,
  query,
  onLoadMore
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  if (error) {
    return (
      <div className="bg-gray-600/10 border border-gray-600/20 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">Search Error</div>
        <p className="text-white/70">{error}</p>
      </div>
    );
  }

  if (isLoading && articles.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!searchStats.hasResults && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-medium mb-2">No articles found</h3>
        <p className="text-white/60 mb-6">
          {query 
            ? `No articles match "${query}". Try different keywords or filters.`
            : 'Try searching for topics, people, places, or events in African/Black history.'
          }
        </p>
        <div className="text-sm text-white/50">
          <p>Suggestions:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Check spelling of search terms</li>
            <li>Try broader keywords</li>
            <li>Remove some filters</li>
            <li>Search for related topics</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search stats and view controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-white/70">
          {searchStats.totalResults > 0 && (
            <span>
              Found <strong>{searchStats.totalResults.toLocaleString()}</strong> articles
              {query && <span> for "{query}"</span>}
              {pagination.totalPages > 1 && (
                <span> (Page {pagination.currentPage} of {pagination.totalPages})</span>
              )}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">View:</span>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-600' : 'bg-white/10'}`}
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-600' : 'bg-white/10'}`}
          >
            <FiBookmark size={16} />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
        {articles.map((article) => (
          <div key={article.id} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors">
            <div className={viewMode === 'list' ? 'flex gap-4' : ''}>
              {/* Article image */}
              <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'w-full h-48 mb-4'} bg-black/30 rounded-lg overflow-hidden flex-shrink-0`}>
                {article.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-white/40">
                    📄
                  </div>
                )}
              </div>

              {/* Article content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <Link 
                  href={`/articles/${article.slug}`}
                  className="block font-medium text-lg hover:text-gray-300 transition-colors mb-2"
                >
                  {highlightText(article.title, query)}
                </Link>

                {/* Summary */}
                <div className="text-white/70 text-sm mb-3 line-clamp-3">
                  {highlightText(article.summary, query)}
                </div>

                {/* Categories */}
                {article.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.categories.slice(0, 3).map((category, index) => (
                      <Link
                        key={index}
                        href={`/search?category=${encodeURIComponent(category.name)}`}
                        className="px-2 py-1 bg-gray-600/20 text-gray-300 rounded text-xs hover:bg-gray-600/30 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                    {article.categories.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                        +{article.categories.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Article stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <FiUser size={12} />
                    <span>{article.author.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock size={12} />
                    <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiEye size={12} />
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                  {article.likes > 0 && (
                    <div className="flex items-center gap-1">
                      <FiHeart size={12} />
                      <span>{article.likes}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FiMessageSquare size={12} />
                    <span>{article._count.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiEdit size={12} />
                    <span>{article.readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {pagination.hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load More Articles'}
          </button>
        </div>
      )}
    </div>
  );
}