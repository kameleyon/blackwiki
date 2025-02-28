"use client";

import { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './change-tracking.css';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

interface DiffViewerProps {
  fromVersion: {
    id: string;
    number: number;
    content: string;
    createdAt: Date;
  };
  toVersion: {
    id: string;
    number: number;
    content: string;
    createdAt: Date;
  };
  onClose: () => void;
}

export default function DiffViewer({
  fromVersion,
  toVersion,
  onClose
}: DiffViewerProps) {
  const diffLines = useMemo(() => {
    // Split content into lines
    const fromLines = fromVersion.content.split('\n');
    const toLines = toVersion.content.split('\n');
    
    // Simple diff algorithm (can be replaced with a more sophisticated one like diff-match-patch)
    const diff: DiffLine[] = [];
    let i = 0, j = 0;
    
    while (i < fromLines.length || j < toLines.length) {
      if (i >= fromLines.length) {
        // All remaining lines in toLines are additions
        while (j < toLines.length) {
          diff.push({ type: 'added', content: toLines[j] });
          j++;
        }
      } else if (j >= toLines.length) {
        // All remaining lines in fromLines are removals
        while (i < fromLines.length) {
          diff.push({ type: 'removed', content: fromLines[i] });
          i++;
        }
      } else if (fromLines[i] === toLines[j]) {
        // Lines are the same
        diff.push({ type: 'unchanged', content: fromLines[i] });
        i++;
        j++;
      } else {
        // Lines are different
        diff.push({ type: 'removed', content: fromLines[i] });
        diff.push({ type: 'added', content: toLines[j] });
        i++;
        j++;
      }
    }
    
    return diff;
  }, [fromVersion.content, toVersion.content]);

  return (
    <div className="diff-viewer">
      <div className="diff-header">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-white/60">From:</span>
            <span className="ml-2 text-white/80">Version {fromVersion.number}</span>
            <span className="ml-2 text-white/60">
              ({new Date(fromVersion.createdAt).toLocaleDateString()})
            </span>
          </div>
          <FiChevronRight className="text-white/40" size={16} />
          <div className="text-sm">
            <span className="text-white/60">To:</span>
            <span className="ml-2 text-white/80">Version {toVersion.number}</span>
            <span className="ml-2 text-white/60">
              ({new Date(toVersion.createdAt).toLocaleDateString()})
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white/80"
        >
          <FiChevronLeft size={20} />
          Back
        </button>
      </div>

      <div className="diff-content">
        {diffLines.map((line, index) => (
          <div
            key={index}
            className={`diff-line ${
              line.type === 'added'
                ? 'diff-line-added'
                : line.type === 'removed'
                ? 'diff-line-removed'
                : 'diff-line-unchanged'
            }`}
          >
            <span className="mr-2">
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
            </span>
            {line.content || '\u00A0'}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="text-sm text-white/60">
          <span className="font-medium text-white/80">Changes: </span>
          {diffLines.filter(l => l.type === 'added').length} additions,{' '}
          {diffLines.filter(l => l.type === 'removed').length} deletions
        </div>
      </div>
    </div>
  );
}
