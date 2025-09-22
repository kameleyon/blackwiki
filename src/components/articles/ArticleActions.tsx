
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiClock, FiEye } from 'react-icons/fi';
import ChangeTracker from '../collaboration/ChangeTracker';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

interface Version {
  id: string;
  number: number;
  content: string;
  createdAt: Date;
  editId: string | null;
  edit?: {
    type: string;
    summary: string | null;
    user: {
      name: string | null;
    };
  };
}

interface ArticleActionsProps {
  articleId: string;
  authorId?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  factCheckStatus?: 'pass' | 'fail' | 'not-relevant';
  status?: string;
}

export default function ArticleActions({
  articleId,
  authorId,
  currentUserId,
  isAdmin,
  factCheckStatus = 'not-relevant',
  status = 'draft',
}: ArticleActionsProps) {
  // Removed unused function

  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canEdit = currentUserId === authorId || isAdmin;

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/articles/${articleId}/versions`);
      if (!response.ok) throw new Error('Failed to load versions');
      // Convert string dates to Date objects
      const data = await response.json();
      interface APIVersion {
        id: string;
        number: number;
        content: string;
        createdAt: string;
        editId: string | null;
        edit?: {
          type?: string;
          summary: string | null;
          user: {
            name: string | null;
          };
        };
      }
      
      const versionsWithDates = data.map((v: APIVersion) => ({
        ...v,
        createdAt: new Date(v.createdAt),
        edit: v.edit ? {
          ...v.edit,
          type: v.edit.type || 'update', // Provide default type if missing
        } : undefined
      }));
      setVersions(versionsWithDates);
      if (data.length > 0) {
        setCurrentVersionId(data[0].id); // Set most recent version as current
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionRestore = async (versionId: string) => {
    try {
      const response = await fetch(
        `/api/articles/${articleId}/versions/${versionId}/restore`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to restore version');
      
      // Reload versions after restore
      await loadVersions();
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  // Handle submit for review
  const handleSubmitForReview = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const response = await fetch(`/api/articles/confirm/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'confirm'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit article for review');
      }
      
      // Redirect to dashboard after successful submission
      const data = await response.json();
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (error) {
      console.error('Error submitting article:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit article for review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Debug info */}
      <div className="text-xs text-white/50 mb-2">
        Status: {status}, CanEdit: {canEdit ? 'true' : 'false'}, FactCheck: {factCheckStatus}
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        {canEdit && (
          <>
            <Link
              href={`/articles/edit/${articleId}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
            >
              <FiEdit size={16} />
              Edit Article
            </Link>
            <button
              onClick={() => {
                setShowVersions(true);
                loadVersions();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
            >
              <FiClock size={16} />
              Version History
            </button>
            
            {/* Submit for Review Button - always show for debugging */}
            <button
              onClick={handleSubmitForReview}
              disabled={isSubmitting || factCheckStatus === 'fail'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${factCheckStatus === 'fail' 
                  ? 'bg-red-500/20 text-red-200 cursor-not-allowed' 
                  : 'bg-green-500/20 text-green-200 hover:bg-green-500/30'}`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/80 rounded-full border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FiEye size={16} />
                  Submit for Review
                </>
              )}
            </button>
          </>
        )}
        
        {/* Fact check badge is now displayed in the review page */}
      </div>
      
      {/* Error message */}
      {submitError && (
        <div className="text-red-400 text-sm mt-2 p-2 bg-red-500/10 rounded">
          {submitError}
        </div>
      )}

      {showVersions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white/90">Version History</h2>
              <button
                onClick={() => setShowVersions(false)}
                className="text-white/60 hover:text-white/80"
              >
                Close
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <SkeletonLoader variant="text" width="120px" height="16px" />
                      <SkeletonLoader variant="text" width="80px" height="14px" />
                    </div>
                    <SkeletonLoader variant="text" width="100%" height="40px" className="mb-2" />
                    <div className="flex items-center justify-between">
                      <SkeletonLoader variant="text" width="150px" height="12px" />
                      <SkeletonLoader variant="rectangular" width="60px" height="24px" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ChangeTracker
                versions={versions}
                currentVersionId={currentVersionId || versions[0]?.id}
                onVersionRestore={handleVersionRestore}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
