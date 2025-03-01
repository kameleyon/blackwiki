"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiClock, FiRefreshCw, FiAlertCircle, FiCheck, FiX, FiEye, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface EditVersion {
  id: string;
  number: number;
  content: string;
  createdAt: string;
  editId: string | null;
  edit?: {
    id: string;
    summary: string | null;
    type: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

interface Diff {
  id: string;
  changes: string; // JSON string of diff information
  fromVersionId: string;
  toVersionId: string;
}

interface EditHistoryProps {
  articleId: string;
  articleTitle: string;
}

export default function EditHistory({ articleId, articleTitle }: EditHistoryProps) {
  const { data: session } = useSession();
  const [versions, setVersions] = useState<EditVersion[]>([]);
  const [selectedVersionA, setSelectedVersionA] = useState<string | null>(null);
  const [selectedVersionB, setSelectedVersionB] = useState<string | null>(null);
  const [diffData, setDiffData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'diff'>('list');

  useEffect(() => {
    fetchVersions();
  }, [articleId]);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/articles/${articleId}/versions`);
      
      if (!response.ok) {
        throw new Error('Failed to load article versions');
      }
      
      const data = await response.json();
      setVersions(data);
      
      if (data.length > 0) {
        // Select the most recent version by default
        setSelectedVersionB(data[0].id);
        
        // Select the second most recent version if available
        if (data.length > 1) {
          setSelectedVersionA(data[1].id);
        }
      }
    } catch (err) {
      console.error('Error fetching article versions:', err);
      setError('Failed to load version history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiff = async () => {
    if (!selectedVersionA || !selectedVersionB) {
      return;
    }
    
    try {
      setIsLoadingDiff(true);
      setError(null);
      
      const response = await fetch(`/api/articles/${articleId}/diff?fromVersion=${selectedVersionA}&toVersion=${selectedVersionB}`);
      
      if (!response.ok) {
        throw new Error('Failed to load diff comparison');
      }
      
      const data = await response.json();
      setDiffData(data);
      setViewMode('diff');
    } catch (err) {
      console.error('Error fetching diff:', err);
      setError('Failed to load diff comparison. Please try again later.');
    } finally {
      setIsLoadingDiff(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/versions/${versionId}/restore`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore version');
      }
      
      // Refresh the versions list
      fetchVersions();
    } catch (err) {
      console.error('Error restoring version:', err);
      setError('Failed to restore version. Please try again later.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDiffView = () => {
    if (!diffData) return null;
    
    const { changes } = diffData;
    const parsedChanges = typeof changes === 'string' ? JSON.parse(changes) : changes;
    
    const versionA = versions.find(v => v.id === selectedVersionA);
    const versionB = versions.find(v => v.id === selectedVersionB);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
          >
            <FiArrowLeft size={14} />
            Back to Version List
          </button>
          
          <div className="text-white/70 text-sm">
            Comparing Version {versionA?.number} to Version {versionB?.number}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="mb-2 text-white/70 text-sm">
              Version {versionA?.number} - {formatDate(versionA?.createdAt || '')}
              {versionA?.edit?.user?.name && (
                <span> by {versionA.edit.user.name}</span>
              )}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="mb-2 text-white/70 text-sm">
              Version {versionB?.number} - {formatDate(versionB?.createdAt || '')}
              {versionB?.edit?.user?.name && (
                <span> by {versionB.edit.user.name}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {parsedChanges.map((change: any, index: number) => {
                if (change.added) {
                  return (
                    <tr key={index} className="bg-green-900/20">
                      <td className="w-10 text-center py-1 px-2 text-white/50 border-r border-white/10">+</td>
                      <td className="py-1 px-4 text-green-300 whitespace-pre-wrap">{change.value}</td>
                    </tr>
                  );
                }
                if (change.removed) {
                  return (
                    <tr key={index} className="bg-red-900/20">
                      <td className="w-10 text-center py-1 px-2 text-white/50 border-r border-white/10">-</td>
                      <td className="py-1 px-4 text-red-300 whitespace-pre-wrap">{change.value}</td>
                    </tr>
                  );
                }
                return (
                  <tr key={index}>
                    <td className="w-10 text-center py-1 px-2 text-white/50 border-r border-white/10"></td>
                    <td className="py-1 px-4 text-white/80 whitespace-pre-wrap">{change.value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVersionList = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/70 text-sm">
            Select two versions to compare:
          </div>
          
          <button
            onClick={fetchDiff}
            disabled={!selectedVersionA || !selectedVersionB || selectedVersionA === selectedVersionB}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
              !selectedVersionA || !selectedVersionB || selectedVersionA === selectedVersionB
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Compare Selected Versions
          </button>
        </div>
        
        <div className="bg-black/30 rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black/50">
                <th className="py-2 px-4 text-left text-white/70 font-normal">Compare</th>
                <th className="py-2 px-4 text-left text-white/70 font-normal">Version</th>
                <th className="py-2 px-4 text-left text-white/70 font-normal">Date</th>
                <th className="py-2 px-4 text-left text-white/70 font-normal">User</th>
                <th className="py-2 px-4 text-left text-white/70 font-normal">Summary</th>
                <th className="py-2 px-4 text-left text-white/70 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id} className="border-t border-white/10">
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <input
                        type="radio"
                        name="versionA"
                        checked={selectedVersionA === version.id}
                        onChange={() => setSelectedVersionA(version.id)}
                        className="accent-white/70"
                      />
                      <input
                        type="radio"
                        name="versionB"
                        checked={selectedVersionB === version.id}
                        onChange={() => setSelectedVersionB(version.id)}
                        className="accent-white/70"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/90">
                    {version.number}
                  </td>
                  <td className="py-3 px-4 text-white/70 whitespace-nowrap">
                    {formatDate(version.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-white/70">
                    {version.edit?.user?.name || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-white/70">
                    {version.edit?.summary || 
                     (version.edit?.type === 'content' ? 'Content update' : 
                      version.edit?.type === 'metadata' ? 'Metadata update' : 
                      'Edit')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(version.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors"
                      >
                        <FiCheck size={12} />
                        Restore
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVersionB(version.id);
                          if (versions.length > 1) {
                            // Find the next version to compare with
                            const currentIndex = versions.findIndex(v => v.id === version.id);
                            const nextIndex = currentIndex + 1 < versions.length ? currentIndex + 1 : 0;
                            setSelectedVersionA(versions[nextIndex].id);
                          }
                          fetchDiff();
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white/80 text-sm transition-colors"
                      >
                        <FiEye size={12} />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/20 rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-normal flex items-center gap-2">
          <FiClock className="text-white/70" />
          Edit History: {articleTitle}
        </h2>
        <button 
          onClick={fetchVersions}
          className="flex items-center gap-1 text-white/60 hover:text-white/90 transition-colors"
        >
          <FiRefreshCw size={14} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/10 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2">
          <FiAlertCircle />
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/60"></div>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center text-white/50 py-12">
          <p>No version history available for this article.</p>
        </div>
      ) : viewMode === 'list' ? (
        renderVersionList()
      ) : (
        isLoadingDiff ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/60"></div>
          </div>
        ) : (
          renderDiffView()
        )
      )}
    </div>
  );
}
