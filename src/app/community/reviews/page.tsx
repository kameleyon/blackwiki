"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Star,
  TrendingUp,
  Award,
  Users
} from "lucide-react";

interface ReviewTask {
  id: string;
  articleId: string;
  articleTitle: string;
  articleSummary: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  wordCount: number;
  category: string;
  estimatedTime: string;
}

interface ReviewerStats {
  totalReviews: number;
  completedReviews: number;
  averageScore: number;
  reputation: number;
  badges: string[];
  specialties: string[];
}

export default function CommunityReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewTask[]>([]);
  const [stats, setStats] = useState<ReviewerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("priority");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchReviews();
      fetchReviewerStats();
    }
  }, [status, router]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/community/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewerStats = async () => {
    try {
      const response = await fetch("/api/community/reviewer-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching reviewer stats:", error);
    }
  };

  const assignReviewToSelf = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/community/reviews/${reviewId}/assign`, {
        method: "POST",
      });
      
      if (response.ok) {
        // Refresh the reviews list
        fetchReviews();
        // Show success message
        alert("Review assigned successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to assign review");
      }
    } catch (error) {
      console.error("Error assigning review:", error);
      alert("An error occurred while assigning the review");
    }
  };

  const filteredReviews = reviews
    .filter(review => {
      if (filter === "available") return !review.assigneeId;
      if (filter === "mine") return review.assigneeId === session?.user?.id;
      if (filter === "urgent") return review.priority === "urgent" || review.priority === "high";
      return true;
    })
    .filter(review => 
      review.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - 
               priorityOrder[b.priority as keyof typeof priorityOrder];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "type") {
        return a.type.localeCompare(b.type);
      }
      return 0;
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "technical": return "text-blue-400";
      case "editorial": return "text-green-400";
      case "cultural": return "text-purple-400";
      case "factual": return "text-orange-400";
      default: return "text-gray-400";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "normal": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "low": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading review tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-normal mb-4">Community Review Center</h1>
          <p className="text-muted-foreground text-lg">
            Help maintain content quality by reviewing articles in your areas of expertise
          </p>
        </motion.div>

        {/* Reviewer Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Reviews</h3>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-normal">{stats.totalReviews}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.completedReviews} completed
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-normal">{stats.averageScore.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Review quality</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Reputation</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-normal">{stats.reputation}</p>
              <p className="text-sm text-muted-foreground mt-1">Reviewer level</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Badges</h3>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-normal">{stats.badges.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Achievements earned</p>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title, type, or category..."
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
                <option value="all">All Reviews</option>
                <option value="available">Available</option>
                <option value="mine">My Reviews</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Review Tasks List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No review tasks found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for new articles to review
              </p>
            </motion.div>
          ) : (
            filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <FileText className={`h-5 w-5 mt-1 ${getTypeColor(review.type)}`} />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">{review.articleTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{review.articleSummary}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityBadge(review.priority)}`}>
                            {review.priority} priority
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                            {review.type} review
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                            {review.category}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                            {review.wordCount} words
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                            ~{review.estimatedTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {review.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Due {new Date(review.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {review.assigneeName ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-400" />
                              <span>Assigned to {review.assigneeName}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-yellow-400" />
                              <span>Unassigned</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!review.assigneeId ? (
                      <button
                        onClick={() => assignReviewToSelf(review.id)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Assign to Me
                      </button>
                    ) : review.assigneeId === session?.user?.id ? (
                      <button
                        onClick={() => router.push(`/articles/review/${review.articleId}`)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Start Review
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-secondary text-muted-foreground rounded-lg cursor-not-allowed"
                      >
                        Assigned
                      </button>
                    )}
                    
                    <button
                      onClick={() => router.push(`/articles/${review.articleId}`)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      View Article
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}