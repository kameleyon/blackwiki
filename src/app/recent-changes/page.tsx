import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Metadata } from 'next';
import Link from 'next/link';
import { FiActivity, FiFilter, FiRefreshCw, FiEye, FiEdit, FiMessageSquare, FiStar, FiUser, FiFileText } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import RecentChangesFilters from '@/components/community/RecentChangesFilters';

export const metadata: Metadata = {
  title: 'Recent Changes - AfroWiki',
  description: 'Track recent activity and changes across the AfroWiki community',
};

interface SearchParams {
  searchParams: {
    action?: string;
    user?: string;
    limit?: string;
    hours?: string;
  };
}

async function getRecentChanges(searchParams: SearchParams['searchParams']) {
  const { action, user, limit = '50', hours = '24' } = searchParams;
  
  // Calculate time filter
  const hoursAgo = new Date(Date.now() - (parseInt(hours) * 60 * 60 * 1000));
  
  // Build where conditions
  const where: any = {
    timestamp: {
      gte: hoursAgo
    }
  };
  
  if (action && action !== 'all') {
    where.action = action;
  }
  
  if (user) {
    where.user = {
      name: {
        contains: user,
        mode: 'insensitive'
      }
    };
  }
  
  const changes = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: parseInt(limit)
  });

  return changes;
}

function getActionIcon(action: string) {
  switch (action) {
    case 'article_created':
    case 'wikipedia_import':
      return <FiFileText className="text-green-400" size={16} />;
    case 'article_updated':
    case 'article_status_changed':
    case 'article_workflow_updated':
      return <FiEdit className="text-blue-400" size={16} />;
    case 'article_watched':
    case 'article_unwatched':
      return <FiEye className="text-purple-400" size={16} />;
    case 'review_submitted':
    case 'review_updated':
    case 'review_completed':
      return <FiStar className="text-yellow-400" size={16} />;
    case 'comment_created':
    case 'discussion_message_created':
      return <FiMessageSquare className="text-cyan-400" size={16} />;
    case 'user_role_updated':
    case 'user_joined':
      return <FiUser className="text-orange-400" size={16} />;
    default:
      return <FiActivity className="text-white/60" size={16} />;
  }
}

function getActionColor(action: string) {
  switch (action) {
    case 'article_created':
    case 'wikipedia_import':
      return 'text-green-400';
    case 'article_updated':
    case 'article_status_changed':
    case 'article_workflow_updated':
      return 'text-blue-400';
    case 'article_watched':
    case 'article_unwatched':
      return 'text-purple-400';
    case 'review_submitted':
    case 'review_updated':
    case 'review_completed':
      return 'text-yellow-400';
    case 'comment_created':
    case 'discussion_message_created':
      return 'text-cyan-400';
    case 'user_role_updated':
    case 'user_joined':
      return 'text-orange-400';
    default:
      return 'text-white/60';
  }
}

function formatActionDescription(change: any) {
  const action = change.action;
  let details = {};
  
  // Safely parse JSON details with error handling
  if (change.details) {
    try {
      details = JSON.parse(change.details);
    } catch (error) {
      console.warn('Invalid JSON in audit log details:', change.details);
      details = {};
    }
  }
  
  const userName = change.user?.name || 'Unknown user';
  
  switch (action) {
    case 'article_created':
      return (
        <>
          <span className="font-medium">{userName}</span> created article{' '}
          <Link href={`/articles/${details.slug || '#'}`} className="text-blue-400 hover:underline">
            "{details.title || 'Untitled'}"
          </Link>
        </>
      );
    case 'wikipedia_import':
      return (
        <>
          <span className="font-medium">{userName}</span> imported article{' '}
          <Link href={`/articles/${details.slug || '#'}`} className="text-blue-400 hover:underline">
            "{details.title || details.wikipediaTitle}"
          </Link>{' '}
          from Wikipedia
        </>
      );
    case 'article_updated':
      return (
        <>
          <span className="font-medium">{userName}</span> edited article{' '}
          <Link href={`/articles/${details.slug || '#'}`} className="text-blue-400 hover:underline">
            "{details.title || 'Article'}"
          </Link>
          {details.summary && (
            <span className="text-white/60"> • {details.summary}</span>
          )}
        </>
      );
    case 'article_status_changed':
      return (
        <>
          <span className="font-medium">{userName}</span> changed status of{' '}
          <Link href={`/articles/${details.slug || '#'}`} className="text-blue-400 hover:underline">
            "{details.title || 'Article'}"
          </Link>{' '}
          from <span className="text-white/60">{details.oldStatus || 'unknown'}</span> to{' '}
          <span className="text-green-400">{details.newStatus || 'unknown'}</span>
        </>
      );
    case 'article_watched':
      return (
        <>
          <span className="font-medium">{userName}</span> started watching{' '}
          <Link href={`/articles/${details.slug || '#'}`} className="text-blue-400 hover:underline">
            "{details.articleTitle || 'Article'}"
          </Link>
        </>
      );
    case 'article_unwatched':
      return (
        <>
          <span className="font-medium">{userName}</span> stopped watching{' '}
          <Link href={`/articles/${details.slug || '#'}`} className="text-blue-400 hover:underline">
            "{details.articleTitle || 'Article'}"
          </Link>
        </>
      );
    case 'review_submitted':
    case 'review_updated':
    case 'review_completed':
      return (
        <>
          <span className="font-medium">{userName}</span> {action.replace('review_', '')} review for{' '}
          <Link href={`/articles/${details.slug || '#'}`} className="text-blue-400 hover:underline">
            "{details.articleTitle || 'Article'}"
          </Link>
          {details.score && (
            <span className="text-white/60"> • Score: {details.score}/100</span>
          )}
        </>
      );
    case 'user_role_updated':
      return (
        <>
          <span className="font-medium">{userName}</span>'s role changed to{' '}
          <span className="text-green-400">{details.newRole || 'unknown'}</span>
        </>
      );
    default:
      return (
        <>
          <span className="font-medium">{userName}</span> performed action: <span className="text-white/60">{action}</span>
        </>
      );
  }
}

