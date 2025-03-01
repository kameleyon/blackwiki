"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DiscussionTopic, DiscussionReply } from './types';
import { getDiscussionTopics, getDiscussionReplies } from './utils';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  MessageCircle, 
  Clock, 
  Pin, 
  Lock, 
  Tag,
  ChevronDown,
  ThumbsUp,
  Check,
  Edit2
} from 'lucide-react';

interface DiscussionForumProps {
  showTitle?: boolean;
  limit?: number;
  showReplies?: boolean;
  defaultTopicId?: string;
}

const DiscussionForum: React.FC<DiscussionForumProps> = ({
  showTitle = true,
  limit,
  showReplies = false,
  defaultTopicId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(defaultTopicId || null);
  
  const topics = getDiscussionTopics();
  
  // Filter topics based on search query and category filter
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter ? topic.category === categoryFilter : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort topics: pinned first, then by last activity
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });
  
  // Limit the number of topics if specified
  const displayTopics = limit ? sortedTopics.slice(0, limit) : sortedTopics;
  
  // Get unique categories for filter
  const categories = Array.from(new Set(topics.map(topic => topic.category)));
  
  // Get replies for selected topic
  const replies = selectedTopicId ? getDiscussionReplies(selectedTopicId) : [];
  
  // Find the selected topic
  const selectedTopic = selectedTopicId ? topics.find(topic => topic.id === selectedTopicId) : null;
  
  return (
    <div className="bg-background rounded-lg border border-white/10 p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-normal flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 text-white/70" />
            Discussion Forum
          </h2>
          <p className="text-white/70 mt-2">
            Join conversations about AfroWiki content, policies, and community
          </p>
        </div>
      )}
      
      {!selectedTopicId && (
        <>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="relative">
                <select
                  value={categoryFilter || ''}
                  onChange={(e) => setCategoryFilter(e.target.value || null)}
                  className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none text-white/80 w-48"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full">
              <thead className="bg-black/30">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-white/80">Topic</th>
                  <th className="p-3 text-center text-sm font-medium text-white/80 hidden md:table-cell">Category</th>
                  <th className="p-3 text-center text-sm font-medium text-white/80 hidden md:table-cell">Replies</th>
                  <th className="p-3 text-center text-sm font-medium text-white/80 hidden md:table-cell">Views</th>
                  <th className="p-3 text-right text-sm font-medium text-white/80">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {displayTopics.map(topic => (
                  <tr 
                    key={topic.id} 
                    className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedTopicId(topic.id)}
                  >
                    <td className="p-3">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-black/30 relative mr-3 flex-shrink-0 hidden sm:block">
                          {topic.author.avatarUrl ? (
                            <Image
                              src={topic.author.avatarUrl}
                              alt={topic.author.name}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{topic.title}</span>
                            {topic.isPinned && (
                              <Pin className="h-3.5 w-3.5 ml-2 text-white/60" />
                            )}
                            {topic.isLocked && (
                              <Lock className="h-3.5 w-3.5 ml-2 text-white/60" />
                            )}
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            by {topic.author.name} • {new Date(topic.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {topic.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-white/5 text-white/70 text-xs px-1.5 py-0.5 rounded-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                            {topic.tags.length > 3 && (
                              <span className="text-white/50 text-xs">+{topic.tags.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center text-white/70 text-sm hidden md:table-cell">
                      <span className="bg-white/10 px-2 py-1 rounded-full text-xs">
                        {topic.category}
                      </span>
                    </td>
                    <td className="p-3 text-center text-white/70 hidden md:table-cell">
                      <div className="flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 mr-1 text-white/50" />
                        {topic.replies}
                      </div>
                    </td>
                    <td className="p-3 text-center text-white/70 hidden md:table-cell">
                      <div className="flex items-center justify-center">
                        <Eye className="h-4 w-4 mr-1 text-white/50" />
                        {topic.views}
                      </div>
                    </td>
                    <td className="p-3 text-right text-white/70 text-sm">
                      <div className="flex items-center justify-end">
                        <Clock className="h-4 w-4 mr-1 text-white/50" />
                        {new Date(topic.lastActivity).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {displayTopics.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No discussions found matching your search criteria.
            </div>
          )}
          
          {limit && topics.length > limit && (
            <div className="mt-6 text-center">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                View All Discussions
              </button>
            </div>
          )}
        </>
      )}
      
      {selectedTopicId && selectedTopic && showReplies && (
        <div>
          <div className="mb-4">
            <button 
              onClick={() => setSelectedTopicId(null)}
              className="text-white/70 hover:text-white flex items-center transition-colors"
            >
              <ChevronDown className="h-4 w-4 mr-1 transform rotate-90" />
              Back to Discussions
            </button>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-black/30 relative mr-4 flex-shrink-0">
                {selectedTopic.author.avatarUrl ? (
                  <Image
                    src={selectedTopic.author.avatarUrl}
                    alt={selectedTopic.author.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white/20" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold flex items-center">
                  {selectedTopic.title}
                  {selectedTopic.isPinned && (
                    <Pin className="h-4 w-4 ml-2 text-white/60" />
                  )}
                  {selectedTopic.isLocked && (
                    <Lock className="h-4 w-4 ml-2 text-white/60" />
                  )}
                </h3>
                
                <div className="flex items-center text-white/60 text-sm mt-1">
                  <span>by {selectedTopic.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(selectedTopic.createdAt).toLocaleString()}</span>
                  <span className="mx-2">•</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">
                    {selectedTopic.category}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Tag className="h-4 w-4 text-white/60" />
                  {selectedTopic.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-white/5 text-white/70 text-xs px-2 py-0.5 rounded-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center mt-3 text-sm text-white/60">
                  <div className="flex items-center mr-4">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {selectedTopic.replies} replies
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {selectedTopic.views} views
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {replies.map(reply => (
              <div key={reply.id} className="bg-black/20 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-black/30 relative mr-3 flex-shrink-0">
                    {reply.author.avatarUrl ? (
                      <Image
                        src={reply.author.avatarUrl}
                        alt={reply.author.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white/20" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{reply.author.name}</span>
                        <span className="mx-2 text-white/60">•</span>
                        <span className="text-white/60 text-sm">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                        {reply.editedAt && (
                          <span className="ml-2 text-white/40 text-xs italic">
                            (edited)
                          </span>
                        )}
                      </div>
                      
                      {reply.isAccepted && (
                        <div className="bg-green-900/30 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Accepted
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-white/80">
                      {reply.content}
                    </div>
                    
                    <div className="mt-3 flex items-center">
                      <button className="flex items-center text-white/60 hover:text-white/80 transition-colors">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {reply.likes}
                      </button>
                      
                      <button className="ml-4 flex items-center text-white/60 hover:text-white/80 transition-colors">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Reply
                      </button>
                      
                      <button className="ml-4 flex items-center text-white/60 hover:text-white/80 transition-colors">
                        <Edit2 className="h-4 w-4 mr-1" />
                        Quote
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {replies.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No replies yet. Be the first to respond!
            </div>
          )}
          
          {!selectedTopic.isLocked && (
            <div className="mt-6 bg-black/20 rounded-lg p-4">
              <h4 className="text-lg mb-3">Post a Reply</h4>
              <textarea
                placeholder="Write your reply here..."
                className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-white/80 resize-none"
              />
              <div className="mt-3 flex justify-end">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                  Post Reply
                </button>
              </div>
            </div>
          )}
          
          {selectedTopic.isLocked && (
            <div className="mt-6 bg-black/20 rounded-lg p-4 text-center text-white/60">
              <Lock className="h-5 w-5 mx-auto mb-2" />
              This topic is locked. No new replies can be posted.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;
