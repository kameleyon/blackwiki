"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Edit3, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  User, 
  Calendar,
  Filter,
  Eye,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

interface Change {
  id: string;
  timestamp: string;
  user: {
    name: string;
    id: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  details: {
    articleTitle?: string;
    changeSize?: number;
    editSummary?: string;
    changeType?: string;
    oldValue?: any;
    newValue?: any;
  };
}

interface ChangeManagerProps {
  articleId?: string;
  showFilters?: boolean;
  limit?: number;
}

export default function ChangeManager({ articleId, showFilters = true, limit }: ChangeManagerProps) {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");

  useEffect(() => {
    fetchChanges();
  }, [articleId, filter, timeRange]);

  const fetchChanges = async () => {
    try {
      const params = new URLSearchParams();
      if (articleId) params.set("articleId", articleId);
      if (filter !== "all") params.set("filter", filter);
      if (timeRange !== "all") params.set("timeRange", timeRange);
      if (limit) params.set("limit", limit.toString());

      const response = await fetch(`/api/changes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setChanges(data);
      }
    } catch (error) {
      console.error("Error fetching changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (action: string) => {
    switch (action) {
      case "article_created": return FileText;
      case "article_updated": return Edit3;
      case "article_status_changed": return TrendingUp;
      case "user_registered": return User;
      default: return Clock;
    }
  };

  const getChangeColor = (action: string) => {
    switch (action) {
      case "article_created": return "text-green-400";
      case "article_updated": return "text-blue-400";
      case "article_status_changed": return "text-yellow-400";
      case "article_deleted": return "text-red-400";
      case "user_registered": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  const getChangeSizeIndicator = (size: number) => {
    if (size > 100) return { icon: TrendingUp, color: "text-green-400", label: `+${size}` };
    if (size < -100) return { icon: TrendingDown, color: "text-red-400", label: `${size}` };
    if (size > 0) return { icon: TrendingUp, color: "text-green-300", label: `+${size}` };
    if (size < 0) return { icon: TrendingDown, color: "text-red-300", label: `${size}` };
    return { icon: Edit3, color: "text-gray-400", label: "0" };
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const formatChangeDescription = (change: Change) => {
    const { action, details } = change;
    
    switch (action) {
      case "article_created":
        return `created article "${details.articleTitle}"`;
      case "article_updated":
        return `edited "${details.articleTitle}"${details.editSummary ? `: ${details.editSummary}` : ""}`;
      case "article_status_changed":
        return `changed status of "${details.articleTitle}" from ${details.oldValue} to ${details.newValue}`;
      case "user_registered":
        return "joined AfroWiki";
      default:
        return action.replace(/_/g, " ");
    }
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
      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Changes</option>
                <option value="articles">Article Changes</option>
                <option value="users">User Changes</option>
                <option value="reviews">Review Changes</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Changes List */}
      <div className="space-y-2">
        {changes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No recent changes found</p>
          </motion.div>
        ) : (
          changes.map((change, index) => {
            const Icon = getChangeIcon(change.action);
            const colorClass = getChangeColor(change.action);
            const changeSize = change.details.changeSize;
            const sizeIndicator = changeSize ? getChangeSizeIndicator(changeSize) : null;

            return (
              <motion.div
                key={change.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{change.user.name}</span>{" "}
                          <span className="text-muted-foreground">
                            {formatChangeDescription(change)}
                          </span>
                        </p>
                        
                        {change.details.editSummary && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{change.details.editSummary}"
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{formatTimeAgo(change.timestamp)}</span>
                          
                          {sizeIndicator && (
                            <div className={`flex items-center gap-1 ${sizeIndicator.color}`}>
                              <sizeIndicator.icon className="h-3 w-3" />
                              <span>{sizeIndicator.label}</span>
                            </div>
                          )}
                          
                          {change.details.changeType && (
                            <span className="px-2 py-0.5 bg-secondary rounded-full">
                              {change.details.changeType}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {change.targetType === "Article" && (
                          <button
                            onClick={() => window.open(`/articles/${change.targetId}`, '_blank')}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title="View article"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      
      {/* Load More */}
      {changes.length > 0 && !limit && (
        <div className="text-center pt-4">
          <button
            onClick={() => {/* Implement pagination */}}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Load More Changes
          </button>
        </div>
      )}
    </div>
  );
}