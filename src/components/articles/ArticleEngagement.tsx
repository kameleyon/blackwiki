"use client";

import { useState } from 'react';
import { FiThumbsUp, FiBookmark, FiShare2, FiMessageSquare } from 'react-icons/fi';

interface ArticleEngagementProps {
  articleId: string;
}

export default function ArticleEngagement({ articleId }: ArticleEngagementProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = async () => {
    try {
      // In a real implementation, this would call an API to record the like
      // For now, we'll just toggle the state
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      // In a real implementation, this would call an API to save the bookmark
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Error bookmarking article:', error);
    }
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const handleShareOption = (platform: string) => {
    // In a real implementation, this would open share dialogs for each platform
    console.log(`Sharing on ${platform}`);
    setShowShareOptions(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real implementation, this would call an API to save the comment
      console.log('Submitting comment:', comment);
      setComment('');
      setShowCommentForm(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className="mt-12 border-t border-white/10 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 ${liked ? 'text-blue-400' : 'text-white/60 hover:text-white/80'}`}
            aria-label={liked ? "Unlike article" : "Like article"}
          >
            <FiThumbsUp size={18} />
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>
          
          <button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center gap-2 text-white/60 hover:text-white/80"
            aria-label="Comment on article"
          >
            <FiMessageSquare size={18} />
            <span>Comment</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-white/60 hover:text-white/80"
              aria-label="Share article"
            >
              <FiShare2 size={18} />
              <span className="hidden sm:inline">Share</span>
            </button>
            
            {showShareOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {['Twitter', 'Facebook', 'LinkedIn', 'Email', 'Copy Link'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => handleShareOption(platform)}
                      className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleBookmark}
            className={`flex items-center gap-2 ${bookmarked ? 'text-yellow-400' : 'text-white/60 hover:text-white/80'}`}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
          >
            <FiBookmark size={18} />
            <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
      
      {showCommentForm && (
        <div className="mt-6">
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowCommentForm(false)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white/80 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!comment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
