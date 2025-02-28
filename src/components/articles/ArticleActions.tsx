
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiClock, FiEye } from 'react-icons/fi';
import ChangeTracker from '../collaboration/ChangeTracker';

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
  isPublished?: boolean;
  factCheckStatus?: 'pass' | 'fail' | 'not-relevant';
}

export default function ArticleActions({
  articleId,
  authorId,
  currentUserId,
  isAdmin,
  isPublished,
  factCheckStatus = 'not-relevant',
}: ArticleActionsProps) {
  // Display fact check status badge
  const getFactCheckBadge = () => {
    switch (factCheckStatus) {
      case 'pass':
        return <div className="text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full">Fact Check: Passed</div>;
      case 'fail':
        return <div className="text-sm text-red-400 bg-red-400/10 px-3 py-1 rounded-full">Fact Check: Failed</div>;
      default:
        return null;
    }
  };

  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="space-y-4">
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
          </>
        )}
        {!isPublished && canEdit && (
          <div className="text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full">
            <FiEye className="inline mr-1" size={14} />
            Draft
          </div>
        )}
        {factCheckStatus !== 'not-relevant' && getFactCheckBadge()}
      </div>

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
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/80"></div>
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
