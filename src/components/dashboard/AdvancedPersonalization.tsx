"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  FiBookmark, 
  FiGrid, 
  FiList, 
  FiSettings, 
  FiPlus,
  FiX,
  FiEye,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import Image from 'next/image';

type Article = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  categories?: { id: string; name: string }[];
  author?: { id: string; name: string };
  createdAt: Date;
  views: number;
};

type ReadingListItem = {
  id: string;
  articleId: string;
  article: Article;
  addedAt: Date;
  notes?: string;
  readStatus: 'unread' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
};

type LayoutConfig = {
  showStatistics: boolean;
  showRecommendations: boolean;
  showActivity: boolean;
  showDrafts: boolean;
  showReadingList: boolean;
  columnsLayout: 'default' | 'wide-main' | 'wide-sidebar' | 'equal';
};

type AdvancedPersonalizationProps = {
  readingList: ReadingListItem[];
  recommendedArticles: Article[];
  layoutConfig: LayoutConfig;
  onUpdateLayout: (config: LayoutConfig) => void;
  onAddToReadingList: (articleId: string, priority: string) => Promise<void>;
  onRemoveFromReadingList: (itemId: string) => Promise<void>;
  onUpdateReadStatus: (itemId: string, status: string) => Promise<void>;
};

export default function AdvancedPersonalization({
  readingList,
  recommendedArticles,
  layoutConfig,
  onUpdateLayout,
  onAddToReadingList,
  onRemoveFromReadingList,
  onUpdateReadStatus
}: AdvancedPersonalizationProps) {
  const [activeTab, setActiveTab] = useState<'reading-list' | 'layout'>('reading-list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [, setEditingLayout] = useState(false);
  const [tempLayoutConfig, setTempLayoutConfig] = useState<LayoutConfig>({ ...layoutConfig });
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle layout config changes
  const handleConfigChange = (key: keyof LayoutConfig, value: boolean | 'default' | 'wide-main' | 'wide-sidebar' | 'equal') => {
    setTempLayoutConfig({
      ...tempLayoutConfig,
      [key]: value
    });
  };

  // Save layout changes
  const saveLayoutChanges = () => {
    onUpdateLayout(tempLayoutConfig);
    setEditingLayout(false);
  };

  // Cancel layout changes
  const cancelLayoutChanges = () => {
    setTempLayoutConfig({ ...layoutConfig });
    setEditingLayout(false);
  };

  // Add article to reading list
  const addToReadingList = async () => {
    if (selectedArticle) {
      await onAddToReadingList(selectedArticle, selectedPriority);
      setSelectedArticle(null);
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/50 text-red-100';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-100';
      case 'low':
        return 'bg-green-900/50 text-green-100';
      default:
        return 'bg-white/10 text-white/80';
    }
  };

  // Get read status badge color
  const getReadStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/50 text-green-100';
      case 'in-progress':
        return 'bg-blue-900/50 text-blue-100';
      case 'unread':
        return 'bg-white/10 text-white/80';
      default:
        return 'bg-white/10 text-white/80';
    }
  };

  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Personalization</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('reading-list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
              activeTab === 'reading-list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiBookmark size={14} />
            <span className="text-sm">Reading List</span>
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
              activeTab === 'layout' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiSettings size={14} />
            <span className="text-sm">Dashboard Layout</span>
          </button>
        </div>
      </div>
      
      {activeTab === 'reading-list' && (
        <>
          <div className="flex items-center justify-between p-3 bg-white/5 border-b border-gray-700">
            <h3 className="text-sm font-medium">Your Reading List</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiList size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiGrid size={14} />
              </button>
            </div>
          </div>
          
          {viewMode === 'list' ? (
            <div className="divide-y divide-gray-800">
              {readingList.length > 0 ? (
                readingList.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{item.article.title}</h3>
                          <div className="flex ml-3 space-x-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getReadStatusColor(item.readStatus)}`}>
                              {item.readStatus.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        {item.article.summary && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.article.summary}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="flex items-center mr-3">
                            <FiClock size={12} className="mr-1" />
                            Added on {formatDate(item.addedAt)}
                          </span>
                          <span className="flex items-center mr-3">
                            <FiEye size={12} className="mr-1" />
                            {item.article.views} views
                          </span>
                          {item.article.categories && item.article.categories.length > 0 && (
                            <span className="mr-3">
                              {item.article.categories[0].name}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="mt-2 text-xs text-gray-400 bg-white/5 p-2 rounded">
                            <span className="font-medium">Notes:</span> {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        <Link 
                          href={`/articles/${item.article.slug}`} 
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
                        >
                          <FiEye size={16} />
                        </Link>
                        <div className="relative">
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md">
                            <FiCheck size={16} />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 hidden">
                            <div className="py-1">
                              <button
                                onClick={() => onUpdateReadStatus(item.id, 'unread')}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                              >
                                Unread
                              </button>
                              <button
                                onClick={() => onUpdateReadStatus(item.id, 'in-progress')}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => onUpdateReadStatus(item.id, 'completed')}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                              >
                                Completed
                              </button>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => onRemoveFromReadingList(item.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-md"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Your reading list is empty. Add articles from recommendations below.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {readingList.length > 0 ? (
                readingList.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
                    {item.article.imageUrl && (
                      <div className="h-32 bg-gray-700 relative">
                        <Image 
                          src={item.article.imageUrl} 
                          alt={item.article.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getReadStatusColor(item.readStatus)}`}>
                            {item.readStatus.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-medium text-sm mb-1">{item.article.title}</h3>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span className="flex items-center mr-2">
                          <FiClock size={10} className="mr-1" />
                          {formatDate(item.addedAt)}
                        </span>
                        {item.article.categories && item.article.categories.length > 0 && (
                          <span className="bg-white/10 px-1.5 py-0.5 rounded text-xs">
                            {item.article.categories[0].name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Link 
                          href={`/articles/${item.article.slug}`} 
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Read Article
                        </Link>
                        <button 
                          onClick={() => onRemoveFromReadingList(item.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center text-gray-500">
                  Your reading list is empty. Add articles from recommendations below.
                </div>
              )}
            </div>
          )}
          
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium mb-3">Recommended for You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recommendedArticles.map((article) => (
                <div key={article.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10">
                  <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                  {article.summary && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{article.summary}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <FiEye size={10} className="mr-1" />
                      <span>{article.views} views</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedArticle(article.id);
                        setSelectedPriority('medium');
                      }}
                      className="flex items-center text-xs text-gray-400 hover:text-white"
                    >
                      <FiPlus size={10} className="mr-1" />
                      <span>Add to List</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Add to Reading List Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg w-full max-w-md p-4">
                <h3 className="text-lg font-medium mb-3">Add to Reading List</h3>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Priority</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPriority('low')}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        selectedPriority === 'low' 
                          ? 'bg-green-900/50 text-green-100' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => setSelectedPriority('medium')}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        selectedPriority === 'medium' 
                          ? 'bg-yellow-900/50 text-yellow-100' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setSelectedPriority('high')}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        selectedPriority === 'high' 
                          ? 'bg-red-900/50 text-red-100' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      High
                    </button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addToReadingList}
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md"
                  >
                    Add to List
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {activeTab === 'layout' && (
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Dashboard Layout</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-3 border rounded-md cursor-pointer ${
                  tempLayoutConfig.columnsLayout === 'default' 
                    ? 'border-white/60 bg-white/10' 
                    : 'border-gray-700 hover:border-white/40'
                }`}
                onClick={() => handleConfigChange('columnsLayout', 'default')}
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-2/3 h-20 bg-white/20 rounded"></div>
                  <div className="w-1/3 h-20 bg-white/10 rounded"></div>
                </div>
                <div className="text-xs text-center">Default (2:1)</div>
              </div>
              <div 
                className={`p-3 border rounded-md cursor-pointer ${
                  tempLayoutConfig.columnsLayout === 'wide-main' 
                    ? 'border-white/60 bg-white/10' 
                    : 'border-gray-700 hover:border-white/40'
                }`}
                onClick={() => handleConfigChange('columnsLayout', 'wide-main')}
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-3/4 h-20 bg-white/20 rounded"></div>
                  <div className="w-1/4 h-20 bg-white/10 rounded"></div>
                </div>
                <div className="text-xs text-center">Wide Main (3:1)</div>
              </div>
              <div 
                className={`p-3 border rounded-md cursor-pointer ${
                  tempLayoutConfig.columnsLayout === 'wide-sidebar' 
                    ? 'border-white/60 bg-white/10' 
                    : 'border-gray-700 hover:border-white/40'
                }`}
                onClick={() => handleConfigChange('columnsLayout', 'wide-sidebar')}
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-1/2 h-20 bg-white/20 rounded"></div>
                  <div className="w-1/2 h-20 bg-white/10 rounded"></div>
                </div>
                <div className="text-xs text-center">Wide Sidebar (1:1)</div>
              </div>
              <div 
                className={`p-3 border rounded-md cursor-pointer ${
                  tempLayoutConfig.columnsLayout === 'equal' 
                    ? 'border-white/60 bg-white/10' 
                    : 'border-gray-700 hover:border-white/40'
                }`}
                onClick={() => handleConfigChange('columnsLayout', 'equal')}
              >
                <div className="flex space-x-2 mb-2">
                  <div className="w-1/3 h-20 bg-white/20 rounded"></div>
                  <div className="w-1/3 h-20 bg-white/20 rounded"></div>
                  <div className="w-1/3 h-20 bg-white/10 rounded"></div>
                </div>
                <div className="text-xs text-center">Equal Columns (1:1:1)</div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Visible Sections</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                <span>Statistics Dashboard</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={tempLayoutConfig.showStatistics}
                    onChange={() => handleConfigChange('showStatistics', !tempLayoutConfig.showStatistics)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${tempLayoutConfig.showStatistics ? 'bg-white/40' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tempLayoutConfig.showStatistics ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                <span>Recommendations</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={tempLayoutConfig.showRecommendations}
                    onChange={() => handleConfigChange('showRecommendations', !tempLayoutConfig.showRecommendations)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${tempLayoutConfig.showRecommendations ? 'bg-white/40' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tempLayoutConfig.showRecommendations ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                <span>Activity Timeline</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={tempLayoutConfig.showActivity}
                    onChange={() => handleConfigChange('showActivity', !tempLayoutConfig.showActivity)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${tempLayoutConfig.showActivity ? 'bg-white/40' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tempLayoutConfig.showActivity ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                <span>Drafts</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={tempLayoutConfig.showDrafts}
                    onChange={() => handleConfigChange('showDrafts', !tempLayoutConfig.showDrafts)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${tempLayoutConfig.showDrafts ? 'bg-white/40' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tempLayoutConfig.showDrafts ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                <span>Reading List</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={tempLayoutConfig.showReadingList}
                    onChange={() => handleConfigChange('showReadingList', !tempLayoutConfig.showReadingList)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${tempLayoutConfig.showReadingList ? 'bg-white/40' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tempLayoutConfig.showReadingList ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancelLayoutChanges}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={saveLayoutChanges}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md"
            >
              Save Layout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
