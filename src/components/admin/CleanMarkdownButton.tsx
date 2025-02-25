"use client";

import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

interface CleanMarkdownButtonProps {
  articleId?: string;
  onComplete?: (result: { success: boolean; message: string; processed: number }) => void;
}

export default function CleanMarkdownButton({ articleId, onComplete }: CleanMarkdownButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; processed: number } | null>(null);

  const handleCleanMarkdown = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/articles/clean-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to clean markdown');
      }
      
      setResult({
        success: data.success,
        message: data.message,
        processed: data.processed,
      });
      
      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error('Error cleaning markdown:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        processed: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCleanMarkdown}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          loading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        <span>
          {loading
            ? 'Cleaning Markdown...'
            : articleId
            ? 'Clean Markdown for this Article'
            : 'Clean Markdown for All Articles'}
        </span>
      </button>
      
      {result && (
        <div
          className={`p-3 rounded-lg text-sm ${
            result.success ? 'bg-green-900/30 text-green-200' : 'bg-red-900/30 text-red-200'
          }`}
        >
          <p>{result.message}</p>
          {result.success && result.processed > 0 && (
            <p className="mt-1 text-xs">
              {result.processed} article{result.processed !== 1 ? 's' : ''} processed successfully.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
