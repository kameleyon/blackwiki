"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Bell, 
  BellOff, 
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Clock,
  TrendingUp,
  Star
} from "lucide-react";
import Link from "next/link";

interface WatchedArticle {
  id: string;
  articleId: string;
  article: {
    id: string;
    title: string;
    summary: string;
    slug: string;
    status: string;
    views: number;
    likes: number;
    updatedAt: string;
    author: {
      name: string;
    };
  };
  createdAt: string;
  hasUnreadChanges: boolean;
  lastChangeDate: string;
}

interface WatchlistProps {
  userId: string;
  showHeader?: boolean;
}

export default function Watchlist({ userId, showHeader = true }: WatchlistProps) {
  const [watchedArticles, setWatchedArticles] = useState<WatchedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  useEffect(() => {
    fetchWatchlist();
  }, [userId]);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch(`/api/watchlist`);
      if (response.ok) {
        const data = await response.json();
        setWatchedArticles(data);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatch = async (articleId: string, isWatched: boolean) => {
    try {
      const method = isWatched ? "DELETE" : "POST";
      const response = await fetch(`/api/watchlist/${articleId}`, { method });
      
      if (response.ok) {
        if (isWatched) {
          setWatchedArticles(prev => prev.filter(w => w.articleId !== articleId));
        } else {
          // Refetch to get the new item with full data
          fetchWatchlist();
        }
      }
    } catch (error) {
      console.error("Error toggling watch:", error);
    }
  };

  const markAsRead = async (articleId: string) => {
    try {
      const response = await fetch(`/api/watchlist/${articleId}/mark-read`, {
        method: "POST"
      });
      
      if (response.ok) {
        setWatchedArticles(prev => 
          prev.map(w => 
            w.articleId === articleId 
              ? { ...w, hasUnreadChanges: false }
              : w
          )
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const filteredArticles = watchedArticles
    .filter(w => {
      if (filter === "unread") return w.hasUnreadChanges;
      if (filter === "updated") return new Date(w.lastChangeDate) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      return true;
    })
    .filter(w => 
      w.article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.article.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.article.title.localeCompare(b.article.title);
        case "views":
          return b.article.views - a.article.views;
        case "likes":
          return b.article.likes - a.article.likes;
        case "recent":
        default:
          return new Date(b.lastChangeDate).getTime() - new Date(a.lastChangeDate).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-400";
      case "pending_review": return "text-yellow-400";
      case "draft": return "text-gray-400";
      default: return "text-blue-400";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "just updated";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-normal">My Watchlist</h2>
            <p className="text-muted-foreground">
              {watchedArticles.length} articles being watched
              {watchedArticles.filter(w => w.hasUnreadChanges).length > 0 && (
                <span className="text-yellow-400 ml-2">
                  • {watchedArticles.filter(w => w.hasUnreadChanges).length} unread
                </span>
              )}
            </p>
          </div>
          <Bell className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-lg p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search watched articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Articles</option>
              <option value="unread">Unread Changes</option>
              <option value="updated">Recently Updated</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="recent">Recently Updated</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm || filter !== "all" 
                ? "No articles match your filters" 
                : "You're not watching any articles yet"
              }
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Click the watch icon on any article to start tracking changes
            </p>
          </motion.div>
        ) : (
          filteredArticles.map((watch, index) => (
            <motion.div
              key={watch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors ${
                watch.hasUnreadChanges ? "border-yellow-400/50 bg-yellow-400/5" : "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link 
                      href={`/articles/${watch.article.slug}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                      onClick={() => markAsRead(watch.articleId)}
                    >
                      {watch.article.title}
                      {watch.hasUnreadChanges && (
                        <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                      )}
                    </Link>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => markAsRead(watch.articleId)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleWatch(watch.articleId, true)}
                        className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Stop watching"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/articles/${watch.article.slug}`}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="View article"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {watch.article.summary}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>by {watch.article.author.name}</span>
                    <span className={getStatusColor(watch.article.status)}>
                      {watch.article.status.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{watch.article.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>{watch.article.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(watch.lastChangeDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}