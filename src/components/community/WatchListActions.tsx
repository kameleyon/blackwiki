"use client";

import { useState } from 'react';
import { FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface WatchListActionsProps {
  articleId: string;
  isWatched: boolean;
  showRemove?: boolean;
}

export default function WatchListActions({ 
  articleId, 
  isWatched, 
  showRemove = true 
}: WatchListActionsProps) {
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(isWatched);
  const router = useRouter();

  const toggleWatch = async () => {
    setLoading(true);
    
    try {
      const method = watching ? 'DELETE' : 'POST';
      const response = await fetch(`/api/watchlist/${articleId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setWatching(!watching);
        router.refresh(); // Refresh the page data
      } else {
        console.error('Failed to update watchlist');
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!watching) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/watchlist/${articleId}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.refresh(); // Refresh to update unread status
      } else {
        console.error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {watching && showRemove && (
        <button
          onClick={markAsRead}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          title="Mark as read"
        >
          <FiEye size={16} />
        </button>
      )}
      
      <button
        onClick={toggleWatch}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          watching
            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
            : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
        }`}
        title={watching ? 'Stop watching' : 'Watch article'}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
        ) : watching ? (
          <FiEyeOff size={16} />
        ) : (
          <FiEye size={16} />
        )}
        <span>{watching ? 'Unwatch' : 'Watch'}</span>
      </button>
    </div>
  );
}