"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  FiMessageSquare, FiCornerDownRight, FiEdit2, 
  FiTrash2, FiSend, FiThumbsUp, FiFlag 
} from 'react-icons/fi';
import './collaboration.css';

export type Comment = {
  id: string;
  content: string;
  authorId: string;
  authorName: string | null;
  authorImage?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  parentId?: string | null;
  articleId: string;
  likes: number;
  replies?: Comment[];
  isEditing?: boolean;
};

// Helper function to ensure we have a valid Comment array
const ensureCommentArray = (comments?: Comment[]): Comment[] => {
  return comments || [];
};

interface CommentSystemProps {
  articleId: string;
  initialComments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

const CommentSystem: React.FC<CommentSystemProps> = ({
  articleId,
  initialComments = [],
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted
}) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch comments when articleId changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(organizeComments(data.comments));
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  // Organize comments into a tree structure
  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap: Record<string, Comment> = {};
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments with guaranteed replies array
    flatComments.forEach(comment => {
      commentMap[comment.id] = { 
        ...comment, 
        replies: [] // Initialize with empty array
      };
    });

        // Second pass: organize into parent-child relationships
        flatComments.forEach(comment => {
          if (comment.parentId && commentMap[comment.parentId]) {
            // Since we initialized all comments with replies array, this is safe
            const replies = commentMap[comment.parentId].replies;
            if (replies) {
              replies.push(commentMap[comment.id]);
            }
          } else {
            rootComments.push(commentMap[comment.id]);
          }
        });

    return rootComments;
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!session?.user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          articleId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newCommentObj: Comment = {
          ...data.comment,
          authorName: session.user.name || 'Anonymous',
          authorImage: session.user.image,
          replies: [],
        };

        setComments(prev => [...prev, newCommentObj]);
        setNewComment('');

