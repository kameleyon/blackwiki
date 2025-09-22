import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReviewStage from './ReviewStage';
import { FiChevronRight, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import './review-workflow.css';

interface ReviewWorkflowProps {
  articleId: string;
}

interface ReviewStageData {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'editorial' | 'final';
  checklist: {
    id: string;
    label: string;
    completed: boolean;
  }[];
  assignee?: {
    id: string;
    name: string;
    role: string;
    image?: string;
  };
}

const defaultStages: ReviewStageData[] = [
  {
    id: 'technical',
    title: 'Technical Review',
    description: 'Review article for technical accuracy and citations',
    type: 'technical',
    checklist: [
      { id: 'tech1', label: 'Verify technical accuracy of content', completed: false },
      { id: 'tech2', label: 'Check citations and references', completed: false },
      { id: 'tech3', label: 'Review code snippets or technical examples', completed: false },
      { id: 'tech4', label: 'Validate external links', completed: false },
    ],
  },
  {
    id: 'editorial',
    title: 'Editorial Review',
    description: 'Review article for clarity, style, and grammar',
    type: 'editorial',
    checklist: [
      { id: 'edit1', label: 'Check grammar and spelling', completed: false },
      { id: 'edit2', label: 'Review writing style and clarity', completed: false },
      { id: 'edit3', label: 'Ensure consistent formatting', completed: false },
      { id: 'edit4', label: 'Verify article structure', completed: false },
    ],
  },
  {
    id: 'final',
    title: 'Final Review',
    description: 'Final review before publication',
    type: 'final',
    checklist: [
      { id: 'final1', label: 'Review all previous feedback', completed: false },
      { id: 'final2', label: 'Check article metadata', completed: false },
      { id: 'final3', label: 'Verify SEO elements', completed: false },
      { id: 'final4', label: 'Final content approval', completed: false },
    ],
  },
];

export default function ReviewWorkflowEnhanced({ articleId }: ReviewWorkflowProps) {
  const [reviewState, setReviewState] = useState<{
    currentStage: string;
    stages: {
      [key: string]: {
        status: 'pending' | 'in_progress' | 'completed' | 'blocked';
        feedback?: string;
        score?: number;
        blockReason?: string;
        checklist: { id: string; label: string; completed: boolean }[];
      };
    };
  }>({
    currentStage: 'technical',
    stages: defaultStages.reduce((acc, stage) => ({
      ...acc,
      [stage.id]: {
        status: stage.id === 'technical' ? 'in_progress' : 'pending',
        checklist: stage.checklist,
      },
    }), {}),
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const updateReviewState = async (updatedState: typeof reviewState, retryOriginal = true) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/articles/${articleId}/review-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating review state:', error);
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setError(errorMessage);
      
      // Auto-retry logic for network errors
      if (retryOriginal && retryCount < 2 && errorMessage.includes('Failed to fetch')) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          updateReviewState(updatedState, false);
        }, 1000);
        return;
      }
      
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadReviewState = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/articles/${articleId}/review-state`);
        
        if (response.ok) {
          const data = await response.json();
          setReviewState(data);
          setRetryCount(0); // Reset retry count on successful load
        } else if (response.status === 404) {
          // Article review not started yet, use default state
          console.log('Review state not found, using defaults');
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to load review state' }));
          setError(errorData.error || `HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Error loading review state:', error);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    loadReviewState();
  }, [articleId]);

  const handleChecklistItemToggle = async (stageId: string, itemId: string) => {
    const stage = reviewState.stages[stageId];
    if (!stage || stage.status === 'completed') return;
    
    const originalState = { ...reviewState };
    const updatedChecklist = stage.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedState = {
      ...reviewState,
      stages: {
        ...reviewState.stages,
        [stageId]: {
          ...stage,
          checklist: updatedChecklist,
        },
      },
    };

    // Optimistic update
    setReviewState(updatedState);

    try {
      await updateReviewState(updatedState);
    } catch (error) {
      // Revert on error
      setReviewState(originalState);
    }
  };

  const handleSubmitFeedback = async (stageId: string, feedback: string) => {
    const stage = reviewState.stages[stageId];
    if (!stage) return;
    
    const originalState = { ...reviewState };
    const updatedState = {
      ...reviewState,
      stages: {
        ...reviewState.stages,
        [stageId]: {
          ...reviewState.stages[stageId],
          feedback,
        },
      },
    };

    // Optimistic update
    setReviewState(updatedState);

    try {
      await updateReviewState(updatedState);
    } catch (error) {
      // Revert on error
      setReviewState(originalState);
    }
  };

  const handleSubmitScore = async (stageId: string, score: number) => {
    const stage = reviewState.stages[stageId];
    if (!stage || score < 1 || score > 100) return;
    
    const originalState = { ...reviewState };
    const updatedState = {
      ...reviewState,
      stages: {
        ...reviewState.stages,
        [stageId]: {
          ...reviewState.stages[stageId],
          score,
        },
      },
    };

    // Optimistic update
    setReviewState(updatedState);

    try {
      await updateReviewState(updatedState);
    } catch (error) {
      // Revert on error
      setReviewState(originalState);
    }
  };

  const handleCompleteStage = async (stageId: string) => {
    const stage = reviewState.stages[stageId];
    if (!stage || stage.status === 'completed') return;
    
    // Validation checks
    const allItemsCompleted = stage.checklist.every(item => item.completed);
    if (!allItemsCompleted) {
      setError('Please complete all checklist items before finishing this stage.');
      return;
    }
    
    if (!stage.feedback?.trim()) {
      setError('Please provide feedback before completing this stage.');
      return;
    }
    
    if (!stage.score || stage.score < 1) {
      setError('Please provide a score (1-100) before completing this stage.');
      return;
    }

    const currentIndex = defaultStages.findIndex(s => s.id === stageId);
    const nextStage = defaultStages[currentIndex + 1]?.id;
    
    const originalState = { ...reviewState };
    const updatedState = {
      ...reviewState,
      currentStage: nextStage || stageId,
      stages: {
        ...reviewState.stages,
        [stageId]: {
          ...stage,
          status: 'completed' as const,
        },
        ...(nextStage && {
          [nextStage]: {
            ...reviewState.stages[nextStage],
            status: 'in_progress' as const,
          },
        }),
      },
    };

    // Optimistic update
    setReviewState(updatedState);

    try {
      await updateReviewState(updatedState);
      setError(null); // Clear any previous errors on success
    } catch (error) {
      // Revert on error
      setReviewState(originalState);
    }
  };

  const handleBlockStage = async (stageId: string, reason: string) => {
    const stage = reviewState.stages[stageId];
    if (!stage || !reason.trim()) {
      setError('Please provide a reason for blocking this stage.');
      return;
    }
    
    const originalState = { ...reviewState };
    const updatedState = {
      ...reviewState,
      stages: {
        ...reviewState.stages,
        [stageId]: {
          ...reviewState.stages[stageId],
          status: 'blocked' as const,
          blockReason: reason,
        },
      },
    };

    // Optimistic update
    setReviewState(updatedState);

    try {
      await updateReviewState(updatedState);
      setError(null);
    } catch (error) {
      // Revert on error
      setReviewState(originalState);
    }
  };

  const handleUnblockStage = async (stageId: string) => {
    const stage = reviewState.stages[stageId];
    if (!stage || stage.status !== 'blocked') return;
    
    const originalState = { ...reviewState };
    const updatedState = {
      ...reviewState,
      stages: {
        ...reviewState.stages,
        [stageId]: {
          ...reviewState.stages[stageId],
          status: 'in_progress' as const,
          blockReason: undefined,
        },
      },
    };

    // Optimistic update
    setReviewState(updatedState);

    try {
      await updateReviewState(updatedState);
      setError(null);
    } catch (error) {
      // Revert on error
      setReviewState(originalState);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="review-workflow-container">
        <motion.div 
          className="flex items-center justify-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-white/60">Loading review workflow...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="review-workflow-container">
      <div className="review-workflow-header mb-6">
        <motion.h2 
          className="text-xl font-semibold mb-2 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Article Review Workflow
          {saving && (
            <div className="ml-3 flex items-center text-sm text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
              Saving...
            </div>
          )}
        </motion.h2>
        
        {/* Progress indicator */}
        <div className="flex items-center space-x-2 text-sm text-white/60">
          <span>Progress:</span>
          <div className="flex space-x-1">
            {defaultStages.map((stage, index) => (
              <div
                key={stage.id}
                className={`w-2 h-2 rounded-full ${
                  reviewState.stages[stage.id].status === 'completed'
                    ? 'bg-green-500'
                    : reviewState.stages[stage.id].status === 'in_progress'
                    ? 'bg-blue-500'
                    : reviewState.stages[stage.id].status === 'blocked'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
          <span>
            {defaultStages.filter(s => reviewState.stages[s.id].status === 'completed').length} / {defaultStages.length}
          </span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <motion.div 
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors text-sm flex items-center"
            >
              <FiRefreshCw className="w-3 h-3 mr-1" />
              Retry
            </button>
          </div>
        </motion.div>
      )}
      
      <div className="review-workflow">
        {defaultStages.map((stage, index) => (
          <motion.div 
            key={stage.id} 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ReviewStage
              title={stage.title}
              description={stage.description}
              status={reviewState.stages[stage.id].status}
              checklist={reviewState.stages[stage.id].checklist}
              feedback={reviewState.stages[stage.id].feedback}
              score={reviewState.stages[stage.id].score}
              assignee={stage.assignee}
              onChecklistItemToggle={(itemId) => handleChecklistItemToggle(stage.id, itemId)}
              onSubmitFeedback={(feedback) => handleSubmitFeedback(stage.id, feedback)}
              onSubmitScore={(score) => handleSubmitScore(stage.id, score)}
              onComplete={() => handleCompleteStage(stage.id)}
              onBlock={(reason) => handleBlockStage(stage.id, reason)}
              onUnblock={() => handleUnblockStage(stage.id)}
              blockReason={reviewState.stages[stage.id].blockReason}
              isCurrentStage={reviewState.currentStage === stage.id}
            />
            {index < defaultStages.length - 1 && (
              <motion.div 
                className="flex justify-center my-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (index * 0.1) + 0.05 }}
              >
                <FiChevronRight className="text-white/20" size={24} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}