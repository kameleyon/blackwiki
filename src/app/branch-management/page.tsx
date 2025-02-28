"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import BranchManager from '@/components/collaboration/BranchManager';
import { FiGitBranch, FiInfo } from 'react-icons/fi';

export default function BranchManagementPage() {
  useSession(); // Keep the session check without storing the value
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  
  // For demo purposes, we'll use a fixed article ID
  // In a real application, this would come from the URL or props
  const articleId = "clsz1234abcd5678efgh";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FiGitBranch className="mr-3" />
        Branch Management
      </h1>
      
      {showInfo && (
        <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FiInfo className="text-blue-400 mt-1 mr-3 flex-shrink-0" size={20} />
            <div>
              <h2 className="text-xl font-semibold mb-2">How It Works</h2>
              <p className="mb-2">
                Branch management allows multiple contributors to work on different versions of the same article simultaneously. 
                Each branch can evolve independently and be merged back into the main branch when ready.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Create branches for different features or sections</li>
                <li>Work on branches without affecting the main content</li>
                <li>Merge branches when they&apos;re ready for publication</li>
                <li>Track version history for each branch</li>
              </ul>
              <p className="text-sm text-white/60">
                This feature is inspired by Git&apos;s branching model, making it familiar to developers while being accessible to non-technical users.
              </p>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="ml-auto text-white/60 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BranchManager
            articleId={articleId}
            onBranchSelect={setSelectedBranchId}
            onVersionSelect={setSelectedVersionId}
            selectedBranchId={selectedBranchId || undefined}
          />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-black/30 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Content Preview</h2>
            
            {selectedVersionId ? (
              <div className="content-preview">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-white/60">
                    Viewing version: <span className="text-white/90 font-medium">{selectedVersionId}</span>
                  </div>
                </div>
                
                <div className="bg-black/20 p-4 rounded-md min-h-[300px]">
                  <p className="text-white/60 italic">
                    In a real implementation, this area would show the content of the selected version.
                    You could integrate a read-only view of the article content here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiGitBranch size={48} className="text-white/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Version Selected</h3>
                <p className="text-white/60 max-w-md">
                  Select a branch and version from the branch manager to preview its content here.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-black/30 border border-white/10 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Branch Management Guide</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Creating a Branch</h3>
                <p className="text-white/80">
                  Create a new branch when you want to work on a specific feature or section without affecting the main content.
                  Each branch starts with the content from its base branch (or the current article content if no base is selected).
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Working with Branches</h3>
                <p className="text-white/80">
                  Each branch maintains its own version history. When you make changes to a branch, new versions are created
                  to track those changes. You can view the history of a branch by expanding it in the branch manager.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Merging Branches</h3>
                <p className="text-white/80">
                  When you&apos;re ready to incorporate changes from one branch into another, use the merge feature.
                  Merging creates a new version in the target branch with the content from the source branch.
                  The source branch is marked as merged and can no longer be edited.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                <ul className="list-disc pl-5 text-white/80">
                  <li>Use descriptive branch names that indicate the purpose of the branch</li>
                  <li>Keep branches focused on a single feature or section</li>
                  <li>Regularly merge changes from the main branch to keep your branch up to date</li>
                  <li>Delete branches that are no longer needed to keep the workspace clean</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
