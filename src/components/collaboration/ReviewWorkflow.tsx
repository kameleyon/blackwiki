"use client";

import { useState, useEffect } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import ReviewStage from './ReviewStage';
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

export default function ReviewWorkflow({
  articleId,
}: ReviewWorkflowProps) {
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

  useEffect(() => {
    // Load review state from the server
    const loadReviewState = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/review-state`);
        if (response.ok) {
          const data = await response.json();
          setReviewState(data);
        }
      } catch (error) {
        console.error('Error loading review state:', error);
      }
    };

    loadReviewState();
  }, [articleId]);

  const handleChecklistItemToggle = async (stageId: string, itemId: string) => {
    const stage = reviewState.stages[stageId];
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

    setReviewState(updatedState);

    try {
      await fetch(`/api/articles/${articleId}/review-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const handleSubmitFeedback = async (stageId: string, feedback: string) => {
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

    setReviewState(updatedState);

    try {
      await fetch(`/api/articles/${articleId}/review-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const handleSubmitScore = async (stageId: string, score: number) => {
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

    setReviewState(updatedState);

    try {
      await fetch(`/api/articles/${articleId}/review-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleCompleteStage = async (stageId: string) => {
    const currentIndex = defaultStages.findIndex(s => s.id === stageId);
    const nextStage = defaultStages[currentIndex + 1]?.id;

    const updatedState = {
      ...reviewState,
      currentStage: nextStage || stageId,
      stages: {
        ...reviewState.stages,
        [stageId]: {
          ...reviewState.stages[stageId],
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

    setReviewState(updatedState);

    try {
      await fetch(`/api/articles/${articleId}/review-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
    } catch (error) {
      console.error('Error completing stage:', error);
    }
  };

  const handleBlockStage = async (stageId: string, reason: string) => {
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

    setReviewState(updatedState);

    try {
      await fetch(`/api/articles/${articleId}/review-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
    } catch (error) {
      console.error('Error blocking stage:', error);
    }
  };

  const handleUnblockStage = async (stageId: string) => {
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

    setReviewState(updatedState);

    try {
      await fetch(`/api/articles/${articleId}/review-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
    } catch (error) {
      console.error('Error unblocking stage:', error);
    }
  };

  return (
    <div className="review-workflow">
      {defaultStages.map((stage, index) => (
        <div key={stage.id} className="relative">
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
            <div className="flex justify-center my-4">
              <FiChevronRight className="text-white/20" size={24} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
