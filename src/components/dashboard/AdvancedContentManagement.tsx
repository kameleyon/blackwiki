"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiEdit, 
  FiEye, 
  FiTrash2, 
  FiCopy, 
  FiSave,
  FiClock,
  FiPlus,
  FiChevronDown,
  FiCheck,
  FiX
} from 'react-icons/fi';

type Article = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  isPublished: boolean;
  status?: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt?: Date;
  categories?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
  author?: { id: string; name: string };
  version?: number;
  versionHistory?: {
    id: string;
    version: number;
    createdAt: Date;
    changes: string;
  }[];
};

type Template = {
  id: string;
  name: string;
  description: string;
  structure: {
    title: string;
    sections: {
      heading: string;
      content: string;
    }[];
  };
};

type AdvancedContentManagementProps = {
  articles: Article[];
  templates: Template[];
  totalArticles: number;
  onSaveArticle: (articleId: string, content: string) => Promise<void>;
  onCreateFromTemplate: (templateId: string) => Promise<void>;
};

export default function AdvancedContentManagement({
  articles,
  templates,
  totalArticles,
  onSaveArticle,
  onCreateFromTemplate
}: AdvancedContentManagementProps) {
  const [filter, setFilter] = useState<'all' | 'drafts' | 'published'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'views'>('updated');
  const [showTemplates, setShowTemplates] = useState(false);
  const [, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Filter and sort articles
  const filteredArticles = articles.filter(article => {
    // Apply published/draft filter
    if (filter === 'drafts' && article.isPublished) return false;
    if (filter === 'published' && !article.isPublished) return false;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        (article.summary && article.summary.toLowerCase().includes(query)) ||
        article.categories?.some(cat => cat.name.toLowerCase().includes(query)) ||
        article.tags?.some(tag => tag.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  }).sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.views - a.views;
    }
  });

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate completion percentage
  const getCompletionPercentage = (article: Article): number => {
    let score = 0;
    
    // Title exists and has reasonable length
    if (article.title && article.title.length > 10) score += 20;
    else if (article.title) score += 10;
    
    // Summary exists
    if (article.summary && article.summary.length > 50) score += 20;
    else if (article.summary) score += 10;
    
    // Content exists and has reasonable length
    if (article.content) {
      const contentLength = article.content.length;
      if (contentLength > 2000) score += 40;
      else if (contentLength > 1000) score += 30;
      else if (contentLength > 500) score += 20;
      else score += 10;
    }
    
    // Has categories
    if (article.categories && article.categories.length > 0) score += 10;
    
    // Has tags
    if (article.tags && article.tags.length > 0) score += 10;
    
    return Math.min(100, score);
  };

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !editingArticleId) return;
    
    const article = articles.find(a => a.id === editingArticleId);
    if (!article) return;
    
    const autoSaveInterval = setInterval(async () => {
      try {
        setAutoSaveStatus('saving');
        await onSaveArticle(editingArticleId, article.content || '');
        setAutoSaveStatus('saved');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
      } catch {
        setAutoSaveStatus('error');
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, editingArticleId, articles, onSaveArticle]);

  // Handle template selection
  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplates(false);
    await onCreateFromTemplate(templateId);
  };

  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Content Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md"
            >
              <FiPlus size={14} />
              <span>New Article</span>
              <FiChevronDown size={14} className="ml-1" />
            </button>
            {showTemplates && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <Link 
                    href="/articles/new" 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                  >
                    Blank Article
                  </Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <div className="px-4 py-1 text-xs text-gray-500">Templates</div>
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-400">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-gray-700 rounded-md px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-white/5 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('drafts')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'drafts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'published' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Published
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'views')}
            className="bg-white/5 border border-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="views">Views</option>
          </select>
        </div>
      </div>
      
      <div className="divide-y divide-gray-800">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div key={article.id} className="p-4 hover:bg-white/5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium">{article.title}</h3>
                    {article.lastSavedAt && (
                      <span className="ml-3 text-xs text-gray-500">
                        Auto-saved {formatTime(article.lastSavedAt)}
                      </span>
                    )}
                  </div>
                  {article.summary && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{article.summary}</p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span className="flex items-center mr-3">
                      <FiClock size={12} className="mr-1" />
                      Updated {formatDate(article.updatedAt)}
                    </span>
                    <span className="flex items-center mr-3">
                      <FiEye size={12} className="mr-1" />
                      {article.views} views
                    </span>
                    {article.version && (
                      <span className="flex items-center mr-3">
                        v{article.version}
                      </span>
                    )}
                    {!article.isPublished && (
                      <div className="flex items-center">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full mr-2">
                          <div 
                            className="h-1.5 bg-white/40 rounded-full" 
                            style={{ width: `${getCompletionPercentage(article)}%` }}
                          ></div>
                        </div>
                        <span>{getCompletionPercentage(article)}% complete</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.categories?.map(category => (
                      <span 
                        key={category.id} 
                        className="px-2 py-0.5 bg-white/10 rounded-full text-xs"
                      >
                        {category.name}
                      </span>
                    ))}
                    {article.tags?.map(tag => (
                      <span 
                        key={tag.id} 
                        className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-gray-400"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <Link 
                    href={`/articles/${article.slug}`} 
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
                  >
                    <FiEye size={16} />
                  </Link>
                  <Link 
                    href={`/articles/edit/${article.id}`}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
                    onClick={() => setEditingArticleId(article.id)}
                  >
                    <FiEdit size={16} />
                  </Link>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md">
                    <FiCopy size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-md">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Version History (collapsed by default) */}
              {article.versionHistory && article.versionHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <button className="flex items-center text-xs text-gray-400 hover:text-white">
                    <FiChevronDown size={14} className="mr-1" />
                    <span>Show version history ({article.versionHistory.length} versions)</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No articles found. {searchQuery ? 'Try a different search term.' : 'Create a new article to get started.'}
          </div>
        )}
      </div>
      
      {/* Auto-save status indicator */}
      {autoSaveStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2 text-sm">
          {autoSaveStatus === 'saving' && (
            <div className="bg-white/10 text-white">
              <FiSave size={14} className="mr-2" />
              <span>Saving...</span>
            </div>
          )}
          {autoSaveStatus === 'saved' && (
            <div className="bg-green-900/80 text-green-100">
              <FiCheck size={14} className="mr-2" />
              <span>Saved successfully</span>
            </div>
          )}
          {autoSaveStatus === 'error' && (
            <div className="bg-red-900/80 text-red-100">
              <FiX size={14} className="mr-2" />
              <span>Error saving</span>
            </div>
          )}
        </div>
      )}
      
      {/* Auto-save toggle */}
      <div className="p-3 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={autoSaveEnabled}
                onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
              />
              <div className={`block w-10 h-6 rounded-full ${autoSaveEnabled ? 'bg-white/40' : 'bg-white/10'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoSaveEnabled ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm text-gray-400">Auto-save</span>
          </label>
          <span className="ml-2 text-xs text-gray-500">(Every 30 seconds while editing)</span>
        </div>
        <div className="text-sm text-gray-400">
          {totalArticles} total articles
        </div>
      </div>
    </div>
  );
}
