import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FiEye, FiEyeOff, FiBell, FiClock, FiEdit, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import WatchListActions from '@/components/community/WatchListActions';

export const metadata: Metadata = {
  title: 'Watchlist - AfroWiki',
  description: 'Manage your watched articles and track changes you care about',
};

interface SearchParams {
  searchParams: {
    filter?: string;
    sort?: string;
  };
}

async function getUserWatchlist(userId: string, searchParams: SearchParams['searchParams']) {
  const { filter = 'all', sort = 'recent' } = searchParams;
  
  // Build where conditions for articles
  const articleWhere: any = {
    watchers: {
      some: {
        userId: userId
      }
    }
  };
  
  // Note: Unread filtering is handled post-fetch due to Prisma limitations
  // with comparing dates across relations in the same query
  
  if (filter === 'active') {
    // Articles with recent activity (edits, comments) in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    articleWhere.OR = [
      {
        updatedAt: {
          gte: weekAgo
        }
      },
      {
        comments: {
          some: {
            createdAt: {
              gte: weekAgo
            }
          }
        }
      }
    ];
  }
  
  // Build order by
  let orderBy: any = { updatedAt: 'desc' };
  switch (sort) {
    case 'title':
      orderBy = { title: 'asc' };
      break;
    case 'watched':
      orderBy = [{ watchers: { _count: 'desc' } }];
      break;
    case 'views':
      orderBy = { views: 'desc' };
      break;
    default:
      orderBy = { updatedAt: 'desc' };
  }

  let watchedArticles = await prisma.article.findMany({
    where: articleWhere,
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      },
      categories: {
        select: {
          name: true
        }
      },
      watchers: {
        where: {
          userId: userId
        },
        select: {
          createdAt: true
        }
      },
      _count: {
        select: {
          comments: true,
          edits: true,
          watchers: true
        }
      }
    },
    orderBy,
    take: 100 // Limit to 100 items for performance
  });

  // Get recent activity for each watched article
  const articlesWithActivity = await Promise.all(
    watchedArticles.map(async (article) => {
      const watchedAt = article.watchers[0]?.createdAt || new Date();
      
      // Get recent edits since watching
      const recentEdits = await prisma.edit.count({
        where: {
          articleId: article.id,
          createdAt: {
            gte: watchedAt
          }
        }
      });

      // Get recent comments since watching
      const recentComments = await prisma.comment.count({
        where: {
          articleId: article.id,
          createdAt: {
            gte: watchedAt
          }
        }
      });

      return {
        ...article,
        recentActivity: {
          edits: recentEdits,
          comments: recentComments,
          watchedAt
        }
      };
    })
  );

  // Apply unread filter post-fetch since Prisma comparison was invalid
  if (filter === 'unread') {
    return articlesWithActivity.filter(article => {
      const watchedAt = article.recentActivity.watchedAt;
      return new Date(article.updatedAt) > watchedAt;
    });
  }

  return articlesWithActivity;
}

