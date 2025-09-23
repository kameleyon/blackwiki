"use client";

import { Suspense } from 'react';
import { FiSearch } from 'react-icons/fi';
import SearchPageContent from './SearchPageContent';

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

// Loading fallback component for Suspense boundary
function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FiSearch className="text-white/60" size={32} />
          <h1 className="text-3xl font-normal">Advanced Search</h1>
        </div>
        <p className="text-white/70">
          Discover articles across our collection of 2,125+ articles about African and Black history, culture, and achievements.
        </p>
      </div>
      <div className="animate-pulse">
        <div className="h-20 bg-white/10 rounded-lg mb-8"></div>
        <div className="h-40 bg-white/5 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}