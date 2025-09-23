"use client";

import { useState } from 'react';
import { 
  FiFileText, 
  FiCheck, 
  FiX, 
  FiAlertTriangle, 
  FiFlag,
  FiEye,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiMessageSquare,
  FiClock,
  FiStar
} from 'react-icons/fi';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported' | 'draft';
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  qualityScore: number;
  flagCount: number;
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    contentWarnings: string[];
    qualityIssues: string[];
    suggestedImprovements: string[];
  };
}

interface ContentModerationProps {
  articles: Article[];
  totalCount: number;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onFlag: (id: string, reason: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ContentModeration({
  articles,
  totalCount,
  onApprove,
  onReject,
  onFlag,
  onDelete
}: ContentModerationProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [flagReason, setFlagReason] = useState<string>('');
  const [showFlagModal, setShowFlagModal] = useState<boolean>(false);
  const [flaggingArticleId, setFlaggingArticleId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Status badge color mapping
  const statusColors = {
    pending: 'bg-gray-500/20 text-gray-300',
    approved: 'bg-gray-700/20 text-gray-200',
    rejected: 'bg-gray-800/20 text-gray-400',
    reported: 'bg-gray-600/20 text-gray-300',
    draft: 'bg-gray-400/20 text-gray-300'
  };
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Handle article approval
  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await onApprove(id);
      // Update UI or show success message
    } catch (error) {
      console.error('Error approving article:', error);
      // Show error message
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle article rejection
  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      await onReject(id);
      // Update UI or show success message
    } catch (error) {
      console.error('Error rejecting article:', error);
      // Show error message
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle article flagging
  const handleFlagClick = (id: string) => {
    setFlaggingArticleId(id);
    setShowFlagModal(true);
  };
  
  const handleFlagSubmit = async () => {
    if (!flaggingArticleId || !flagReason) return;
    
    setIsProcessing(true);
    try {
      await onFlag(flaggingArticleId, flagReason);
      setShowFlagModal(false);
      setFlagReason('');
      setFlaggingArticleId(null);
      // Update UI or show success message
    } catch (error) {
      console.error('Error flagging article:', error);
      // Show error message
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle article deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      setIsProcessing(true);
      try {
        await onDelete(id);
        // Update UI or show success message
      } catch (error) {
        console.error('Error deleting article:', error);
        // Show error message
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Content Moderation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-normal">Content Moderation</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20 w-full md:w-64"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="reported">Reported</option>
              <option value="draft">Draft</option>
            </select>
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
          </div>
          
          {/* Batch Actions */}
          <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20">
            Batch Actions
          </button>
        </div>
      </div>
      
      {/* Content Table */}
      <div className="bg-white/5 rounded-xl shadow-sm shadow-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('title')}>
                    <span>Title</span>
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? 
                        <FiChevronUp className="ml-1" size={14} /> : 
                        <FiChevronDown className="ml-1" size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('author')}>
                    <span>Author</span>
                    {sortField === 'author' && (
                      sortDirection === 'asc' ? 
                        <FiChevronUp className="ml-1" size={14} /> : 
                        <FiChevronDown className="ml-1" size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                    <span>Status</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <FiChevronUp className="ml-1" size={14} /> : 
                        <FiChevronDown className="ml-1" size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('updatedAt')}>
                    <span>Last Updated</span>
                    {sortField === 'updatedAt' && (
                      sortDirection === 'asc' ? 
                        <FiChevronUp className="ml-1" size={14} /> : 
                        <FiChevronDown className="ml-1" size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('qualityScore')}>
                    <span>Quality</span>
                    {sortField === 'qualityScore' && (
                      sortDirection === 'asc' ? 
                        <FiChevronUp className="ml-1" size={14} /> : 
                        <FiChevronDown className="ml-1" size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr 
                  key={article.id} 
                  className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{article.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{article.author.name}</div>
                    <div className="text-xs text-white/60">{article.author.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[article.status]}`}>
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </span>
                    {article.flagCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-gray-700/20 text-gray-400 rounded-full text-xs">
                        {article.flagCount} {article.flagCount === 1 ? 'flag' : 'flags'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-white/60">
                      {new Date(article.updatedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-white/10 rounded-full h-1.5 mr-2">
                        <div 
                          className={`h-1.5 rounded-full ${
                            article.qualityScore >= 7 ? 'bg-gray-400' : 
                            article.qualityScore >= 4 ? 'bg-gray-500' : 
                            'bg-gray-600'
                          }`}
                          style={{ width: `${article.qualityScore * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{article.qualityScore}/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
                        title="View"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        className="p-1.5 bg-gray-600/10 rounded-lg hover:bg-gray-600/20 text-gray-300"
                        title="Approve"
                        onClick={() => handleApprove(article.id)}
                        disabled={isProcessing}
                      >
                        <FiCheck size={16} />
                      </button>
                      <button 
                        className="p-1.5 bg-gray-700/10 rounded-lg hover:bg-gray-700/20 text-gray-400"
                        title="Reject"
                        onClick={() => handleReject(article.id)}
                        disabled={isProcessing}
                      >
                        <FiX size={16} />
                      </button>
                      <button 
                        className="p-1.5 bg-gray-500/10 rounded-lg hover:bg-gray-500/20 text-gray-300"
                        title="Flag"
                        onClick={() => handleFlagClick(article.id)}
                        disabled={isProcessing}
                      >
                        <FiFlag size={16} />
                      </button>
                      <button 
                        className="p-1.5 bg-white/5 rounded-lg hover:bg-gray-700/10 text-white/60 hover:text-gray-400"
                        title="Delete"
                        onClick={() => handleDelete(article.id)}
                        disabled={isProcessing}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-white/10">
          <div className="text-sm text-white/60">
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount} articles
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-1 bg-white/5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="px-3 py-1 bg-white/10 rounded-lg text-sm">{page}</div>
            <button 
              className="px-3 py-1 bg-white/5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(page + 1)}
              disabled={page * itemsPerPage >= totalCount}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Article Detail Panel */}
      {selectedArticle && (
        <div className="bg-white/5 rounded-xl shadow-sm shadow-black p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-normal">{selectedArticle.title}</h3>
              <p className="text-sm text-white/60">
                By {selectedArticle.author.name} • Last updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button 
              className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
              onClick={() => setSelectedArticle(null)}
            >
              <FiX size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Article Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedArticle.status]}`}>
                  {selectedArticle.status.charAt(0).toUpperCase() + selectedArticle.status.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Quality Score</span>
                <div className="flex items-center">
                  <div className="w-16 bg-white/10 rounded-full h-1.5 mr-2">
                    <div 
                      className={`h-1.5 rounded-full ${
                        selectedArticle.qualityScore >= 7 ? 'bg-gray-400' : 
                        selectedArticle.qualityScore >= 4 ? 'bg-gray-500' : 
                        'bg-gray-600'
                      }`}
                      style={{ width: `${selectedArticle.qualityScore * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{selectedArticle.qualityScore}/10</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Created</span>
                <span className="text-sm">{new Date(selectedArticle.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Last Updated</span>
                <span className="text-sm">{new Date(selectedArticle.updatedAt).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Flag Count</span>
                <span className="text-sm">{selectedArticle.flagCount}</span>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium mb-2">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/articles/${selectedArticle.slug}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
                  >
                    <FiEye size={14} />
                    <span>View</span>
                  </Link>
                  <Link 
                    href={`/admin/articles/${selectedArticle.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10"
                  >
                    <FiEdit size={14} />
                    <span>Edit</span>
                  </Link>
                  <button 
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-600/10 rounded-lg text-xs text-gray-300 hover:bg-gray-600/20"
                    onClick={() => handleApprove(selectedArticle.id)}
                    disabled={isProcessing}
                  >
                    <FiCheck size={14} />
                    <span>Approve</span>
                  </button>
                  <button 
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700/10 rounded-lg text-xs text-gray-400 hover:bg-gray-700/20"
                    onClick={() => handleReject(selectedArticle.id)}
                    disabled={isProcessing}
                  >
                    <FiX size={14} />
                    <span>Reject</span>
                  </button>
                  <button 
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/10 rounded-lg text-xs text-gray-300 hover:bg-gray-500/20"
                    onClick={() => handleFlagClick(selectedArticle.id)}
                    disabled={isProcessing}
                  >
                    <FiFlag size={14} />
                    <span>Flag</span>
                  </button>
                  <button 
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-gray-700/10 hover:text-gray-400"
                    onClick={() => handleDelete(selectedArticle.id)}
                    disabled={isProcessing}
                  >
                    <FiTrash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* AI Analysis */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">AI Content Analysis</h4>
              
              {selectedArticle.aiAnalysis ? (
                <>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sentiment</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedArticle.aiAnalysis.sentiment === 'positive' ? 'bg-gray-600/20 text-gray-300' :
                        selectedArticle.aiAnalysis.sentiment === 'negative' ? 'bg-gray-700/20 text-gray-400' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {selectedArticle.aiAnalysis.sentiment.charAt(0).toUpperCase() + selectedArticle.aiAnalysis.sentiment.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {selectedArticle.aiAnalysis.contentWarnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-gray-800/10">
                      <h5 className="text-sm font-medium mb-2 flex items-center">
                        <FiAlertTriangle className="mr-1 text-gray-400" size={14} />
                        <span>Content Warnings</span>
                      </h5>
                      <ul className="space-y-1">
                        {selectedArticle.aiAnalysis.contentWarnings.map((warning, index) => (
                          <li key={index} className="text-xs text-gray-400 flex items-start">
                            <span className="mr-1">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedArticle.aiAnalysis.qualityIssues.length > 0 && (
                    <div className="p-3 rounded-lg bg-gray-600/10">
                      <h5 className="text-sm font-medium mb-2 flex items-center">
                        <FiFlag className="mr-1 text-gray-400" size={14} />
                        <span>Quality Issues</span>
                      </h5>
                      <ul className="space-y-1">
                        {selectedArticle.aiAnalysis.qualityIssues.map((issue, index) => (
                          <li key={index} className="text-xs text-gray-300 flex items-start">
                            <span className="mr-1">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedArticle.aiAnalysis.suggestedImprovements.length > 0 && (
                    <div className="p-3 rounded-lg bg-gray-500/10">
                      <h5 className="text-sm font-medium mb-2 flex items-center">
                        <FiStar className="mr-1 text-gray-400" size={14} />
                        <span>Suggested Improvements</span>
                      </h5>
                      <ul className="space-y-1">
                        {selectedArticle.aiAnalysis.suggestedImprovements.map((suggestion, index) => (
                          <li key={index} className="text-xs text-gray-300 flex items-start">
                            <span className="mr-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <p className="text-sm text-white/60">AI analysis not available for this article</p>
                  <button className="mt-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white/80 hover:bg-white/20">
                    Generate Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-normal mb-4">Flag Article</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Reason for flagging
              </label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                rows={4}
                placeholder="Provide a detailed reason for flagging this article..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-white/5 rounded-lg text-sm text-white/80 hover:bg-white/10"
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagReason('');
                  setFlaggingArticleId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-600/20 rounded-lg text-sm text-gray-300 hover:bg-gray-600/30"
                onClick={handleFlagSubmit}
                disabled={!flagReason || isProcessing}
              >
                {isProcessing ? 'Flagging...' : 'Flag Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
