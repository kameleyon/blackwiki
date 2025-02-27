"use client";

import React, { useState } from 'react';
import { FiFile, FiDownload, FiExternalLink, FiCopy, FiCheck } from 'react-icons/fi';
import './media.css';

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: string;
  };
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const [copied, setCopied] = useState<boolean>(false);
  
  // Get file extension
  const fileExtension = document.name.split('.').pop()?.toLowerCase() || '';
  
  // Determine if the document can be previewed in the browser
  const isPreviewable = ['pdf', 'txt'].includes(fileExtension);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Copy document URL to clipboard
  const copyToClipboard = () => {
    const fullUrl = window.location.origin + document.url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="document-viewer">
      <div className="document-viewer-header">
        <div className="flex items-center">
          <FiFile className="mr-2 text-white/80" size={20} />
          <h3 className="document-viewer-title">{document.name}</h3>
        </div>
        <div className="text-sm text-white/60">
          {formatFileSize(document.size)} • {formatDate(document.createdAt)}
        </div>
      </div>
      
      {isPreviewable ? (
        <div className="document-viewer-content">
          {fileExtension === 'pdf' ? (
            <iframe
              src={`${document.url}#toolbar=0&navpanes=0`}
              title={document.name}
              width="100%"
              height="600"
              className="border-0 rounded-lg"
            ></iframe>
          ) : (
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="text-white/80">Loading document content...</p>
              {/* In a real implementation, you would fetch and display the text content here */}
            </div>
          )}
        </div>
      ) : (
        <div className="document-viewer-content flex flex-col items-center justify-center py-12">
          <FiFile size={64} className="text-white/40 mb-4" />
          <p className="text-white/80 mb-2">This document type cannot be previewed</p>
          <p className="text-white/60 text-sm mb-6">Download the file to view its contents</p>
        </div>
      )}
      
      <div className="document-viewer-actions">
        <a
          href={document.url}
          download={document.name}
          className="media-control-button flex items-center"
        >
          <FiDownload className="mr-1" />
          Download
        </a>
        
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="media-control-button flex items-center"
        >
          <FiExternalLink className="mr-1" />
          Open in New Tab
        </a>
        
        <button
          onClick={copyToClipboard}
          className="media-control-button flex items-center"
        >
          {copied ? (
            <>
              <FiCheck className="mr-1" />
              Copied!
            </>
          ) : (
            <>
              <FiCopy className="mr-1" />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentViewer;
