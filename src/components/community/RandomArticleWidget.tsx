"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShuffle, FiRefreshCw, FiEye, FiCalendar } from 'react-icons/fi';

interface RandomArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  image?: string | null;
  views: number;
  createdAt: string;
  author: {
    name: string | null;
  };
  categories: {
    name: string;
  }[];
}

export default function RandomArticleWidget() {
  const [article, setArticle] = useState<RandomArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState<number>(0);

  const fetchRandomArticle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/random-article');
      
      if (!response.ok) {
        throw new Error('Failed to fetch random article');
      }
      
      const data = await response.json();
      setArticle(data.article);
      setTotalArticles(data.totalArticles);
    } catch (err) {
      setError('Failed to load random article');
      console.error('Error fetching random article:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiShuffle className="text-white/60" size={16} />
          <h3 className="text-lg font-medium">Random Article</h3>
        </div>
        <button
          onClick={fetchRandomArticle}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={14} />
          <span>{loading ? 'Loading...' : 'Get Random'}</span>
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded border border-red-500/20">
          {error}
        </div>
      )}

      {article ? (
        <div className="space-y-4">
          {/* Article Image */}
          {article.image && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Article Details */}
          <div>
            <Link 
              href={`/articles/${article.slug}`}
              className="text-lg font-medium hover:text-blue-400 transition-colors line-clamp-2"
            >
              {article.title}
            </Link>
            
            <p className="text-sm text-white/70 mt-2 line-clamp-3">
              {article.summary}
            </p>
          </div>

          {/* Article Meta */}
          <div className="space-y-2">
            {/* Categories */}
            {article.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.categories.slice(0, 3).map((category, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-white/10 rounded text-xs"
                  >
                    {category.name}
                  </span>
                ))}
                {article.categories.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                    +{article.categories.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-white/50">
              <div className="flex items-center gap-1">
                <FiEye size={12} />
                <span>{article.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar size={12} />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Author */}
            <div className="text-xs text-white/60">
              By {article.author.name || 'Anonymous'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <Link 
              href={`/articles/${article.slug}`}
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-center text-sm transition-colors"
            >
              Read Article
            </Link>
            <button
              onClick={fetchRandomArticle}
              disabled={loading}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
            >
              <FiShuffle size={16} />
            </button>
          </div>
        </div>
      ) : !loading && (
        <div className="text-center py-8 text-white/60">
          <FiShuffle className="mx-auto mb-3" size={32} />
          <div className="text-lg mb-2">Discover AfroWiki</div>
          <div className="text-sm mb-4">
            Click "Get Random" to discover articles from our collection
            {totalArticles > 0 && ` of ${totalArticles.toLocaleString()} articles`}
          </div>
          <button
            onClick={fetchRandomArticle}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Get Random Article
          </button>
        </div>
      )}

      {loading && !article && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20 mx-auto mb-2"></div>
          <div className="text-white/60">Finding a random article...</div>
        </div>
      )}
      
      {totalArticles > 0 && !loading && (
        <div className="text-xs text-white/40 text-center mt-4">
          Exploring {totalArticles.toLocaleString()} published articles
        </div>
      )}
    </div>
  );
}