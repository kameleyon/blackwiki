"use client";

import { useState } from 'react';
import { FiClock } from 'react-icons/fi';
import VersionList from './VersionList';
import DiffViewer from './DiffViewer';
import './change-tracking.css';

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

interface ChangeTrackerProps {
  versions: Version[];
  currentVersionId: string;
  onVersionRestore: (versionId: string) => Promise<void>;
}

export default function ChangeTracker({
  versions,
  currentVersionId,
  onVersionRestore
}: ChangeTrackerProps) {
  const [comparisonVersions, setComparisonVersions] = useState<[string, string] | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const handleVersionSelect = (versionId: string) => {
    setComparisonVersions(null);
    setSelectedVersionId(versionId);
  };

  const handleCompare = (fromVersionId: string, toVersionId: string) => {
    setComparisonVersions([fromVersionId, toVersionId]);
  };

  const handleRestore = async (versionId: string) => {
    try {
      setIsRestoring(true);
      await onVersionRestore(versionId);
    } finally {
      setIsRestoring(false);
    }
  };

  const getVersionById = (id: string) => versions.find(v => v.id === id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white/90">Version History</h2>
        <div className="flex items-center text-sm text-white/60">
          <FiClock className="mr-2" size={14} />
          {versions.length} versions
        </div>
      </div>

      {comparisonVersions ? (
        <DiffViewer
          fromVersion={getVersionById(comparisonVersions[0])!}
          toVersion={getVersionById(comparisonVersions[1])!}
          onClose={() => setComparisonVersions(null)}
        />
      ) : selectedVersionId ? (
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Version {getVersionById(selectedVersionId)?.number}</h3>
            <button
              onClick={() => setSelectedVersionId(null)}
              className="text-white/60 hover:text-white/80"
            >
              Back to List
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: getVersionById(selectedVersionId)?.content || '' }} />
          </div>
        </div>
      ) : (
        <VersionList
          versions={versions}
          currentVersionId={currentVersionId}
          onVersionSelect={handleVersionSelect}
          onCompare={handleCompare}
          onRestore={handleRestore}
        />
      )}

      {isRestoring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white/5 rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/80"></div>
            <p className="mt-2 text-sm text-white/80">Restoring version...</p>
          </div>
        </div>
      )}
    </div>
  );
}
