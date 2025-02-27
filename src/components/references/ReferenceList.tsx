"use client";

import React, { useState } from 'react';
import { 
  FiEdit2, FiTrash2, FiCopy, FiCheckCircle, 
  FiAlertCircle, FiBookOpen, FiDownload, FiUpload 
} from 'react-icons/fi';
import { ReferenceData, CitationStyle, formatCitation, validateReference } from './ReferenceForm';
import './references.css';

interface ReferenceListProps {
  references: ReferenceData[];
  citationStyle: CitationStyle;
  onEdit: (reference: ReferenceData) => void;
  onDelete: (referenceId: string) => void;
  onImport?: () => void;
  onExport?: () => void;
}

const ReferenceList: React.FC<ReferenceListProps> = ({
  references,
  citationStyle,
  onEdit,
  onDelete,
  onImport,
  onExport
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy citation to clipboard
  const handleCopy = (reference: ReferenceData) => {
    const citation = formatCitation(reference, citationStyle);
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedId(reference.id || '');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Generate bibliography in the selected citation style
  const generateBibliography = () => {
    // Sort references alphabetically by first author's last name
    const sortedReferences = [...references].sort((a, b) => {
      const aAuthor = a.authors[0] || '';
      const bAuthor = b.authors[0] || '';
      return aAuthor.localeCompare(bAuthor);
    });

    return sortedReferences.map(reference => formatCitation(reference, citationStyle));
  };

  // Export bibliography as a text file
  const handleExportBibliography = () => {
    const bibliography = generateBibliography().join('\n\n');
    const blob = new Blob([bibliography], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography-${citationStyle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reference-container">
      <div className="reference-section">
        <h3 className="reference-heading flex justify-between items-center">
          <span className="flex items-center">
            <FiBookOpen className="mr-2" />
            References ({references.length})
          </span>
          <div className="flex gap-2">
            {onImport && (
              <button
                onClick={onImport}
                className="reference-action-button"
                title="Import References"
              >
                <FiUpload size={16} />
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="reference-action-button"
                title="Export References"
              >
                <FiDownload size={16} />
              </button>
            )}
            <button
              onClick={handleExportBibliography}
              className="reference-action-button"
              title="Export Bibliography"
              disabled={references.length === 0}
            >
              <FiDownload size={16} />
              <span>Bibliography</span>
            </button>
          </div>
        </h3>

        {references.length === 0 ? (
          <div className="text-white/60 text-sm p-4 text-center">
            No references added yet. Add references to build your bibliography.
          </div>
        ) : (
          <div className="reference-list">
            {references.map(reference => {
              const validation = validateReference(reference);
              const statusClass = validation.isValid ? 'valid' : 'invalid';
              
              return (
                <div 
                  key={reference.id} 
                  className={`reference-list-item ${statusClass}`}
                >
                  <div className="reference-list-item-content">
                    {formatCitation(reference, citationStyle)}
                  </div>
                  <div className="reference-list-item-actions">
                    <button
                      onClick={() => handleCopy(reference)}
                      className="reference-list-item-action"
                      title="Copy Citation"
                    >
                      {copiedId === reference.id ? (
                        <FiCheckCircle size={16} className="text-green-400" />
                      ) : (
                        <FiCopy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(reference)}
                      className="reference-list-item-action"
                      title="Edit Reference"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(reference.id || '')}
                      className="reference-list-item-action"
                      title="Delete Reference"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  
                  {!validation.isValid && (
                    <div className="reference-list-item-issues">
                      <div className="flex items-center gap-1 text-xs">
                        <FiAlertCircle size={12} />
                        <span>Issues: {validation.issues.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {references.length > 0 && (
        <div className="reference-bibliography">
          <h3 className="reference-bibliography-heading">
            <FiBookOpen className="mr-2" />
            Bibliography ({citationStyle.toUpperCase()})
          </h3>
          <div className="reference-bibliography-content">
            {generateBibliography().map((citation, index) => (
              <div key={index} className="reference-bibliography-item">
                {citation}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceList;
