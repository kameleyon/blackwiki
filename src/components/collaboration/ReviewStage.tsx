"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiCheck, FiClock, FiAlertCircle, FiLock } from 'react-icons/fi';
import './review-workflow.css';

interface ReviewStageProps {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  checklist: {
    id: string;
    label: string;
    completed: boolean;
  }[];
  feedback?: string;
  score?: number;
  assignee?: {
    id: string;
    name: string;
    role: string;
    image?: string;
  };
  onChecklistItemToggle: (itemId: string) => void;
  onSubmitFeedback: (feedback: string) => void;
  onSubmitScore: (score: number) => void;
  onComplete: () => void;
  onBlock: (reason: string) => void;
  onUnblock: () => void;
  blockReason?: string;
  isCurrentStage: boolean;
}

export default function ReviewStage({
  title,
  description,
  status,
  checklist,
  feedback,
  score,
  assignee,
  onChecklistItemToggle,
  onSubmitFeedback,
  onSubmitScore,
  onComplete,
  onBlock,
  onUnblock,
  blockReason,
  isCurrentStage,
}: ReviewStageProps) {
  const [newFeedback, setNewFeedback] = useState(feedback || '');
  const [newScore, setNewScore] = useState(score || 0);
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <FiCheck size={16} />;
      case 'in_progress':
        return <FiClock size={16} />;
      case 'blocked':
        return <FiAlertCircle size={16} />;
      default:
        return <FiLock size={16} />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'completed':
        return 'review-stage-status-completed';
      case 'in_progress':
        return 'review-stage-status-in-progress';
      case 'blocked':
        return 'review-stage-status-blocked';
      default:
        return 'review-stage-status-pending';
    }
  };

  const handleSubmit = () => {
    onSubmitFeedback(newFeedback);
    onSubmitScore(newScore);
    onComplete();
  };

  const handleBlock = () => {
    onBlock(blockReasonInput);
    setShowBlockDialog(false);
    setBlockReasonInput('');
  };

  return (
    <div className={`review-stage ${!isCurrentStage && 'opacity-60'}`}>
      <div className="review-stage-header">
        <div>
          <h3 className="review-stage-title">{title}</h3>
          <p className="text-sm text-white/60">{description}</p>
        </div>
        <div className={`review-stage-status ${getStatusClass()}`}>
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </span>
        </div>
      </div>

      {assignee && (
        <div className="review-assignment">
          <div className="review-assignment-header">
            <h4 className="review-assignment-title">Assigned Reviewer</h4>
          </div>
          <div className="review-assignment-user">
            {assignee.image ? (
              <Image
                src={assignee.image}
                alt={assignee.name}
                width={40}
                height={40}
                className="review-assignment-avatar"
              />
            ) : (
              <div className="review-assignment-avatar" />
            )}
            <div className="review-assignment-info">
              <div className="review-assignment-name">{assignee.name}</div>
              <div className="review-assignment-role">{assignee.role}</div>
            </div>
          </div>
        </div>
      )}

      <div className="review-checklist">
        {checklist.map((item) => (
          <div key={item.id} className="review-checklist-item">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onChecklistItemToggle(item.id)}
              className="review-checklist-checkbox"
              disabled={!isCurrentStage || status === 'blocked'}
            />
            <label className="review-checklist-label">{item.label}</label>
          </div>
        ))}
      </div>

      {isCurrentStage && status !== 'blocked' && (
        <>
          <div className="review-feedback">
            <div className="review-feedback-header">
              <h4 className="review-feedback-title">Feedback</h4>
            </div>
            <textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              className="w-full bg-white/5 rounded-lg p-3 text-sm text-white/80 mt-2"
              placeholder="Enter your feedback..."
              rows={4}
            />
          </div>

          <div className="review-score">
            <span className="review-score-label">Score:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={newScore}
              onChange={(e) => setNewScore(parseInt(e.target.value, 10))}
              className="w-20 bg-white/5 rounded p-2 text-sm text-white/80"
            />
          </div>

          <div className="review-actions">
            <button
              onClick={() => setShowBlockDialog(true)}
              className="review-action-button review-action-button-secondary"
            >
              Block Stage
            </button>
            <button
              onClick={handleSubmit}
              className="review-action-button review-action-button-primary"
              disabled={checklist.some((item) => !item.completed)}
            >
              Complete Review
            </button>
          </div>
        </>
      )}

      {status === 'blocked' && (
        <div className="review-error mt-4">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertCircle size={16} />
            <span className="font-medium">Stage Blocked</span>
          </div>
          <p className="text-sm">{blockReason}</p>
          {isCurrentStage && (
            <button
              onClick={onUnblock}
              className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm"
            >
              Unblock Stage
            </button>
          )}
        </div>
      )}

      {showBlockDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-black/90 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Block Stage</h3>
            <textarea
              value={blockReasonInput}
              onChange={(e) => setBlockReasonInput(e.target.value)}
              className="w-full bg-white/5 rounded-lg p-3 text-sm text-white/80"
              placeholder="Enter reason for blocking..."
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowBlockDialog(false)}
                className="review-action-button review-action-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                className="review-action-button review-action-button-primary"
                disabled={!blockReasonInput}
              >
                Block Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
