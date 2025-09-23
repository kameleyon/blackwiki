"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  FiMessageSquare, FiCornerDownRight, FiEdit2, 
  FiTrash2, FiSend, FiClock, FiUser, FiMoreVertical
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export type DiscussionMessage = {
  id: string;
  content: string;
  authorId: string;
  authorName: string | null;
  authorImage?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  parentId?: string | null;
  targetId: string;
  targetType: 'article' | 'user';
  replies?: DiscussionMessage[];
  isEditing?: boolean;
};

interface DiscussionSystemProps {
  targetId: string;
  targetType: 'article' | 'user';
  targetTitle: string;
  currentUser?: { id: string; name: string | null; image?: string | null } | null;
  isOwnPage?: boolean;
}

const DiscussionSystem: React.FC<DiscussionSystemProps> = ({
  targetId,
  targetType,
  targetTitle,
  currentUser,
  isOwnPage = false
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch discussion messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/discussions/${targetType}/${targetId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(organizeMessages(data.messages || []));
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (targetId) {
      fetchMessages();
    }
  }, [targetId, targetType]);

  // Organize messages into a tree structure
  const organizeMessages = (flatMessages: DiscussionMessage[]): DiscussionMessage[] => {
    const messageMap: Record<string, DiscussionMessage> = {};
    const rootMessages: DiscussionMessage[] = [];

    // First pass: create a map of all messages
    flatMessages.forEach(message => {
      messageMap[message.id] = { 
        ...message, 
        replies: [] 
      };
    });

    // Second pass: organize into parent-child relationships
    flatMessages.forEach(message => {
      if (message.parentId && messageMap[message.parentId]) {
        messageMap[message.parentId].replies!.push(messageMap[message.id]);
      } else {
        rootMessages.push(messageMap[message.id]);
      }
    });

    // Sort by creation date (newest first for root messages, oldest first for replies)
    rootMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const sortReplies = (msg: DiscussionMessage) => {
      if (msg.replies) {
        msg.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        msg.replies.forEach(sortReplies);
      }
    };
    rootMessages.forEach(sortReplies);

    return rootMessages;
  };

  // Handle adding a new message
  const handleAddMessage = async (isReply = false) => {
    const content = isReply ? replyContent : newMessage;
    const parentId = isReply ? replyingTo : null;
    
    if (!session?.user || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/discussions/${targetType}/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh messages
        const messagesResponse = await fetch(`/api/discussions/${targetType}/${targetId}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(organizeMessages(messagesData.messages || []));
        }
        
        // Clear form
        if (isReply) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setNewMessage('');
        }
      } else {
        console.error('Failed to add message');
      }
    } catch (error) {
      console.error('Error adding message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing a message
  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/discussions/message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });

      if (response.ok) {
        // Refresh messages
        const messagesResponse = await fetch(`/api/discussions/${targetType}/${targetId}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(organizeMessages(messagesData.messages || []));
        }
        
        setEditingMessage(null);
        setEditContent('');
      } else {
        console.error('Failed to edit message');
      }
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/discussions/message/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh messages
        const messagesResponse = await fetch(`/api/discussions/${targetType}/${targetId}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(organizeMessages(messagesData.messages || []));
        }
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Render a single message
  const renderMessage = (message: DiscussionMessage, depth = 0) => {
    const isAuthor = currentUser?.id === message.authorId;
    const canEdit = isAuthor;
    const canDelete = isAuthor || currentUser?.id === targetId; // Target user can delete messages on their page

    return (
      <div key={message.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mb-6'}`}>
        <div className={`bg-white/5 rounded-lg p-4 ${depth > 0 ? 'border-l-2 border-white/10' : ''}`}>
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-black/30 overflow-hidden flex-shrink-0">
              {message.authorImage ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={message.authorImage} 
                    alt={`${message.authorName}'s avatar`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-white/60">
                  {message.authorName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{message.authorName || 'Anonymous'}</span>
                  <span className="text-xs text-white/50 flex items-center gap-1">
                    <FiClock size={10} />
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                  {message.updatedAt && message.updatedAt !== message.createdAt && (
                    <span className="text-xs text-white/40">(edited)</span>
                  )}
                </div>
                
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingMessage(message.id);
                          setEditContent(message.content);
                        }}
                        className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white/80"
                      >
                        <FiEdit2 size={12} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 hover:bg-white/10 rounded text-red-400/70 hover:text-red-400"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              {editingMessage === message.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    rows={3}
                    placeholder="Edit your message..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditMessage(message.id)}
                      disabled={isSubmitting || !editContent.trim()}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 rounded text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingMessage(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-white/90 whitespace-pre-wrap text-sm mb-3">
                    {message.content}
                  </div>
                  
                  {/* Actions */}
                  {session?.user && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReplyingTo(message.id);
                          setReplyContent('');
                        }}
                        className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
                      >
                        <FiCornerDownRight size={10} />
                        Reply
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Reply Form */}
              {replyingTo === message.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    rows={3}
                    placeholder={`Reply to ${message.authorName}...`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddMessage(true)}
                      disabled={isSubmitting || !replyContent.trim()}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 rounded text-sm transition-colors flex items-center gap-1"
                    >
                      <FiSend size={12} />
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render replies */}
        {message.replies && message.replies.map(reply => renderMessage(reply, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20 mx-auto mb-2"></div>
        <div className="text-white/60">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Message Form */}
      {session?.user && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <FiMessageSquare size={16} />
            {targetType === 'article' ? 'Start a Discussion' : 'Leave a Message'}
          </h3>
          <div className="space-y-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              rows={4}
              placeholder={
                targetType === 'article' 
                  ? `Share your thoughts about "${targetTitle}"...`
                  : `Leave a message for ${targetTitle}...`
              }
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-white/50">
                {targetType === 'article' 
                  ? 'Discuss improvements, share insights, or ask questions about this article'
                  : 'Be respectful and constructive in your message'}
              </div>
              <button
                onClick={() => handleAddMessage(false)}
                disabled={isSubmitting || !newMessage.trim()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 rounded-lg transition-colors flex items-center gap-2"
              >
                <FiSend size={14} />
                {isSubmitting ? 'Posting...' : 'Post Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <FiMessageSquare className="mx-auto mb-3" size={32} />
            <div className="text-lg mb-2">No messages yet</div>
            <div className="text-sm">
              {targetType === 'article' 
                ? 'Be the first to start a discussion about this article'
                : 'Be the first to leave a message'}
            </div>
          </div>
        ) : (
          messages.map(message => renderMessage(message))
        )}
      </div>
    </div>
  );
};

export default DiscussionSystem;