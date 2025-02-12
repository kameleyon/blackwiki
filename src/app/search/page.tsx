"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  source: 'blackwiki' | 'wikipedia';
  url: string;
  categories?: string[];
  tags?: string[];
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  sources: {
    blackwiki: number;
    wikipedia: number;
  };
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!query) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        
        const data = await response.json();
        console.log('Search results:', data); // Debug log
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }
        
        setResults(data);
      } catch (err) {
        setError('Failed to load search results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/"
        className="inline-block mb-8 text-primary hover:text-primary/80 transition-colors"
      >
        ← Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-4">
          Search Results for: <span className="text-primary">{query}</span>
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        ) : results?.results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No results found for your search.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Found {results?.totalResults} results ({results?.sources.blackwiki} from BlackWiki, {results?.sources.wikipedia} from Wikipedia)
            </div>
            
            <div className="space-y-6">
              {results?.results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-lg bg-secondary/10 border border-secondary/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">
                      <Link 
                        href={result.url} 
                        className="hover:text-primary transition-colors"
                        target={result.source === 'wikipedia' ? '_blank' : undefined}
                        rel={result.source === 'wikipedia' ? 'noopener noreferrer' : undefined}
                      >
                        {result.title}
                      </Link>
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.source === 'blackwiki' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-secondary/20 text-secondary-foreground'
                    }`}>
                      {result.source}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4" 
                     dangerouslySetInnerHTML={{ __html: result.summary }} 
                  />

                  {(result.categories?.length || result.tags?.length) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.categories?.map(category => (
                        <span key={category} className="text-xs px-2 py-1 rounded bg-primary/5 text-primary">
                          {category}
                        </span>
                      ))}
                      {result.tags?.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
