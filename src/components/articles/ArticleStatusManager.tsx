"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useArticleStatus, useUpdateArticleStatus } from '@/lib/api-hooks';

interface ArticleStatusManagerProps {
  articleSlug: string;
}

// Define valid article statuses based on schema comments
const VALID_STATUSES = [
  'draft',
  'pending_review',
  'technical_review',
  'editorial_review',
  'final_review',
  'changes_requested',
  'approved',
  'rejected',
  'archived',
];

export default function ArticleStatusManager({ articleSlug }: ArticleStatusManagerProps) {
  const { data: session } = useSession();
  const { data: statusData, isLoading: isLoadingStatus, error: statusError } = useArticleStatus(articleSlug);
  const updateStatusMutation = useUpdateArticleStatus(articleSlug);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    // Initialize selectedStatus when data loads
    if (statusData?.status) {
      setSelectedStatus(statusData.status);
    }
  }, [statusData]);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
  };

  const handleUpdateClick = () => {
    if (!selectedStatus || selectedStatus === statusData?.status) {
      alert('Status has not changed.');
      return;
    }
    updateStatusMutation.mutate(selectedStatus, {
      onSuccess: (updatedArticle) => {
        alert(`Article status updated to: ${updatedArticle.status}`);
        // Status query will be invalidated by the hook, no need to manually update selectedStatus here
        // It will update via useEffect when new data arrives
      },
      onError: (error) => {
        alert(`Failed to update status: ${error.message}`);
        // Revert optimistic update if implemented, or reset selection
        setSelectedStatus(statusData?.status); // Revert selection on error
      },
    });
  };

  // Only render for admins
  if (session?.user?.role !== 'admin') {
    return null;
  }

  if (isLoadingStatus) {
    return <div className="text-sm text-white/60">Loading status...</div>;
  }

  if (statusError) {
    return <div className="text-sm text-red-500">Error loading status: {statusError.message}</div>;
  }

  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
      <h3 className="text-lg font-semibold mb-3">Manage Status</h3>
      <div className="flex items-center gap-3">
        <select 
          value={selectedStatus || ''} 
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-[200px] bg-black border border-white/20 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="" disabled>Select status...</option>
          {VALID_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <button
          onClick={handleUpdateClick}
          disabled={updateStatusMutation.isLoading || !selectedStatus || selectedStatus === statusData?.status}
          className="px-4 py-2 bg-transparent border border-white/30 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
        </button>
      </div>
       {updateStatusMutation.error && (
         <p className="text-red-500 text-sm mt-2">Error: {updateStatusMutation.error.message}</p>
       )}
    </div>
  );
}
