"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  Flag,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Save,
  Send
} from "lucide-react";
import { useArticle, useReviewDetails, useUpdateReview } from "@/lib/api-hooks";
import ReactMarkdown from "react-markdown";

interface ReviewChecklist {
  id: string;
  label: string;
  checked: boolean;
  category: string;
}

const defaultChecklists: Record<string, ReviewChecklist[]> = {
  technical: [
    { id: "t1", label: "Code examples are correct and functional", checked: false, category: "Code Quality" },
    { id: "t2", label: "Technical terminology is accurate", checked: false, category: "Accuracy" },
    { id: "t3", label: "Security best practices are followed", checked: false, category: "Security" },
    { id: "t4", label: "Performance considerations are addressed", checked: false, category: "Performance" },
    { id: "t5", label: "Technical concepts are explained clearly", checked: false, category: "Clarity" }
  ],
  editorial: [
    { id: "e1", label: "Grammar and spelling are correct", checked: false, category: "Grammar" },
    { id: "e2", label: "Writing style is consistent", checked: false, category: "Style" },
    { id: "e3", label: "Article structure is logical", checked: false, category: "Structure" },
    { id: "e4", label: "Tone is appropriate for the audience", checked: false, category: "Tone" },
    { id: "e5", label: "Content flows smoothly", checked: false, category: "Flow" }
  ],
  cultural: [
    { id: "c1", label: "Cultural references are accurate", checked: false, category: "Accuracy" },
    { id: "c2", label: "Representation is respectful and authentic", checked: false, category: "Respect" },
    { id: "c3", label: "Historical context is properly provided", checked: false, category: "Context" },
    { id: "c4", label: "Cultural sensitivities are respected", checked: false, category: "Sensitivity" },
    { id: "c5", label: "Diverse perspectives are included", checked: false, category: "Diversity" }
  ],
  factual: [
    { id: "f1", label: "Facts are verified with reliable sources", checked: false, category: "Verification" },
    { id: "f2", label: "Citations are properly formatted", checked: false, category: "Citations" },
    { id: "f3", label: "No misleading information present", checked: false, category: "Accuracy" },
    { id: "f4", label: "Statistics are current and relevant", checked: false, category: "Data" },
    { id: "f5", label: "Claims are supported by evidence", checked: false, category: "Evidence" }
  ],
  final: [
    { id: "fn1", label: "Article meets all quality standards", checked: false, category: "Quality" },
    { id: "fn2", label: "Content is ready for publication", checked: false, category: "Readiness" },
    { id: "fn3", label: "All previous review feedback addressed", checked: false, category: "Feedback" },
    { id: "fn4", label: "SEO and metadata are optimized", checked: false, category: "SEO" },
    { id: "fn5", label: "Article adds value to the platform", checked: false, category: "Value" }
  ]
};

export default function ArticleReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const articleId = params.id as string;

  const { data: article, isLoading: articleLoading } = useArticle(articleId);
  const { data: reviews } = useReviewDetails(articleId);
  const updateReview = useUpdateReview();

  const [currentReview, setCurrentReview] = useState<any>(null);
  const [checklist, setChecklist] = useState<ReviewChecklist[]>([]);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [decision, setDecision] = useState<"approve" | "request-changes" | "reject" | "">("");
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    if (reviews && session?.user?.id) {
      const userReview = reviews.find((r: any) => 
        r.assigneeId === session.user.id && r.status !== "completed"
      );
      
      if (userReview) {
        setCurrentReview(userReview);
        
        // Load saved checklist or use default
        const savedChecklist = userReview.checklist ? JSON.parse(userReview.checklist) : null;
        const reviewType = userReview.type as keyof typeof defaultChecklists;
        setChecklist(savedChecklist || defaultChecklists[reviewType] || []);
        
        // Load saved feedback and score
        setFeedback(userReview.feedback || "");
        setScore(userReview.score || 0);
      }
    }
  }, [reviews, session]);

  const handleChecklistChange = (itemId: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const calculateScore = () => {
    const checkedCount = checklist.filter(item => item.checked).length;
    const totalCount = checklist.length;
    return Math.round((checkedCount / totalCount) * 100);
  };

  const saveDraft = async () => {
    if (!currentReview) return;
    
    setSavingDraft(true);
    try {
      await updateReview.mutateAsync({
        reviewId: currentReview.id,
        feedback,
        score: calculateScore(),
        checklist: JSON.stringify(checklist),
        status: "in_progress"
      });
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  const submitReview = async () => {
    if (!currentReview || !decision) {
      alert("Please select a decision before submitting");
      return;
    }

    const finalScore = calculateScore();
    
    try {
      await updateReview.mutateAsync({
        reviewId: currentReview.id,
        feedback,
        score: finalScore,
        checklist: JSON.stringify(checklist),
        status: "completed",
        metadata: JSON.stringify({ decision, completedAt: new Date().toISOString() })
      });

      // Update reviewer reputation based on completion
      await fetch("/api/community/update-reputation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: 10 }) // Base points for completing a review
      });

      alert("Review submitted successfully!");
      router.push("/community/reviews");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  if (articleLoading || !article) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!currentReview) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl text-center">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-medium mb-2">No Active Review</h1>
          <p className="text-muted-foreground mb-6">
            You don't have an active review for this article. Please assign yourself a review from the Review Center first.
          </p>
          <button
            onClick={() => router.push("/community/reviews")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Review Center
          </button>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateScore();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-normal mb-2">{article.title}</h1>
          <p className="text-muted-foreground">
            {currentReview.type.charAt(0).toUpperCase() + currentReview.type.slice(1)} Review
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h2 className="text-xl font-medium mb-4">Article Content</h2>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </motion.div>

            {/* References */}
            {article.references && article.references.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h2 className="text-xl font-medium mb-4">References</h2>
                <ul className="space-y-2">
                  {article.references.map((ref: any, index: number) => (
                    <li key={ref.id} className="text-sm">
                      <span className="text-muted-foreground">[{index + 1}]</span>{" "}
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">
                        {ref.title}
                      </a>
                      {ref.description && (
                        <span className="text-muted-foreground"> - {ref.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-medium mb-4">Review Progress</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Checklist */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-medium mb-4">Review Checklist</h3>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleChecklistChange(item.id)}
                      className="mt-0.5 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Feedback */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-medium mb-4">Review Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback for the author..."
                className="w-full h-32 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </motion.div>

            {/* Decision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-medium mb-4">Review Decision</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={decision === "approve"}
                    onChange={(e) => setDecision(e.target.value as any)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-400" />
                    Approve
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="request-changes"
                    checked={decision === "request-changes"}
                    onChange={(e) => setDecision(e.target.value as any)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-yellow-400" />
                    Request Changes
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={decision === "reject"}
                    onChange={(e) => setDecision(e.target.value as any)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-400" />
                    Reject
                  </span>
                </label>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <button
                onClick={saveDraft}
                disabled={savingDraft}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={submitReview}
                disabled={!decision || !feedback}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Review
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}