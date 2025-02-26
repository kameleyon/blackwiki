"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { FiGrid, FiList, FiClock, FiEye, FiFilter, FiX } from "react-icons/fi";
import { processArticleContent, markdownToHtml } from "@/lib/markdownCleaner";

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: 'AfroWiki' | 'wikipedia';
  categories?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
  author?: {
    name: string;
    email: string;
  };
  views?: number;
  updatedAt?: Date;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  sources: {
    AfroWiki: number;
    wikipedia: number;
  };
}

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'recent' | 'views';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSource, setSelectedSource] = useState<'all' | 'AfroWiki' | 'wikipedia'>('all');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        console.log('Fetching search results for:', query);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          console.error('Search API response not OK:', response.status, response.statusText);
          throw new Error(`Search API error: ${response.status}`);
        }
        
        const data: SearchResponse = await response.json();
        console.log('Raw search response data:', data);
        setSearchData(data);
        
        // Apply filters and sorting
        let filteredResults = [...(data.results || [])];
        console.log('Initial results count:', filteredResults.length);
        
        // Filter by source if needed
        if (selectedSource !== 'all') {
          filteredResults = filteredResults.filter(result => result.source === selectedSource);
          console.log('After source filtering:', filteredResults.length);
        }
        
        // Apply sorting
        if (sortBy === 'recent') {
          filteredResults.sort((a, b) => {
            if (!a.updatedAt || !b.updatedAt) return 0;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
        } else if (sortBy === 'views') {
          filteredResults.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        
        console.log('Final filtered results:', filteredResults);
        setResults(filteredResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, selectedSource, sortBy]);

  const handleSourceFilter = (source: 'all' | 'AfroWiki' | 'wikipedia') => {
    setSelectedSource(source);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  if (!query) {
    return (
      <div className="text-center text-white/70 py-12">
        <h2 className="text-xl font-semibold mb-4">Enter a search term to begin</h2>
        <p className="max-w-md mx-auto">
          Search for articles about Black history, culture, and knowledge from both AfroWiki and Wikipedia.
        </p>
      </div>
    );
  }

  const getReadingTime = (summary: string) => {
    const wordsPerMinute = 200;
    const words = summary.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="space-y-8">
      {/* Search Stats and Controls */}
      {searchData && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-lg">
          <div>
            <p className="text-white/70">
              Found {searchData.totalResults} results for &quot;{query}&quot;
            </p>
            <div className="flex gap-2 text-xs mt-1">
              <span className="text-white/50">{searchData.sources.AfroWiki} from AfroWiki</span>
              <span className="text-white/50">{searchData.sources.wikipedia} from Wikipedia</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/20' : ''}`}
                aria-label="List view"
              >
                <FiList size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/20' : ''}`}
                aria-label="Grid view"
              >
                <FiGrid size={16} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm"
            >
              <FiFilter size={14} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Filters Panel */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/5 p-4 rounded-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filter & Sort</h3>
            <button 
              onClick={() => setShowFilters(false)}
              className="text-white/60 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Source</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSourceFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedSource === 'all' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  All Sources
                </button>
                <button 
                  onClick={() => handleSourceFilter('AfroWiki')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedSource === 'AfroWiki' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  AfroWiki
                </button>
                <button 
                  onClick={() => handleSourceFilter('wikipedia')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedSource === 'wikipedia' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  Wikipedia
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Sort By</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSortChange('relevance')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    sortBy === 'relevance' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  Relevance
                </button>
                <button 
                  onClick={() => handleSortChange('recent')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    sortBy === 'recent' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  Most Recent
                </button>
                <button 
                  onClick={() => handleSortChange('views')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    sortBy === 'views' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  Most Viewed
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : results.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
          {results.map((result, index) => (
            <motion.article
              key={result.title + index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white/5 hover:bg-white/10 rounded-xl transition-colors ${
                viewMode === 'grid' ? 'p-5 flex flex-col h-full' : 'p-6'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <Link 
                  href={result.url}
                  className="text-xl font-semibold hover:text-white/80 transition-colors line-clamp-2"
                >
                  {result.title}
                </Link>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  result.source === 'AfroWiki' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-blue-500/20 text-blue-200'
                }`}>
                  {result.source}
                </span>
              </div>
              
              <div 
                className="text-white/70 text-sm line-clamp-3 mb-4"
                dangerouslySetInnerHTML={{ 
                  __html: result.source === 'AfroWiki' 
                    ? markdownToHtml(processArticleContent(result.summary))
                    : result.summary 
                }}
              />
              
              {result.source === 'AfroWiki' && (
                <div className="mt-auto">
                  {/* Categories and Tags */}
                  {(result.categories?.length || result.tags?.length) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.categories?.slice(0, 2).map(category => (
                        <span key={category.id} className="px-2 py-1 bg-white/10 rounded-full text-xs">
                          {category.name}
                        </span>
                      ))}
                      {result.tags?.slice(0, 2).map(tag => (
                        <span key={tag.id} className="px-2 py-1 bg-white/5 rounded-full text-xs">
                          #{tag.name}
                        </span>
                      ))}
                      {(result.categories?.length || 0) + (result.tags?.length || 0) > 4 && (
                        <span className="px-2 py-1 bg-white/5 rounded-full text-xs">
                          +{(result.categories?.length || 0) + (result.tags?.length || 0) - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    {result.author && (
                      <span>By {result.author.name}</span>
                    )}
                    {result.views !== undefined && (
                      <span className="flex items-center gap-1">
                        <FiEye size={12} />
                        {result.views}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiClock size={12} />
                      {getReadingTime(result.summary)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-white/10">
                <Link
                  href={result.url}
                  className="text-white font-semibold hover:text-white/80 text-sm flex items-center"
                >
                  Read more →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-white/70 mb-6">
            We couldn&apos;t find any matches for &quot;{query}&quot;
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Go Home
            </button>
            <button 
              onClick={() => router.push('/articles/new')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Create Article
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Results</h1>
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
