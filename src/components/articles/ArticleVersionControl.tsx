"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ChangeTracker from '@/components/collaboration/ChangeTracker';
import { ErrorState } from '@/components/ui/ErrorState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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

interface ArticleVersionControlProps {
  articleId: string;
  authorId: string;
}

export default function ArticleVersionControl({ articleId, authorId }: ArticleVersionControlProps) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');

  // Check if user has permission to view version history
  const canViewVersions = session?.user && (
    (session.user as any).id === authorId || 
    (session.user as any).role === 'admin' ||
    (session.user as any).role === 'editor'
  );

  useEffect(() => {
    if (isExpanded && canViewVersions && versions.length === 0) {
      fetchVersions();
    }
  }, [isExpanded, canViewVersions, articleId]);

  const fetchVersions = async () => {
    if (!canViewVersions) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/articles/${articleId}/versions`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('You don\'t have permission to view version history');
          return;
        }
        throw new Error('Failed to fetch version history');
      }
      
      const versionsData = await response.json();
      
      // Convert date strings back to Date objects
      const processedVersions = versionsData.map((version: any) => ({
        ...version,
        createdAt: new Date(version.createdAt)
      }));
      
      setVersions(processedVersions);
      
      // Set the current version (latest one)
      if (processedVersions.length > 0) {
        setCurrentVersionId(processedVersions[0].id);
      }
    } catch (err) {
      console.error('Error fetching versions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionRestore = async (versionId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/articles/${articleId}/versions/${versionId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You don\'t have permission to restore versions');
        }
        throw new Error('Failed to restore version');
      }

      // Refresh the page to show the restored content
      window.location.reload();
    } catch (err) {
      console.error('Error restoring version:', err);
      throw err; // Re-throw to let ChangeTracker handle the error display
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!canViewVersions) {
    return null; // Don't show version control if user doesn't have permission
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      {/* Version History Toggle */}
      <button
        onClick={handleToggleExpanded}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FiClock className="text-white/60" size={16} />
          <span className="font-medium">Version History</span>
          {versions.length > 0 && (
            <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
              {versions.length} versions
            </span>
          )}
        </div>
        {isExpanded ? (
          <FiChevronUp className="text-white/40" size={16} />
        ) : (
          <FiChevronDown className="text-white/40" size={16} />
        )}
      </button>

      {/* Version History Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : error ? (
            <ErrorState
              type="generic"
              title="Failed to Load Versions"
              message={error}
              onRetry={fetchVersions}
              className="py-6"
            />
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <FiClock className="mx-auto mb-2" size={24} />
              <p>No version history available yet.</p>
              <p className="text-xs mt-1">Versions will appear when the article is edited.</p>
            </div>
          ) : (
            <ChangeTracker
              versions={versions}
              currentVersionId={currentVersionId}
              onVersionRestore={handleVersionRestore}
            />
          )}
        </div>
      )}
    </div>
  );
}