export default async function WatchlistPage({ searchParams }: SearchParams) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/auth/signin?callbackUrl=/watchlist');
  }

  const watchedArticles = await getUserWatchlist(currentUser.id, searchParams);
  
  // Calculate statistics
  const totalWatched = watchedArticles.length;
  const unreadCount = watchedArticles.filter(article => {
    const watchedAt = article.recentActivity.watchedAt;
    return new Date(article.updatedAt) > watchedAt;
  }).length;
  const activeCount = watchedArticles.filter(article => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(article.updatedAt) > weekAgo;
  }).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FiEye className="text-white/60" size={32} />
          <h1 className="text-3xl font-normal">Your Watchlist</h1>
        </div>
        <p className="text-white/70 mb-6">
          Track articles you're interested in and get notified about changes, discussions, and updates.
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-white mb-1">{totalWatched}</div>
            <div className="text-sm text-white/60">Total Watched</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-blue-400 mb-1">{unreadCount}</div>
            <div className="text-sm text-white/60">Unread Updates</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-green-400 mb-1">{activeCount}</div>
            <div className="text-sm text-white/60">Active (7 days)</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-purple-400 mb-1">
              {watchedArticles.reduce((sum, a) => sum + a._count.watchers, 0)}
            </div>
            <div className="text-sm text-white/60">Total Watchers</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-medium">Filter & Sort</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            href="/watchlist"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              (!searchParams.filter || searchParams.filter === 'all') 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            All ({totalWatched})
          </Link>
          <Link
            href="/watchlist?filter=unread"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              searchParams.filter === 'unread' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Unread Updates ({unreadCount})
          </Link>
          <Link
            href="/watchlist?filter=active"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              searchParams.filter === 'active' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Recently Active ({activeCount})
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-white/60">Sort by:</span>
          <Link
            href={`/watchlist?${new URLSearchParams({
              ...searchParams,
              sort: 'recent'
            })}`}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              (!searchParams.sort || searchParams.sort === 'recent') 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Recently Updated
          </Link>
          <Link
            href={`/watchlist?${new URLSearchParams({
              ...searchParams,
              sort: 'title'
            })}`}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              searchParams.sort === 'title' 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Title A-Z
          </Link>
          <Link
            href={`/watchlist?${new URLSearchParams({
              ...searchParams,
              sort: 'views'
            })}`}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              searchParams.sort === 'views' 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Most Viewed
          </Link>
        </div>
      </div>

      {/* Watchlist */}
      <div className="bg-white/5 rounded-lg">
        {watchedArticles.length === 0 ? (
          <div className="text-center py-12 px-6">
            <FiEye className="mx-auto mb-4 text-white/40" size={48} />
            <h3 className="text-xl font-medium mb-2">No watched articles yet</h3>
            <p className="text-white/60 mb-4">
              Start watching articles to track changes and stay updated with topics you care about.
            </p>
            <Link 
              href="/search"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {watchedArticles.map((article) => {
              const watchedAt = article.recentActivity.watchedAt;
              const hasUnreadUpdates = new Date(article.updatedAt) > watchedAt;
              const hasRecentActivity = article.recentActivity.edits > 0 || article.recentActivity.comments > 0;
              
              return (
                <div key={article.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Article Image */}
                    <div className="w-16 h-16 rounded-lg bg-black/30 overflow-hidden flex-shrink-0">
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
                        <div className="w-full h-full flex items-center justify-center text-xl text-white/60">
                          📄
                        </div>
                      )}
                    </div>

                    {/* Article Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link 
                          href={`/articles/${article.slug}`}
                          className="text-lg font-medium hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {article.title}
                          {hasUnreadUpdates && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-xs">
                              New Updates
                            </span>
                          )}
                        </Link>
                        
                        <WatchListActions 
                          articleId={article.id}
                          isWatched={true}
                        />
                      </div>
                      
                      <p className="text-sm text-white/70 mb-3 line-clamp-2">
                        {article.summary}
                      </p>

                      {/* Categories */}
                      {article.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
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

                      {/* Activity & Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <span>{formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}</span>
                          <span>•</span>
                          <span>{article.views} views</span>
                          <span>•</span>
                          <span>By {article.author.name || 'Anonymous'}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs">
                          {hasRecentActivity && (
                            <div className="flex items-center gap-3">
                              {article.recentActivity.edits > 0 && (
                                <div className="flex items-center gap-1 text-blue-400">
                                  <FiEdit size={12} />
                                  <span>{article.recentActivity.edits} new edits</span>
                                </div>
                              )}
                              {article.recentActivity.comments > 0 && (
                                <div className="flex items-center gap-1 text-green-400">
                                  <FiMessageSquare size={12} />
                                  <span>{article.recentActivity.comments} new comments</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-white/50">
                            <FiClock size={12} />
                            <span>Watched {formatDistanceToNow(watchedAt, { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-white/5 rounded-lg">
        <h3 className="font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/search"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiEye className="text-blue-400" size={20} />
            <div>
              <div className="font-medium text-sm">Find Articles to Watch</div>
              <div className="text-xs text-white/60">Browse and discover content</div>
            </div>
          </Link>
          
          <Link 
            href="/recent-changes"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiBell className="text-green-400" size={20} />
            <div>
              <div className="font-medium text-sm">Recent Changes</div>
              <div className="text-xs text-white/60">See all community activity</div>
            </div>
          </Link>
          
          <Link 
            href={`/users/${encodeURIComponent(currentUser.name || 'anonymous')}`}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiEdit className="text-purple-400" size={20} />
            <div>
              <div className="font-medium text-sm">Your Contributions</div>
              <div className="text-xs text-white/60">View your profile and activity</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}