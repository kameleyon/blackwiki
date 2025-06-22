"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ArticleWorkflow from "@/components/articles/ArticleWorkflow";
import { useArticle } from "@/lib/api-hooks";

export default function ArticleWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const articleId = params.id as string;
  
  const { data: article, isLoading, refetch } = useArticle(articleId);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (session && session.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        refetch();
        alert("Status updated successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status");
    } finally {
      setUpdating(false);
    }
  };

  const handleQualityChange = async (newGrade: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualityGrade: newGrade })
      });

      if (response.ok) {
        refetch();
        alert("Quality grade updated successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update quality grade");
      }
    } catch (error) {
      console.error("Error updating quality grade:", error);
      alert("An error occurred while updating the quality grade");
    } finally {
      setUpdating(false);
    }
  };

  const handleProtectionChange = async (newLevel: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protectionLevel: newLevel })
      });

      if (response.ok) {
        refetch();
        alert("Protection level updated successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update protection level");
      }
    } catch (error) {
      console.error("Error updating protection level:", error);
      alert("An error occurred while updating the protection level");
    } finally {
      setUpdating(false);
    }
  };

  const handleArchiveToggle = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !article?.isArchived })
      });

      if (response.ok) {
        refetch();
        alert(`Article ${article?.isArchived ? "unarchived" : "archived"} successfully!`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to toggle archive status");
      }
    } catch (error) {
      console.error("Error toggling archive status:", error);
      alert("An error occurred while toggling archive status");
    } finally {
      setUpdating(false);
    }
  };

  const handleFeatureToggle = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/workflow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !article?.featured })
      });

      if (response.ok) {
        refetch();
        alert(`Article ${article?.featured ? "unfeatured" : "featured"} successfully!`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to toggle featured status");
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
      alert("An error occurred while toggling featured status");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || !article) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/admin/articles")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </button>
          
          <h1 className="text-3xl font-normal mb-2">Article Workflow Management</h1>
          <p className="text-muted-foreground">
            Manage the status, quality, and metadata for: <span className="font-medium">{article.title}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Workflow Section */}
          <div className="lg:col-span-2">
            <ArticleWorkflow
              articleId={article.id}
              currentStatus={article.status}
              qualityGrade={article.qualityGrade || undefined}
              protectionLevel={article.protectionLevel}
              isArchived={article.isArchived}
              featured={article.featured}
              onStatusChange={handleStatusChange}
              onQualityChange={handleQualityChange}
              onProtectionChange={handleProtectionChange}
              onArchiveToggle={handleArchiveToggle}
              onFeatureToggle={handleFeatureToggle}
              isAdmin={true}
            />
          </div>

          {/* Article Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h3 className="text-lg font-medium mb-4">Article Preview</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Title</p>
                <p className="font-medium">{article.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Author</p>
                <p>{article.author?.name || "Unknown"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Summary</p>
                <p className="text-sm">{article.summary}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {article.categories.map((cat: any) => (
                    <span key={cat.id} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metrics</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Views:</span> {article.views}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Likes:</span> {article.likes}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => router.push(`/articles/${article.slug}`)}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Article
                </button>
                <button
                  onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Edit Article
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}