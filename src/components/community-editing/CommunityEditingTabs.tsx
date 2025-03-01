"use client";

import React, { useState } from 'react';
import { FiMessageSquare, FiClock, FiUser, FiEdit } from 'react-icons/fi';
import ArticleTalkPage from './ArticleTalkPage';
import EditHistory from './EditHistory';
import UserContributions from './UserContributions';

interface CommunityEditingTabsProps {
  articleId: string;
  articleTitle: string;
  authorId: string;
  authorName?: string;
}

export default function CommunityEditingTabs({
  articleId,
  articleTitle,
  authorId,
  authorName = 'Author',
}: CommunityEditingTabsProps) {
  const [activeTab, setActiveTab] = useState<'talk' | 'history' | 'contributions'>('talk');

  const tabs = [
    { id: 'talk', label: 'Talk', icon: <FiMessageSquare /> },
    { id: 'history', label: 'History', icon: <FiClock /> },
    { id: 'contributions', label: 'Contributions', icon: <FiUser /> },
  ];

  return (
    <div className="mt-8 bg-black/10 rounded-lg border border-white/10 overflow-hidden">
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'talk' && (
          <ArticleTalkPage articleId={articleId} articleTitle={articleTitle} />
        )}
        
        {activeTab === 'history' && (
          <EditHistory articleId={articleId} articleTitle={articleTitle} />
        )}
        
        {activeTab === 'contributions' && (
          <UserContributions userId={authorId} username={authorName} limit={10} />
        )}
      </div>
    </div>
  );
}
