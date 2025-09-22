"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiUser, FiRefreshCw, FiAlertCircle, FiEdit, FiMessageSquare, FiEye, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

interface Contribution {
  id: string;
  type: 'article_created' | 'article_edited' | 'review_completed' | 'comment_posted';
  title: string;
  slug: string;
  summary?: string;
  timestamp: string;
  data: any;
}

interface UserContributionsProps {
  userId?: string; // If not provided, show current user's contributions
  username?: string;
  limit?: number;
}

export default function UserContributions({ userId, username, limit = 50 }: UserContributionsProps) {
  const { data: session } = useSession();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'edits' | 'comments' | 'talk' | 'articles'>('all');

  const displayUserId = userId || (session?.user as any)?.id;
  const displayUsername = username || (session?.user as any)?.name || 'Anonymous';

  useEffect(() => {
    if (displayUserId) {
      fetchContributions();
    } else if (!session) {
      setIsLoading(false);
    }
  }, [displayUserId, page, filter, session]);

  const fetchContributions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/users/${displayUserId}/contributions?type=${filter}&offset=${(page - 1) * limit}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load user contributions');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setContributions(data.contributions);
      } else {
        setContributions((prev) => [...prev, ...data.contributions]);
      }
      
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error('Error fetching user contributions:', err);
      setError('Failed to load contributions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'article_created':
        return <FiEdit className="text-white/70" />;
      case 'article_edited':
        return <FiEdit className="text-white/70" />;
      case 'review_completed':
        return <FiEye className="text-white/70" />;
      case 'comment_posted':
        return <FiMessageSquare className="text-white/70" />;
      default:
        return <FiEdit className="text-white/70" />;
    }
  };

  const getContributionTypeLabel = (type: string) => {
    switch (type) {
      case 'article_created':
        return 'Created article';
      case 'article_edited':
        return 'Edited article';
      case 'review_completed':
        return 'Completed review';
      case 'comment_posted':
        return 'Posted comment';
      default:
        return 'Contribution';
    }
  };

  return (
    <div className="bg-black/20 rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-normal flex items-center gap-2">
          <FiUser className="text-white/70" />
          Contributions by {displayUsername}
        </h2>
        <button 
          onClick={() => {
            setPage(1);
            fetchContributions();
          }}
          className="flex items-center gap-1 text-white/60 hover:text-white/90 transition-colors"
        >
          <FiRefreshCw size={14} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-white/70 mb-2">Filter by type:</div>
        <div className="flex flex-wrap gap-2">
          {['all', 'edits', 'comments', 'talk', 'articles'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f as any);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === f
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2">
          <FiAlertCircle />
          {error}
        </div>
      )}
      
      {!displayUserId && !session ? (
        <div className="text-center text-white/50 py-12">
          <p>Please sign in to view your contributions.</p>
          <Link href="/auth/signin" className="text-white/70 hover:text-white underline mt-2 inline-block">
            Sign in
          </Link>
        </div>
      ) : isLoading && page === 1 ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/60"></div>
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center text-white/50 py-12">
          <p>No contributions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contributions.map((contribution) => (
            <div key={contribution.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getContributionIcon(contribution.type)}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="font-medium">
                      {getContributionTypeLabel(contribution.type)}{' '}
                      <Link 
                        href={`/articles/${contribution.slug}`}
                        className="text-white hover:underline"
                      >
                        {contribution.title}
                      </Link>
                    </div>
                    <div className="flex items-center text-white/50 text-sm">
                      <FiCalendar size={12} className="mr-1" />
                      {formatDate(contribution.timestamp)}
                    </div>
                  </div>
                  
                  {contribution.summary && (
                    <div className="text-white/70 text-sm mb-2">
                      {contribution.summary}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Link
                      href={`/articles/${contribution.slug}`}
                      className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors"
                    >
                      <FiEye size={12} />
                      View Article
                    </Link>
                    
                    {(contribution.type === 'article_created' || contribution.type === 'article_edited') && (
                      <Link
                        href={`/articles/edit/${contribution.data?.articleId || contribution.id}`}
                        className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors"
                      >
                        <FiEdit size={12} />
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isLoading
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white/80 rounded-full border-t-transparent"></div>
                    Loading...
                  </div>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
