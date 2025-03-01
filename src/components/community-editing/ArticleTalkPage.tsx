"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiMessageSquare, FiSend, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

interface TalkMessage {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  section: string;
}

interface ArticleTalkPageProps {
  articleId: string;
  articleTitle: string;
}

export default function ArticleTalkPage({ articleId, articleTitle }: ArticleTalkPageProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<TalkMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [section, setSection] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sections = [
    { id: 'general', name: 'General Discussion' },
    { id: 'content', name: 'Content Issues' },
    { id: 'sources', name: 'Sources & References' },
    { id: 'style', name: 'Style & Formatting' },
    { id: 'factual', name: 'Factual Accuracy' },
  ];

  useEffect(() => {
    fetchMessages();
  }, [articleId, section]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/articles/talk/${articleId}?section=${section}`);
      
      if (!response.ok) {
        throw new Error('Failed to load discussion messages');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching talk page messages:', err);
      setError('Failed to load discussion. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError('You must be logged in to participate in discussions');
      return;
    }
    
    if (!newMessage.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/articles/talk/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          section,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post message');
      }
      
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error posting message:', err);
      setError('Failed to post your message. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="bg-black/20 rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-normal flex items-center gap-2">
          <FiMessageSquare className="text-white/70" />
          Talk: {articleTitle}
        </h2>
        <button 
          onClick={fetchMessages}
          className="flex items-center gap-1 text-white/60 hover:text-white/90 transition-colors"
        >
          <FiRefreshCw size={14} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-white/70 mb-2">Discussion Sections:</div>
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                section === s.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {s.name}
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
      
      <div className="bg-black/30 rounded-lg p-4 mb-6 min-h-[300px] max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/60"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-white/50 py-12">
            <p>No messages in this section yet.</p>
            <p className="text-sm mt-2">Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {message.author.image ? (
                    <img
                      src={message.author.image}
                      alt={message.author.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      {message.author.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{message.author.name || 'Anonymous'}</div>
                    <div className="text-xs text-white/50">{formatDate(message.createdAt)}</div>
                  </div>
                </div>
                <div className="pl-10 whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={session?.user ? "Add to the discussion..." : "Please sign in to participate in discussions"}
            disabled={!session?.user || isSubmitting}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 min-h-[100px] text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!session?.user || isSubmitting || !newMessage.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              !session?.user || isSubmitting || !newMessage.trim()
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/80 rounded-full border-t-transparent"></div>
                Posting...
              </>
            ) : (
              <>
                <FiSend size={16} />
                Post Message
              </>
            )}
          </button>
        </div>
      </form>
      
      {!session?.user && (
        <div className="mt-4 text-center text-white/50 text-sm">
          <a href="/auth/signin" className="text-white/70 hover:text-white underline">
            Sign in
          </a>{' '}
          to participate in discussions
        </div>
      )}
    </div>
  );
}
