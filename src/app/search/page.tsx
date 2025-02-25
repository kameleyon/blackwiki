"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";

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

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!query) {
    return (
      <div className="text-center text-muted-foreground">
        Enter a search term to begin
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : results.length > 0 ? (
        results.map((result, index) => (
          <motion.article
            key={result.title + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-secondary/10 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{result.title}</h2>
                <p className="text-muted-foreground">{result.summary}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                result.source === 'AfroWiki' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-blue-500/20 text-blue-200'
              }`}>
                {result.source}
              </span>
            </div>
            
            {result.source === 'AfroWiki' && (
              <div className="space-y-4">
                {/* Categories and Tags */}
                <div className="flex flex-wrap gap-2">
                  {result.categories?.map(category => (
                    <span key={category.id} className="px-2 py-1 bg-white/10 rounded-full text-xs">
                      {category.name}
                    </span>
                  ))}
                  {result.tags?.map(tag => (
                    <span key={tag.id} className="px-2 py-1 bg-white/5 rounded-full text-xs">
                      #{tag.name}
                    </span>
                  ))}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-white/60">
                  {result.author && (
                    <span>By {result.author.name}</span>
                  )}
                  {result.views !== undefined && (
                    <span>{result.views} views</span>
                  )}
                  {result.updatedAt && (
                    <span>Updated {new Date(result.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-4">
              <a
                href={result.url}
                className="text-primary hover:underline flex items-center gap-2"
              >
                Read more →
              </a>
            </div>
          </motion.article>
        ))
      ) : (
        <div className="text-center text-muted-foreground">
          No results found for &quot;{query}&quot;
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
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