export default async function RecentChangesPage({ searchParams }: SearchParams) {
  const changes = await getRecentChanges(searchParams);
  const currentUser = await getCurrentUser();
  
  // Calculate statistics
  const totalChanges = changes.length;
  const uniqueUsers = new Set(changes.map(c => c.userId)).size;
  const articlesAffected = new Set(
    changes
      .filter(c => c.targetType === 'Article')
      .map(c => c.targetId)
  ).size;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FiActivity className="text-white/60" size={32} />
          <h1 className="text-3xl font-normal">Recent Changes</h1>
        </div>
        <p className="text-white/70 mb-6">
          Track recent activity and changes across the AfroWiki community. See what contributors are working on and stay updated with the latest developments.
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-white mb-1">{totalChanges}</div>
            <div className="text-sm text-white/60">Total Changes</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-green-400 mb-1">{uniqueUsers}</div>
            <div className="text-sm text-white/60">Active Users</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-blue-400 mb-1">{articlesAffected}</div>
            <div className="text-sm text-white/60">Articles Affected</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-purple-400 mb-1">
              {searchParams.hours || '24'}h
            </div>
            <div className="text-sm text-white/60">Time Period</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <RecentChangesFilters />

      {/* Changes List */}
      <div className="bg-white/5 rounded-lg">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Activity</h2>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <FiRefreshCw size={14} />
              <span>Auto-refresh every 30 seconds</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-white/10">
          {changes.length === 0 ? (
            <div className="text-center py-12">
              <FiActivity className="mx-auto mb-4 text-white/40" size={48} />
              <h3 className="text-xl font-medium mb-2">No recent changes</h3>
              <p className="text-white/60">
                No activity found for the selected filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            changes.map((change, index) => (
              <div key={change.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Action Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(change.action)}
                  </div>
                  
                  {/* Change Details */}
                  <div className="flex-grow min-w-0">
                    <div className="text-white/90 mb-2">
                      {formatActionDescription(change)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>{formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className={getActionColor(change.action)}>
                        {change.action.replace(/_/g, ' ')}
                      </span>
                      {change.user?.role && change.user.role !== 'user' && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-400 capitalize">
                            {change.user.role}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <Link
                      href={`/users/${encodeURIComponent(change.user?.name || 'anonymous')}`}
                      className="block w-8 h-8 rounded-full bg-black/30 overflow-hidden"
                    >
                      {change.user?.image ? (
                        <img 
                          src={change.user.image} 
                          alt={`${change.user.name}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-white/60">
                          {change.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Load More */}
      {changes.length >= parseInt(searchParams.limit || '50') && (
        <div className="text-center mt-8">
          <Link
            href={`/recent-changes?${new URLSearchParams({
              ...searchParams,
              limit: String(parseInt(searchParams.limit || '50') + 50)
            })}`}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Load More Changes
          </Link>
        </div>
      )}
    </div>
  );
}