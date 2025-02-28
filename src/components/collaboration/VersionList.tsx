"use client";

import { useState } from 'react';
import { FiClock, FiChevronRight, FiRotateCcw, FiEye } from 'react-icons/fi';
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

interface VersionListProps {
  versions: Version[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  onCompare: (fromVersionId: string, toVersionId: string) => void;
  onRestore: (versionId: string) => void;
}

export default function VersionList({
  versions,
  currentVersionId,
  onVersionSelect,
  onCompare,
  onRestore
}: VersionListProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length < 2) {
        return [...prev, versionId];
      }
      return [prev[1], versionId];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare(selectedVersions[0], selectedVersions[1]);
    }
  };

  return (
    <div className="version-list">
      {versions.map((version) => (
        <div 
          key={version.id}
          className={`version-item ${version.id === currentVersionId ? 'bg-white/10' : ''}`}
        >
          <div className="version-header">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedVersions.includes(version.id)}
                onChange={() => toggleVersionSelection(version.id)}
                className="rounded bg-white/10 border-white/20 text-white/80"
              />
              <span className="version-number">Version {version.number}</span>
              {version.edit?.type && (
                <span className="version-type">{version.edit.type}</span>
              )}
            </div>
            <span className="version-date">
              <FiClock className="inline mr-1" size={12} />
              {new Date(version.createdAt).toLocaleDateString()} 
              {new Date(version.createdAt).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="version-author">
            By {version.edit?.user.name || 'Unknown'}
          </div>
          
          {version.edit?.summary && (
            <p className="mt-2 text-sm text-white/70">
              {version.edit.summary}
            </p>
          )}

          <div className="version-actions">
            <button
              onClick={() => onVersionSelect(version.id)}
              className="version-action-button"
            >
              <FiEye size={12} className="inline mr-1" />
              View
            </button>
            
            <button
              onClick={() => onRestore(version.id)}
              className="version-action-button"
            >
              <FiRotateCcw size={12} className="inline mr-1" />
              Restore
            </button>
          </div>
        </div>
      ))}

      {selectedVersions.length === 2 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCompare}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
          >
            Compare Selected Versions
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