        if (onCommentAdded) {
          onCommentAdded(newCommentObj);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a reply to a comment
  const handleAddReply = async (parentId: string) => {
    if (!session?.user || !replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          articleId,
          parentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newReply: Comment = {
          ...data.comment,
          authorName: session.user.name || 'Anonymous',
          authorImage: session.user.image,
        };

        // Update the comments state with the new reply
        setComments(prev => {
          const updatedComments = [...prev];
          const findAndAddReply = (comments: Comment[], parentId: string): boolean => {
            for (let i = 0; i < comments.length; i++) {
              if (comments[i].id === parentId) {
                // Initialize replies array if it doesn't exist
                if (!comments[i].replies) {
                  comments[i].replies = [];
                }
                // Now we know replies is defined
                const replies = comments[i].replies;
                if (replies) {
                  replies.push(newReply);
                }
                return true;
              }
              if (comments[i].replies) {
                if (findAndAddReply(ensureCommentArray(comments[i].replies), parentId)) {
                  return true;
                }
              }
            }
            return false;
          };

          findAndAddReply(updatedComments, parentId);
          return updatedComments;
        });

        setReplyingTo(null);
        setReplyContent('');

        if (onCommentAdded) {
          onCommentAdded(newReply);
        }
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating a comment
  const handleUpdateComment = async (commentId: string) => {
    if (!session?.user || !editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedComment = data.comment;

        // Update the comments state with the edited comment
        setComments(prev => {
          const updatedComments = [...prev];
          const findAndUpdateComment = (comments: Comment[], commentId: string): boolean => {
            for (let i = 0; i < comments.length; i++) {
              if (comments[i].id === commentId) {
                comments[i].content = updatedComment.content;
                comments[i].updatedAt = updatedComment.updatedAt;
                return true;
              }
              if (comments[i].replies) {
                if (findAndUpdateComment(ensureCommentArray(comments[i].replies), commentId)) {
                  return true;
                }
              }
            }
            return false;
          };

          findAndUpdateComment(updatedComments, commentId);
          return updatedComments;
        });

        setEditingComment(null);
        setEditContent('');

        if (onCommentUpdated) {
          onCommentUpdated(updatedComment);
        }
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user || isSubmitting) return;

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the comment from the state
        setComments(prev => {
          const updatedComments = [...prev];
          const findAndRemoveComment = (comments: Comment[], commentId: string): boolean => {
            for (let i = 0; i < comments.length; i++) {
              if (comments[i].id === commentId) {
                comments.splice(i, 1);
                return true;
              }
              if (comments[i].replies) {
                if (findAndRemoveComment(ensureCommentArray(comments[i].replies), commentId)) {
                  return true;
                }
              }
            }
            return false;
          };

          findAndRemoveComment(updatedComments, commentId);
          return updatedComments;
        });

        if (onCommentDeleted) {
          onCommentDeleted(commentId);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle liking a comment
  const handleLikeComment = async (commentId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/articles/${articleId}/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update the comment likes in the state
        setComments(prev => {
          const updatedComments = [...prev];
          const findAndUpdateLikes = (comments: Comment[], commentId: string): boolean => {
            for (let i = 0; i < comments.length; i++) {
              if (comments[i].id === commentId) {
                comments[i].likes += 1;
                return true;
              }
              if (comments[i].replies) {
                if (findAndUpdateLikes(ensureCommentArray(comments[i].replies), commentId)) {
                  return true;
                }
              }
            }
            return false;
          };

          findAndUpdateLikes(updatedComments, commentId);
          return updatedComments;
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render a single comment
  const renderComment = (comment: Comment, isReply = false) => {
    return (
      <div key={comment.id} className={`comment-item ${isReply ? 'ml-6' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <div className="comment-author-avatar">
              {comment.authorImage && (
                <Image
                  src={comment.authorImage}
                  alt={comment.authorName || 'User'}
                  width={24}
                  height={24}
                />
              )}
            </div>
            <span className="comment-author-name">{comment.authorName}</span>
          </div>
          <span className="comment-timestamp">
            {formatDate(comment.createdAt)}
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
          </span>
        </div>

        {editingComment === comment.id ? (
          <div className="comment-form">
            <textarea
              className="comment-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your comment..."
            />
            <div className="flex justify-end gap-2">
              <button
                className="comment-action-button"
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
              >
                Cancel
              </button>
              <button
                className="comment-submit"
                onClick={() => handleUpdateComment(comment.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-actions">
              <button
                className="comment-action-button"
                onClick={() => handleLikeComment(comment.id)}
              >
                <FiThumbsUp size={12} />
                <span>{comment.likes > 0 ? comment.likes : ''} Like</span>
              </button>
              <button
                className="comment-action-button"
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyContent('');
                }}
              >
                <FiCornerDownRight size={12} />
                <span>Reply</span>
              </button>
              {session?.user?.email === comment.authorId && (
                <>
                  <button
                    className="comment-action-button"
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                  >
                    <FiEdit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="comment-action-button"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <FiTrash2 size={12} />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <button className="comment-action-button">
                <FiFlag size={12} />
                <span>Report</span>
              </button>
            </div>
          </>
        )}

        {replyingTo === comment.id && (
          <div className="comment-form mt-3">
            <textarea
              className="comment-input"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
            />
            <div className="flex justify-end gap-2">
              <button
                className="comment-action-button"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </button>
              <button
                className="comment-submit"
                onClick={() => handleAddReply(comment.id)}
                disabled={isSubmitting}
              >
                <FiSend size={14} />
                {isSubmitting ? 'Sending...' : 'Reply'}
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="collaboration-container">
      <h3 className="collaboration-heading">
        <FiMessageSquare className="mr-2" />
        Comments ({comments.length})
      </h3>

      {session?.user ? (
        <div className="comment-form">
          <textarea
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <div className="flex justify-end">
            <button
              className="comment-submit"
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
            >
              <FiSend size={14} />
              {isSubmitting ? 'Sending...' : 'Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-white/60">
          Please sign in to add comments
        </div>
      )}

      <div className="comments-container">
        {comments.length === 0 ? (
          <div className="text-center py-4 text-white/60">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentSystem;
