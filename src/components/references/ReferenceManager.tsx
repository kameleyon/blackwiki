"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  FiPlus, FiBookOpen, FiUpload, 
  FiX, FiCheck 
} from 'react-icons/fi';
import ReferenceForm, { ReferenceData, CitationStyle } from './ReferenceForm';
import ReferenceList from './ReferenceList';
import './references.css';

interface ReferenceManagerProps {
  initialReferences?: ReferenceData[];
  onChange?: (references: ReferenceData[]) => void;
  defaultCitationStyle?: CitationStyle;
}

const ReferenceManager: React.FC<ReferenceManagerProps> = ({
  initialReferences = [],
  onChange,
  defaultCitationStyle = 'apa'
}) => {
  const [references, setReferences] = useState<ReferenceData[]>(initialReferences);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>(defaultCitationStyle);
  const [isAddingReference, setIsAddingReference] = useState(false);
  const [editingReference, setEditingReference] = useState<ReferenceData | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  // Update parent component when references change
  useEffect(() => {
    if (onChange) {
      onChange(references);
    }
  }, [references, onChange]);

  // Add a new reference
  const handleAddReference = (reference: ReferenceData) => {
    const newReference = {
      ...reference,
      id: uuidv4()
    };
    
    setReferences(prev => [...prev, newReference]);
    setIsAddingReference(false);
  };

  // Update an existing reference
  const handleUpdateReference = (reference: ReferenceData) => {
    setReferences(prev => 
      prev.map(ref => ref.id === reference.id ? reference : ref)
    );
    setEditingReference(null);
  };

  // Delete a reference
  const handleDeleteReference = (referenceId: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== referenceId));
  };

  // Start editing a reference
  const handleEditReference = (reference: ReferenceData) => {
    setEditingReference(reference);
  };

  // Cancel adding or editing a reference
  const handleCancelForm = () => {
    setIsAddingReference(false);
    setEditingReference(null);
  };

  // Show import dialog
  const handleShowImport = () => {
    setIsImporting(true);
    setImportText('');
    setImportError('');
  };

  // Import references from text
  const handleImportReferences = () => {
    try {
      // Basic validation
      if (!importText.trim()) {
        setImportError('Please enter reference data to import');
        return;
      }

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(importText);
        
        // Check if it's an array
        if (Array.isArray(parsed)) {
          // Validate each reference
          const validReferences = parsed.filter(item => {
            return (
              item && 
              typeof item === 'object' && 
              typeof item.title === 'string' && 
              Array.isArray(item.authors) &&
              typeof item.type === 'string'
            );
          }).map(item => ({
            ...item,
            id: uuidv4()
          }));
          
          if (validReferences.length === 0) {
            setImportError('No valid references found in the imported data');
            return;
          }
          
          setReferences(prev => [...prev, ...validReferences]);
          setIsImporting(false);
        } else {
          setImportError('Imported data must be an array of references');
        }
      } catch {
        // Not valid JSON, try to parse as BibTeX or other formats
        setImportError('Only JSON format is currently supported');
        return;
      }
    } catch (error) {
      setImportError('Failed to import references: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Export references as JSON
  const handleExportReferences = () => {
    const data = JSON.stringify(references, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.json';
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
            Reference Management
          </span>
          {!isAddingReference && !editingReference && (
            <button
              onClick={() => setIsAddingReference(true)}
              className="reference-action-button primary"
            >
              <FiPlus size={16} />
              <span>Add Reference</span>
            </button>
          )}
        </h3>

        {isAddingReference && (
          <div className="mt-4">
            <h4 className="text-white/80 text-sm font-medium mb-2">Add New Reference</h4>
            <ReferenceForm
              onSave={handleAddReference}
              onCancel={handleCancelForm}
              citationStyle={citationStyle}
              onCitationStyleChange={setCitationStyle}
            />
          </div>
        )}

        {editingReference && (
          <div className="mt-4">
            <h4 className="text-white/80 text-sm font-medium mb-2">Edit Reference</h4>
            <ReferenceForm
              initialData={editingReference}
              onSave={handleUpdateReference}
              onCancel={handleCancelForm}
              citationStyle={citationStyle}
              onCitationStyleChange={setCitationStyle}
            />
          </div>
        )}

        {!isAddingReference && !editingReference && (
          <ReferenceList
            references={references}
            citationStyle={citationStyle}
            onEdit={handleEditReference}
            onDelete={handleDeleteReference}
            onImport={handleShowImport}
            onExport={handleExportReferences}
          />
        )}
      </div>

      {/* Import Dialog */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/90 border border-white/10 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white/90 font-medium flex items-center">
                <FiUpload className="mr-2" />
                Import References
              </h3>
              <button
                onClick={() => setIsImporting(false)}
                className="text-white/60 hover:text-white/90"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-white/70 text-sm mb-2">
                Paste your reference data in JSON format below. Each reference should include at minimum: title, authors array, and type.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-64 bg-black/30 border border-white/10 rounded-md text-white/80 p-3 text-sm font-mono"
                placeholder='[
  {
    "type": "book",
    "title": "Example Book Title",
    "authors": ["Last, First"],
    "year": "2023",
    "publisher": "Example Publisher"
  }
]'
              />
              {importError && (
                <p className="text-red-400 text-xs mt-2">{importError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsImporting(false)}
                className="reference-action-button"
              >
                Cancel
              </button>
              <button
                onClick={handleImportReferences}
                className="reference-action-button primary"
              >
                <FiCheck size={16} />
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceManager;
