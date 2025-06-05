"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useArticleStatus, useUpdateArticleStatus } from '@/lib/api-hooks';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui Button
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming shadcn/ui Select
import { toast } from 'sonner'; // Assuming sonner for toasts

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
      toast.info('Status has not changed.');
      return;
    }
    updateStatusMutation.mutate(selectedStatus, {
      onSuccess: (updatedArticle) => {
        toast.success(`Article status updated to: ${updatedArticle.status}`);
        // Status query will be invalidated by the hook, no need to manually update selectedStatus here
        // It will update via useEffect when new data arrives
      },
      onError: (error) => {
        toast.error(`Failed to update status: ${error.message}`);
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
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px] bg-black border-white/20">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent className="bg-black border-white/20 text-white">
            {VALID_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize hover:bg-white/10 focus:bg-white/10">
                {status.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleUpdateClick}
          disabled={updateStatusMutation.isPending || !selectedStatus || selectedStatus === statusData?.status}
          size="sm"
          variant="outline"
          className="border-white/30 hover:bg-white/10"
        >
          {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
       {updateStatusMutation.error && (
         <p className="text-red-500 text-sm mt-2">Error: {updateStatusMutation.error.message}</p>
       )}
    </div>
  );
}
