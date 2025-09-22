'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiFilter, 
  FiSearch, 
  FiUser, 
  FiClock, 
  FiAlertCircle, 
  FiCheck, 
  FiX, 
  FiChevronDown,
  FiRefreshCw,
  FiEye,
  FiUserCheck,
  FiCalendar
} from 'react-icons/fi';
import Link from 'next/link';
import { ReviewQueueSkeleton } from '@/components/ui/SkeletonLoader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface User {
  id: string;
  name: string;
  image?: string;
  role: string;
}

interface Review {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  article: {
    id: string;
    title: string;
    slug: string;
    status: string;
    author: User;
    categories: Array<{ id: string; name: string }>;
    reviewState?: {
      currentStage: string;
      priority: string;
      dueDate?: string;
      isBlocked?: boolean;
      blockReason?: string;
    };
  };
  reviewer?: User;
  assignee?: User;
}

interface ReviewQueueProps {
  currentUser: User;
}

const PRIORITY_COLORS = {
  low: 'text-blue-400',
  normal: 'text-white',
  high: 'text-yellow-400',
  urgent: 'text-red-400',
};

const STATUS_COLORS = {
  pending: 'text-gray-400',
  in_progress: 'text-blue-400',
  completed: 'text-green-400',
  rejected: 'text-red-400',
  blocked: 'text-orange-400',
};

export default function ReviewQueueManager({ currentUser }: ReviewQueueProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Record<string, number>>({});

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    priority: '',
    assignedTo: 'all',
    category: '',
    dueDate: '',
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        order: sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all')
        ),
      });

      const response = await fetch(`/api/community/reviews?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.pagination.totalPages);
      setStats(data.stats.statusCounts);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const assignReview = async (reviewId: string, assigneeId: string) => {
    try {
      setError(null);
      
      // Optimistic update - find and update the review in the list
      const optimisticReviews = reviews.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              assignee: { 
                id: assigneeId, 
                name: currentUser.name, 
                image: currentUser.image,
                role: currentUser.role
              },
              status: review.status === 'pending' ? 'in_progress' : review.status
            }
          : review
      );
      setReviews(optimisticReviews);

      const response = await fetch(`/api/reviews/${reviewId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to assign review' }));
        throw new Error(errorData.error || 'Failed to assign review');
      }

      // Refresh reviews to get the actual server state
      fetchReviews();
    } catch (error) {
      console.error('Error assigning review:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign review');
      
      // Revert optimistic update on error
      fetchReviews();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return '1 day ago';
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDue <= 24 && hoursUntilDue > 0;
  };

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return due.getTime() < now.getTime();
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <ReviewQueueSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white/5 rounded-lg p-6">
        <div className="flex flex-wrap gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.pending || 0}</div>
            <div className="text-sm text-white/60">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.in_progress || 0}</div>
            <div className="text-sm text-white/60">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completed || 0}</div>
            <div className="text-sm text-white/60">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.rejected || 0}</div>
            <div className="text-sm text-white/60">Rejected</div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search articles..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            Filters
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={fetchReviews}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div 
            className="bg-white/5 rounded-lg p-4 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="editorial">Editorial</option>
                  <option value="final">Final</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assignment</label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="all">All</option>
                  <option value="me">Assigned to Me</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <select
                  value={filters.dueDate}
                  onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="">All Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="week">Due This Week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Category..."
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Reviews table */}
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSortChange('title')}
                >
                  <div className="flex items-center gap-2">
                    Article
                    {sortBy === 'title' && (
                      <span className="text-blue-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Type</th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSortChange('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortBy === 'status' && (
                      <span className="text-blue-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSortChange('priority')}
                >
                  <div className="flex items-center gap-2">
                    Priority
                    {sortBy === 'priority' && (
                      <span className="text-blue-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Assignee</th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSortChange('dueDate')}
                >
                  <div className="flex items-center gap-2">
                    Due Date
                    {sortBy === 'dueDate' && (
                      <span className="text-blue-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reviews.map((review) => (
                <motion.tr 
                  key={review.id}
                  className="hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-white truncate max-w-xs">
                        {review.article.title}
                      </div>
                      <div className="text-sm text-white/60 flex items-center gap-2">
                        <FiUser className="w-3 h-3" />
                        {review.article.author.name}
                        {review.article.categories.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{review.article.categories[0].name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full">
                      {review.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      review.status === 'pending' ? 'bg-gray-500/20 text-gray-300' :
                      review.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                      review.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      review.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                      'bg-orange-500/20 text-orange-300'
                    }`}>
                      {review.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      PRIORITY_COLORS[review.article.reviewState?.priority as keyof typeof PRIORITY_COLORS] || 'text-white'
                    }`}>
                      {review.article.reviewState?.priority || 'normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {review.assignee ? (
                      <div className="flex items-center gap-2">
                        {review.assignee.image && (
                          <img
                            src={review.assignee.image}
                            alt={review.assignee.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm">
                          {review.assignee.name}
                          {review.assignee.id === currentUser.id && ' (You)'}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => assignReview(review.id, currentUser.id)}
                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <FiUserCheck className="w-3 h-3" />
                        Assign to me
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {review.article.reviewState?.dueDate ? (
                      <div className={`text-sm flex items-center gap-1 ${
                        isOverdue(review.article.reviewState.dueDate) ? 'text-red-400' :
                        isDueSoon(review.article.reviewState.dueDate) ? 'text-yellow-400' :
                        'text-white/60'
                      }`}>
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(review.article.reviewState.dueDate)}
                        {isOverdue(review.article.reviewState.dueDate) && ' (Overdue)'}
                      </div>
                    ) : (
                      <span className="text-white/40">No due date</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/articles/${review.article.slug}`}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="View article"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/articles/${review.article.slug}/review`}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded text-sm transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {reviews.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-white/40 mb-4">No reviews found</div>
            <button
              onClick={() => setFilters({
                search: '',
                type: '',
                status: '',
                priority: '',
                assignedTo: 'all',
                category: '',
                dueDate: '',
              })}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-white/60">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}