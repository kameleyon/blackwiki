"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { 
  FiGitBranch, FiGitMerge, FiGitCommit, FiPlus, 
  FiTrash2, FiCheck, FiX, FiInfo, 
  FiChevronDown, FiChevronRight, FiClock
} from 'react-icons/fi';
import './collaboration.css';

interface Branch {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  isMerged: boolean;
  mergedAt: string | null;
  mergedToId: string | null;
  userId: string;
  articleId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  mergedTo?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    versions: number;
  };
  versions?: Array<{
    id: string;
    number: number;
    createdAt: string;
    content: string;
    edit?: {
      summary: string | null;
      createdAt: string;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    } | null;
  }>;
}

interface BranchManagerProps {
  articleId: string;
  onBranchSelect?: (branchId: string) => void;
  onVersionSelect?: (versionId: string) => void;
  selectedBranchId?: string;
}

const BranchManager: React.FC<BranchManagerProps> = ({
  articleId,
  onBranchSelect,
  onVersionSelect,
  selectedBranchId,
}) => {
  useSession(); // Keep the session check without storing the value
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isMergingBranch, setIsMergingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDescription, setNewBranchDescription] = useState('');
  const [baseBranchId, setBaseBranchId] = useState<string | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<string | null>(null);

  // Fetch branch details
  const fetchBranchDetails = useCallback(async (branchId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/branches/${branchId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch branch details');
      }
      
      const data = await response.json();
      setSelectedBranch(data);
      
      // Expand the selected branch
      setExpandedBranches(prev => ({ ...prev, [branchId]: true }));
      
      // Call the onBranchSelect callback if provided
      if (onBranchSelect) {
        onBranchSelect(branchId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [articleId, onBranchSelect]);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}/branches`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }
      
      const data = await response.json();
      setBranches(data);
      
      // If a branch is selected, fetch its details
      if (selectedBranchId) {
        fetchBranchDetails(selectedBranchId);
      } else if (data.length > 0) {
        // Select the default branch or the first branch
        const defaultBranch = data.find((b: Branch) => b.isDefault) || data[0];
        if (defaultBranch) {
          fetchBranchDetails(defaultBranch.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [articleId, selectedBranchId, fetchBranchDetails]);

  // Create a new branch
  const createBranch = async () => {
    try {
      if (!newBranchName.trim()) {
        setError('Branch name is required');
        return;
      }

      const response = await fetch(`/api/articles/${articleId}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBranchName.trim(),
          description: newBranchDescription.trim() || null,
          baseBranchId: baseBranchId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create branch');
      }

      // Reset form
      setNewBranchName('');
      setNewBranchDescription('');
      setBaseBranchId(null);
      setIsCreatingBranch(false);

      // Refresh branches
      fetchBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Merge branch
  const mergeBranch = async () => {
    try {
      if (!selectedBranch) {
        setError('No branch selected');
        return;
      }

      if (!targetBranchId) {
        setError('Target branch is required');
        return;
      }

      const response = await fetch(`/api/articles/${articleId}/branches/${selectedBranch.id}/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetBranchId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to merge branch');
      }

      // Reset form
      setTargetBranchId(null);
      setIsMergingBranch(false);

      // Refresh branches
      fetchBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Delete branch
  const deleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}/branches/${branchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete branch');
      }

      // If the deleted branch was selected, select another branch
      if (selectedBranch?.id === branchId) {
        setSelectedBranch(null);
      }

      // Refresh branches
      fetchBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Toggle branch expansion
  const toggleBranchExpansion = (branchId: string) => {
    setExpandedBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Load branches on mount
  useEffect(() => {
    if (articleId) {
      fetchBranches();
    }
  }, [articleId, fetchBranches]);

  // Handle version selection
  const handleVersionSelect = (versionId: string) => {
    if (onVersionSelect) {
      onVersionSelect(versionId);
    }
  };

  return (
    <div className="branch-manager">
      <div className="branch-manager-header">
        <h3 className="text-lg font-semibold flex items-center">
          <FiGitBranch className="mr-2" />
          Branch Management
        </h3>
        <button
          onClick={() => setIsCreatingBranch(true)}
          className="branch-action-button primary"
          disabled={isCreatingBranch}
        >
          <FiPlus size={16} />
          <span>New Branch</span>
        </button>
      </div>

      {error && (
        <div className="error-message">
          <FiInfo className="mr-1" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <FiX size={16} />
          </button>
        </div>
      )}

      {isCreatingBranch && (
        <div className="branch-form">
          <h4 className="text-white/80 text-sm font-medium mb-2">Create New Branch</h4>
          <div className="mb-3">
            <label className="block text-white/60 text-xs mb-1">Branch Name</label>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
              placeholder="feature/new-section"
            />
          </div>
          <div className="mb-3">
            <label className="block text-white/60 text-xs mb-1">Description (optional)</label>
            <textarea
              value={newBranchDescription}
              onChange={(e) => setNewBranchDescription(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
              placeholder="What is this branch for?"
              rows={2}
            />
          </div>
          <div className="mb-4">
            <label className="block text-white/60 text-xs mb-1">Base Branch (optional)</label>
            <select
              value={baseBranchId || ''}
              onChange={(e) => setBaseBranchId(e.target.value || null)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
            >
              <option value="">-- Select a base branch --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} {branch.isDefault && '(default)'}
                </option>
              ))}
            </select>
            <p className="text-white/50 text-xs mt-1">
              If not selected, a new branch will be created from the current article content.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreatingBranch(false)}
              className="branch-action-button"
            >
              Cancel
            </button>
            <button
              onClick={createBranch}
              className="branch-action-button primary"
              disabled={!newBranchName.trim()}
            >
              <FiCheck size={16} />
              Create Branch
            </button>
          </div>
        </div>
      )}

      {isMergingBranch && selectedBranch && (
        <div className="branch-form">
          <h4 className="text-white/80 text-sm font-medium mb-2">
            Merge Branch: {selectedBranch.name}
          </h4>
          <div className="mb-4">
            <label className="block text-white/60 text-xs mb-1">Target Branch</label>
            <select
              value={targetBranchId || ''}
              onChange={(e) => setTargetBranchId(e.target.value || null)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
            >
              <option value="">-- Select target branch --</option>
              {branches
                .filter((branch) => branch.id !== selectedBranch.id && !branch.isMerged)
                .map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {branch.isDefault && '(default)'}
                  </option>
                ))}
            </select>
            <p className="text-white/50 text-xs mt-1">
              The content from {selectedBranch.name} will be merged into the selected target branch.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsMergingBranch(false)}
              className="branch-action-button"
            >
              Cancel
            </button>
            <button
              onClick={mergeBranch}
              className="branch-action-button primary"
              disabled={!targetBranchId}
            >
              <FiGitMerge size={16} />
              Merge Branch
            </button>
          </div>
        </div>
      )}

      <div className="branches-list">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="branch-item">
                <div className="branch-header">
                  <SkeletonLoader variant="circular" width="16px" height="16px" className="mr-2" />
                  <SkeletonLoader variant="circular" width="16px" height="16px" className="mr-3" />
                  <div className="branch-info flex-1">
                    <div className="branch-name mb-1">
                      <SkeletonLoader variant="text" width="60%" height="16px" />
                    </div>
                    <div className="branch-meta flex items-center gap-4">
                      <SkeletonLoader variant="text" width="80px" height="12px" />
                      <SkeletonLoader variant="text" width="100px" height="12px" />
                    </div>
                  </div>
                  <div className="branch-actions">
                    <SkeletonLoader variant="rectangular" width="24px" height="24px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : branches.length === 0 ? (
          <div className="empty-state">
            <p>No branches found. Create a new branch to get started.</p>
          </div>
        ) : (
          <ul>
            {branches.map((branch) => (
              <li
                key={branch.id}
                className={`branch-item ${
                  selectedBranch?.id === branch.id ? 'selected' : ''
                }`}
              >
                <div
                  className="branch-header"
                  onClick={() => fetchBranchDetails(branch.id)}
                >
                  <button
                    className="expand-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBranchExpansion(branch.id);
                    }}
                  >
                    {expandedBranches[branch.id] ? (
                      <FiChevronDown size={16} />
                    ) : (
                      <FiChevronRight size={16} />
                    )}
                  </button>
                  <div className="branch-icon">
                    <FiGitBranch
                      size={16}
                      className={branch.isDefault ? 'text-green-400' : ''}
                    />
                  </div>
                  <div className="branch-info">
                    <div className="branch-name">
                      {branch.name}
                      {branch.isDefault && (
                        <span className="branch-tag default">default</span>
                      )}
                      {branch.isMerged && (
                        <span className="branch-tag merged">merged</span>
                      )}
                    </div>
                    <div className="branch-meta">
                      <span className="branch-author">
                        {branch.user.name || 'Unknown user'}
                      </span>
                      <span className="branch-date">
                        <FiClock size={12} className="mr-1" />
                        {formatDate(branch.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="branch-actions">
                    {!branch.isMerged && !branch.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBranch(branch.id);
                        }}
                        className="branch-action-button danger"
                        title="Delete branch"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                    {!branch.isMerged && selectedBranch?.id === branch.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMergingBranch(true);
                        }}
                        className="branch-action-button"
                        title="Merge branch"
                      >
                        <FiGitMerge size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {expandedBranches[branch.id] && selectedBranch?.id === branch.id && (
                  <div className="branch-details">
                    {selectedBranch.description && (
                      <div className="branch-description">
                        {selectedBranch.description}
                      </div>
                    )}
                    
                    {selectedBranch.isMerged && selectedBranch.mergedTo && (
                      <div className="branch-merged-info">
                        <FiGitMerge className="mr-1" />
                        Merged into <strong>{selectedBranch.mergedTo.name}</strong>
                        {selectedBranch.mergedAt && (
                          <span> on {formatDate(selectedBranch.mergedAt)}</span>
                        )}
                      </div>
                    )}

                    {selectedBranch.versions && selectedBranch.versions.length > 0 ? (
                      <div className="branch-versions">
                        <h4 className="text-sm font-medium mb-1">Versions</h4>
                        <ul>
                          {selectedBranch.versions.map((version) => (
                            <li
                              key={version.id}
                              className="version-item"
                              onClick={() => handleVersionSelect(version.id)}
                            >
                              <div className="version-icon">
                                <FiGitCommit size={14} />
                              </div>
                              <div className="version-info">
                                <div className="version-name">
                                  Version {version.number}
                                  {version.edit?.summary && (
                                    <span className="version-summary">
                                      {version.edit.summary}
                                    </span>
                                  )}
                                </div>
                                <div className="version-meta">
                                  {version.edit?.user.name || 'Unknown user'} •{' '}
                                  {formatDate(version.createdAt)}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="empty-versions">
                        No versions found for this branch.
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BranchManager;
