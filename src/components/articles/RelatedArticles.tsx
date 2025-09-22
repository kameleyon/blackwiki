"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiClock } from 'react-icons/fi';
import { ArticleCardSkeleton } from '@/components/ui/SkeletonLoader';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  createdAt: Date;
  views: number;
}

interface RelatedArticlesProps {
  categories?: Category[];
  tags?: Tag[];
  currentArticleId: string;
}

export default function RelatedArticles({ categories, tags, currentArticleId }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        // This is a mock implementation - in a real app, you would fetch from an API
        // that returns related articles based on categories and tags
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in a real implementation, this would come from the API
        const mockArticles: Article[] = [
          {
            id: '1',
            title: 'The Harlem Renaissance',
            slug: 'harlem-renaissance',
            summary: 'A cultural revival of African American art, literature, and music centered in Harlem, New York City, in the 1920s.',
            createdAt: new Date('2025-01-15'),
            views: 342
          },
          {
            id: '2',
            title: 'Civil Rights Movement',
            slug: 'civil-rights-movement',
            summary: 'A decades-long struggle by African Americans to end legalized racial discrimination, disenfranchisement, and racial segregation.',
            createdAt: new Date('2025-01-20'),
            views: 287
          },
          {
            id: '3',
            title: 'African American Literature',
            slug: 'african-american-literature',
            summary: 'The body of literature produced in the United States by writers of African descent.',
            createdAt: new Date('2025-02-05'),
            views: 156
          }
        ].filter(article => article.id !== currentArticleId);
        
        setArticles(mockArticles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching related articles:', error);
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [categories, tags, currentArticleId]);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <ArticleCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
      <div className="space-y-4">
        {articles.map(article => (
          <div key={article.id} className="border-b border-white/10 pb-3 last:border-0">
            <Link href={`/articles/${article.slug}`} className="block">
              <h4 className="font-medium text-sm hover:text-blue-300 transition-colors mb-1">
                {article.title}
              </h4>
              <p className="text-white/60 text-xs line-clamp-2 mb-2">
                {article.summary}
              </p>
              <div className="flex items-center text-white/40 text-xs">
                <FiClock className="mr-1" size={12} />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
