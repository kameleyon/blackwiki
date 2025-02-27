"use client";

import React, { useState, useEffect } from 'react';
import { 
  FiBook, FiFileText, FiGlobe, FiUsers, 
  FiSearch, FiCheck, FiAlertCircle, FiX,
  FiLoader
} from 'react-icons/fi';
import './references.css';

// Reference types
export type ReferenceType = 'book' | 'article' | 'website' | 'journal' | 'conference' | 'thesis' | 'other';

// Citation styles
export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';

// Reference data structure
export interface ReferenceData {
  id?: string;
  type: ReferenceType;
  title: string;
  authors: string[];
  year?: string;
  publisher?: string;
  url?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  accessed?: string;
  conference?: string;
  location?: string;
  institution?: string;
  edition?: string;
  additionalInfo?: string;
}

// Form field definition
interface FormField {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'textarea' | 'date' | 'select' | 'authors';
  options?: { value: string; label: string }[];
  hint?: string;
}

// Props for the ReferenceForm component
interface ReferenceFormProps {
  initialData?: ReferenceData;
  onSave: (data: ReferenceData) => void;
  onCancel?: () => void;
  citationStyle?: CitationStyle;
  onCitationStyleChange?: (style: CitationStyle) => void;
}

// Default reference data
const defaultReference: ReferenceData = {
  type: 'book',
  title: '',
  authors: [''],
  year: '',
  publisher: '',
};

// Field definitions for each reference type
const fieldsByType: Record<ReferenceType, FormField[]> = {
  book: [
    { id: 'title', label: 'Title', placeholder: 'Book title', required: true, type: 'text' },
    { id: 'authors', label: 'Authors', placeholder: 'Author names', required: true, type: 'authors', hint: 'Add multiple authors in format: Last, First M.' },
    { id: 'year', label: 'Year', placeholder: 'Publication year', required: true, type: 'text' },
    { id: 'publisher', label: 'Publisher', placeholder: 'Publisher name', required: true, type: 'text' },
    { id: 'location', label: 'Location', placeholder: 'City, Country', required: false, type: 'text' },
    { id: 'edition', label: 'Edition', placeholder: 'e.g., 2nd edition', required: false, type: 'text' },
    { id: 'isbn', label: 'ISBN', placeholder: 'ISBN number', required: false, type: 'text' },
    { id: 'url', label: 'URL', placeholder: 'https://...', required: false, type: 'text' },
    { id: 'accessed', label: 'Date Accessed', placeholder: 'YYYY-MM-DD', required: false, type: 'date' },
    { id: 'additionalInfo', label: 'Additional Information', placeholder: 'Any additional details', required: false, type: 'textarea' },
  ],
  article: [
    { id: 'title', label: 'Article Title', placeholder: 'Article title', required: true, type: 'text' },
    { id: 'authors', label: 'Authors', placeholder: 'Author names', required: true, type: 'authors', hint: 'Add multiple authors in format: Last, First M.' },
    { id: 'journal', label: 'Journal', placeholder: 'Journal name', required: true, type: 'text' },
    { id: 'year', label: 'Year', placeholder: 'Publication year', required: true, type: 'text' },
    { id: 'volume', label: 'Volume', placeholder: 'Volume number', required: false, type: 'text' },
    { id: 'issue', label: 'Issue', placeholder: 'Issue number', required: false, type: 'text' },
    { id: 'pages', label: 'Pages', placeholder: 'e.g., 123-145', required: false, type: 'text' },
    { id: 'doi', label: 'DOI', placeholder: 'Digital Object Identifier', required: false, type: 'text' },
    { id: 'url', label: 'URL', placeholder: 'https://...', required: false, type: 'text' },
    { id: 'accessed', label: 'Date Accessed', placeholder: 'YYYY-MM-DD', required: false, type: 'date' },
  ],
  website: [
    { id: 'title', label: 'Page Title', placeholder: 'Web page title', required: true, type: 'text' },
    { id: 'authors', label: 'Authors/Organization', placeholder: 'Author names or organization', required: true, type: 'authors', hint: 'Add author or organization name' },
    { id: 'year', label: 'Year', placeholder: 'Publication year', required: true, type: 'text' },
    { id: 'url', label: 'URL', placeholder: 'https://...', required: true, type: 'text' },
    { id: 'publisher', label: 'Website Name', placeholder: 'Website name', required: false, type: 'text' },
    { id: 'accessed', label: 'Date Accessed', placeholder: 'YYYY-MM-DD', required: true, type: 'date' },
    { id: 'additionalInfo', label: 'Additional Information', placeholder: 'Any additional details', required: false, type: 'textarea' },
  ],
  journal: [
    { id: 'title', label: 'Article Title', placeholder: 'Article title', required: true, type: 'text' },
    { id: 'authors', label: 'Authors', placeholder: 'Author names', required: true, type: 'authors', hint: 'Add multiple authors in format: Last, First M.' },
    { id: 'journal', label: 'Journal', placeholder: 'Journal name', required: true, type: 'text' },
    { id: 'year', label: 'Year', placeholder: 'Publication year', required: true, type: 'text' },
    { id: 'volume', label: 'Volume', placeholder: 'Volume number', required: true, type: 'text' },
    { id: 'issue', label: 'Issue', placeholder: 'Issue number', required: false, type: 'text' },
    { id: 'pages', label: 'Pages', placeholder: 'e.g., 123-145', required: true, type: 'text' },
    { id: 'doi', label: 'DOI', placeholder: 'Digital Object Identifier', required: false, type: 'text' },
    { id: 'publisher', label: 'Publisher', placeholder: 'Publisher name', required: false, type: 'text' },
    { id: 'url', label: 'URL', placeholder: 'https://...', required: false, type: 'text' },
    { id: 'accessed', label: 'Date Accessed', placeholder: 'YYYY-MM-DD', required: false, type: 'date' },
  ],
  conference: [
    { id: 'title', label: 'Paper Title', placeholder: 'Paper title', required: true, type: 'text' },
    { id: 'authors', label: 'Authors', placeholder: 'Author names', required: true, type: 'authors', hint: 'Add multiple authors in format: Last, First M.' },
    { id: 'conference', label: 'Conference', placeholder: 'Conference name', required: true, type: 'text' },
    { id: 'year', label: 'Year', placeholder: 'Conference year', required: true, type: 'text' },
    { id: 'location', label: 'Location', placeholder: 'City, Country', required: true, type: 'text' },
    { id: 'pages', label: 'Pages', placeholder: 'e.g., 123-145', required: false, type: 'text' },
    { id: 'publisher', label: 'Publisher/Organization', placeholder: 'Publisher or organization name', required: false, type: 'text' },
    { id: 'doi', label: 'DOI', placeholder: 'Digital Object Identifier', required: false, type: 'text' },
    { id: 'url', label: 'URL', placeholder: 'https://...', required: false, type: 'text' },
    { id: 'accessed', label: 'Date Accessed', placeholder: 'YYYY-MM-DD', required: false, type: 'date' },
  ],
  thesis: [
    { id: 'title', label: 'Thesis Title', placeholder: 'Thesis title', required: true, type: 'text' },
    { id: 'authors', label: 'Author', placeholder: 'Author name', required: true, type: 'authors', hint: 'Add author in format: Last, First M.' },
    { id: 'year', label: 'Year', placeholder: 'Publication year', required: true, type: 'text' },
    { id: 'institution', label: 'Institution', placeholder: 'University or institution name', required: true, type: 'text' },
    { id: 'location', label: 'Location', placeholder: 'City, Country', required: false, type: 'text' },
    { id: 'additionalInfo', label: 'Type', placeholder: 'e.g., PhD Dissertation, Master\'s Thesis', required: true, type: 'text' },
    { id: 'url', label: 'URL', placeholder: 'https://...', required: false, type: 'text' },
    { id: 'accessed', label: 'Date Accessed', placeholder: 'YYYY-MM-DD', required: false, type: 'date' },
  ],
  other: [
    { id: 'title', label: 'Title', placeholder: 'Title of the work', required: true, type: 'text' },
    { id: 'authors', label: 'Authors/Contributors', placeholder: 'Author names', required: true, type: 'authors', hint: 'Add multiple authors in format: Last, First M.' },
    { id: 'year', label: 'Year', placeholder: 'Publication year', required: false, type: 'text' },
    { id: 'publisher', label: 'Publisher/Source', placeholder: 'Publisher or source name', required: false, type: 'text' },
    { id: 'url', label: 'URL', placeholder: 'https://...', required: false, type: 'text' },
    { id: 'accessed', label: 'Date Accessed', placeholder: 'YYYY-MM-DD', required: false, type: 'date' },
    { id: 'additionalInfo', label: 'Additional Information', placeholder: 'Any additional details', required: false, type: 'textarea' },
  ],
};

// Citation style options
const citationStyleOptions = [
  { value: 'apa', label: 'APA (7th ed.)' },
  { value: 'mla', label: 'MLA (8th ed.)' },
  { value: 'chicago', label: 'Chicago (17th ed.)' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
];

// Reference type options
const referenceTypeOptions = [
  { value: 'book', label: 'Book', icon: <FiBook /> },
  { value: 'article', label: 'Article', icon: <FiFileText /> },
  { value: 'journal', label: 'Journal', icon: <FiFileText /> },
  { value: 'website', label: 'Website', icon: <FiGlobe /> },
  { value: 'conference', label: 'Conference', icon: <FiUsers /> },
  { value: 'thesis', label: 'Thesis', icon: <FiFileText /> },
  { value: 'other', label: 'Other', icon: <FiFileText /> },
];

// Format citation based on style and reference data
export const formatCitation = (data: ReferenceData, style: CitationStyle): string => {
  // Format authors based on citation style
  const formatAuthors = (authors: string[], style: CitationStyle): string => {
    if (!authors || authors.length === 0 || (authors.length === 1 && authors[0] === '')) {
      return '';
    }

    switch (style) {
      case 'apa':
        if (authors.length === 1) {
          return authors[0];
        } else if (authors.length === 2) {
          return `${authors[0]} & ${authors[1]}`;
        } else {
          return `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`;
        }
      case 'mla':
        if (authors.length === 1) {
          return authors[0];
        } else if (authors.length === 2) {
          return `${authors[0]}, and ${authors[1]}`;
        } else if (authors.length === 3) {
          return `${authors[0]}, ${authors[1]}, and ${authors[2]}`;
        } else {
          return `${authors[0]}, et al.`;
        }
      case 'chicago':
        if (authors.length === 1) {
          return authors[0];
        } else if (authors.length === 2) {
          return `${authors[0]} and ${authors[1]}`;
        } else if (authors.length === 3) {
          return `${authors[0]}, ${authors[1]}, and ${authors[2]}`;
        } else {
          return `${authors[0]} et al.`;
        }
      case 'harvard':
        if (authors.length === 1) {
          return authors[0];
        } else if (authors.length === 2) {
          return `${authors[0]} and ${authors[1]}`;
        } else if (authors.length === 3) {
          return `${authors[0]}, ${authors[1]} and ${authors[2]}`;
        } else {
          return `${authors[0]} et al.`;
        }
      case 'ieee':
        if (authors.length === 1) {
          return authors[0];
        } else if (authors.length === 2) {
          return `${authors[0]} and ${authors[1]}`;
        } else {
          return `${authors[0]} et al.`;
        }
      default:
        return authors.join(', ');
    }
  };

  // Format based on reference type and citation style
  switch (data.type) {
    case 'book':
      switch (style) {
        case 'apa':
          return `${formatAuthors(data.authors, style)}. (${data.year}). ${data.title}${data.edition ? ` (${data.edition})` : ''}. ${data.publisher}${data.location ? `, ${data.location}` : ''}.${data.doi ? ` https://doi.org/${data.doi}` : ''}${data.url && !data.doi ? ` ${data.url}` : ''}`;
        case 'mla':
          return `${formatAuthors(data.authors, style)}. ${data.title}${data.edition ? `, ${data.edition}` : ''}. ${data.publisher}${data.location ? `, ${data.location}` : ''}, ${data.year}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'chicago':
          return `${formatAuthors(data.authors, style)}. ${data.title}${data.edition ? `, ${data.edition}` : ''}. ${data.location ? `${data.location}: ` : ''}${data.publisher}, ${data.year}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'harvard':
          return `${formatAuthors(data.authors, style)} (${data.year}) ${data.title}${data.edition ? `, ${data.edition}` : ''}. ${data.location ? `${data.location}: ` : ''}${data.publisher}.${data.url ? ` Available at: ${data.url}${data.accessed ? ` (Accessed: ${data.accessed})` : ''}` : ''}`;
        case 'ieee':
          return `${formatAuthors(data.authors, style)}, ${data.title}${data.edition ? `, ${data.edition}` : ''}. ${data.location ? `${data.location}: ` : ''}${data.publisher}, ${data.year}.${data.url ? ` [Online]. Available: ${data.url}${data.accessed ? ` (accessed ${data.accessed})` : ''}` : ''}`;
        default:
          return `${formatAuthors(data.authors, 'apa')}. (${data.year}). ${data.title}. ${data.publisher}.`;
      }
    
    case 'article':
    case 'journal':
      switch (style) {
        case 'apa':
          return `${formatAuthors(data.authors, style)}. (${data.year}). ${data.title}. ${data.journal}${data.volume ? `, ${data.volume}` : ''}${data.issue ? `(${data.issue})` : ''}${data.pages ? `, ${data.pages}` : ''}.${data.doi ? ` https://doi.org/${data.doi}` : ''}${data.url && !data.doi ? ` ${data.url}` : ''}`;
        case 'mla':
          return `${formatAuthors(data.authors, style)}. "${data.title}." ${data.journal}${data.volume ? `, vol. ${data.volume}` : ''}${data.issue ? `, no. ${data.issue}` : ''}, ${data.year}${data.pages ? `, pp. ${data.pages}` : ''}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'chicago':
          return `${formatAuthors(data.authors, style)}. "${data.title}." ${data.journal} ${data.volume ? `${data.volume}` : ''}${data.issue ? `, no. ${data.issue}` : ''} (${data.year})${data.pages ? `: ${data.pages}` : ''}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'harvard':
          return `${formatAuthors(data.authors, style)} (${data.year}) '${data.title}', ${data.journal}${data.volume ? `, ${data.volume}` : ''}${data.issue ? `(${data.issue})` : ''}${data.pages ? `, pp. ${data.pages}` : ''}.${data.url ? ` Available at: ${data.url}${data.accessed ? ` (Accessed: ${data.accessed})` : ''}` : ''}`;
        case 'ieee':
          return `${formatAuthors(data.authors, style)}, "${data.title}," ${data.journal}${data.volume ? `, vol. ${data.volume}` : ''}${data.issue ? `, no. ${data.issue}` : ''}${data.pages ? `, pp. ${data.pages}` : ''}, ${data.year}.${data.doi ? ` doi: ${data.doi}` : ''}${data.url && !data.doi ? ` [Online]. Available: ${data.url}${data.accessed ? ` (accessed ${data.accessed})` : ''}` : ''}`;
        default:
          return `${formatAuthors(data.authors, 'apa')}. (${data.year}). ${data.title}. ${data.journal}.`;
      }
    
    case 'website':
      switch (style) {
        case 'apa':
          return `${formatAuthors(data.authors, style)}. (${data.year}). ${data.title}. ${data.publisher ? `${data.publisher}. ` : ''}${data.url}${data.accessed ? ` Retrieved ${data.accessed}` : ''}`;
        case 'mla':
          return `${formatAuthors(data.authors, style)}. "${data.title}." ${data.publisher ? `${data.publisher}, ` : ''}${data.year}, ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.`;
        case 'chicago':
          return `${formatAuthors(data.authors, style)}. "${data.title}." ${data.publisher ? `${data.publisher}. ` : ''}${data.year}. ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.`;
        case 'harvard':
          return `${formatAuthors(data.authors, style)} (${data.year}) ${data.title} [Online]. ${data.publisher ? `${data.publisher}. ` : ''}Available at: ${data.url}${data.accessed ? ` (Accessed: ${data.accessed})` : ''}`;
        case 'ieee':
          return `${formatAuthors(data.authors, style)}, "${data.title}," ${data.publisher ? `${data.publisher}, ` : ''}${data.year}. [Online]. Available: ${data.url}${data.accessed ? ` (accessed ${data.accessed})` : ''}`;
        default:
          return `${formatAuthors(data.authors, 'apa')}. (${data.year}). ${data.title}. ${data.url}`;
      }
    
    case 'conference':
      switch (style) {
        case 'apa':
          return `${formatAuthors(data.authors, style)}. (${data.year}). ${data.title}. In ${data.conference}${data.location ? `, ${data.location}` : ''}${data.pages ? ` (pp. ${data.pages})` : ''}.${data.publisher ? ` ${data.publisher}.` : ''}${data.doi ? ` https://doi.org/${data.doi}` : ''}${data.url && !data.doi ? ` ${data.url}` : ''}`;
        case 'mla':
          return `${formatAuthors(data.authors, style)}. "${data.title}." ${data.conference}, ${data.year}${data.location ? `, ${data.location}` : ''}${data.pages ? `, pp. ${data.pages}` : ''}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'chicago':
          return `${formatAuthors(data.authors, style)}. "${data.title}." Paper presented at ${data.conference}${data.location ? `, ${data.location}` : ''}, ${data.year}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'harvard':
          return `${formatAuthors(data.authors, style)} (${data.year}) '${data.title}', ${data.conference}${data.location ? `, ${data.location}` : ''}${data.pages ? `, pp. ${data.pages}` : ''}.${data.url ? ` Available at: ${data.url}${data.accessed ? ` (Accessed: ${data.accessed})` : ''}` : ''}`;
        case 'ieee':
          return `${formatAuthors(data.authors, style)}, "${data.title}," in ${data.conference}${data.location ? `, ${data.location}` : ''}, ${data.year}${data.pages ? `, pp. ${data.pages}` : ''}.${data.doi ? ` doi: ${data.doi}` : ''}${data.url && !data.doi ? ` [Online]. Available: ${data.url}${data.accessed ? ` (accessed ${data.accessed})` : ''}` : ''}`;
        default:
          return `${formatAuthors(data.authors, 'apa')}. (${data.year}). ${data.title}. ${data.conference}.`;
      }
    
    case 'thesis':
      switch (style) {
        case 'apa':
          return `${formatAuthors(data.authors, style)}. (${data.year}). ${data.title} [${data.additionalInfo}]. ${data.institution}${data.location ? `, ${data.location}` : ''}.${data.url ? ` ${data.url}` : ''}`;
        case 'mla':
          return `${formatAuthors(data.authors, style)}. "${data.title}." ${data.additionalInfo}, ${data.institution}, ${data.year}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'chicago':
          return `${formatAuthors(data.authors, style)}. "${data.title}." ${data.additionalInfo}, ${data.institution}, ${data.year}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}`;
        case 'harvard':
          return `${formatAuthors(data.authors, style)} (${data.year}) '${data.title}', ${data.additionalInfo}, ${data.institution}${data.location ? `, ${data.location}` : ''}.${data.url ? ` Available at: ${data.url}${data.accessed ? ` (Accessed: ${data.accessed})` : ''}` : ''}`;
        case 'ieee':
          return `${formatAuthors(data.authors, style)}, "${data.title}," ${data.additionalInfo}, ${data.institution}${data.location ? `, ${data.location}` : ''}, ${data.year}.${data.url ? ` [Online]. Available: ${data.url}${data.accessed ? ` (accessed ${data.accessed})` : ''}` : ''}`;
        default:
          return `${formatAuthors(data.authors, 'apa')}. (${data.year}). ${data.title}. ${data.additionalInfo}, ${data.institution}.`;
      }
    
    case 'other':
      switch (style) {
        case 'apa':
          return `${formatAuthors(data.authors, style)}. (${data.year || 'n.d.'})${data.title ? `. ${data.title}` : ''}${data.publisher ? `. ${data.publisher}` : ''}.${data.url ? ` ${data.url}${data.accessed ? ` Retrieved ${data.accessed}` : ''}` : ''}${data.additionalInfo ? ` ${data.additionalInfo}` : ''}`;
        case 'mla':
          return `${formatAuthors(data.authors, style)}. ${data.title}${data.publisher ? `. ${data.publisher}` : ''}${data.year ? `, ${data.year}` : ''}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}${data.additionalInfo ? ` ${data.additionalInfo}` : ''}`;
        case 'chicago':
          return `${formatAuthors(data.authors, style)}. ${data.title}${data.publisher ? `. ${data.publisher}` : ''}${data.year ? `, ${data.year}` : ''}.${data.url ? ` ${data.url}${data.accessed ? ` Accessed ${data.accessed}` : ''}.` : ''}${data.additionalInfo ? ` ${data.additionalInfo}` : ''}`;
        case 'harvard':
          return `${formatAuthors(data.authors, style)} (${data.year || 'n.d.'}) ${data.title}${data.publisher ? `. ${data.publisher}` : ''}.${data.url ? ` Available at: ${data.url}${data.accessed ? ` (Accessed: ${data.accessed})` : ''}` : ''}${data.additionalInfo ? ` ${data.additionalInfo}` : ''}`;
        case 'ieee':
          return `${formatAuthors(data.authors, style)}, "${data.title}"${data.publisher ? `, ${data.publisher}` : ''}${data.year ? `, ${data.year}` : ''}.${data.url ? ` [Online]. Available: ${data.url}${data.accessed ? ` (accessed ${data.accessed})` : ''}` : ''}${data.additionalInfo ? ` ${data.additionalInfo}` : ''}`;
        default:
          return `${formatAuthors(data.authors, 'apa')}. (${data.year || 'n.d.'}). ${data.title}.`;
      }
    
    default:
      return `${formatAuthors(data.authors, style)}. (${data.year || 'n.d.'}). ${data.title}.`;
  }
};

// Validate reference data
export const validateReference = (data: ReferenceData): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const fields = fieldsByType[data.type];
  
  // Check required fields
  fields.filter(field => field.required).forEach(field => {
    if (field.id === 'authors') {
      if (!data.authors || data.authors.length === 0 || (data.authors.length === 1 && data.authors[0] === '')) {
        issues.push(`Authors is required for ${data.type} references`);
      }
    } else if (!data[field.id as keyof ReferenceData]) {
      issues.push(`${field.label} is required for ${data.type} references`);
    }
  });
  
  // Validate URL format
  if (data.url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(data.url)) {
    issues.push('URL format is invalid');
  }
  
  // Validate DOI format
  if (data.doi && !/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i.test(data.doi)) {
    issues.push('DOI format is invalid (should start with 10.)');
  }
  
  // Validate year format
  if (data.year && !/^\d{4}$/.test(data.year)) {
    issues.push('Year should be a 4-digit number');
  }
  
  // Validate date format
  if (data.accessed && !/^\d{4}-\d{2}-\d{2}$/.test(data.accessed)) {
    issues.push('Date accessed should be in YYYY-MM-DD format');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// ReferenceForm component
const ReferenceForm: React.FC<ReferenceFormProps> = ({
  initialData,
  onSave,
  onCancel,
  citationStyle = 'apa',
  onCitationStyleChange
}) => {
  const [formData, setFormData] = useState<ReferenceData>(initialData || { ...defaultReference });
  const [selectedType, setSelectedType] = useState<ReferenceType>(initialData?.type || 'book');
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>(citationStyle);
  const [authors, setAuthors] = useState<string[]>(initialData?.authors || ['']);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; issues: string[] }>({ isValid: true, issues: [] });
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [formattedCitation, setFormattedCitation] = useState('');

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedType(initialData.type);
      setAuthors(initialData.authors || ['']);
    }
  }, [initialData]);

  // Update citation style when prop changes
  useEffect(() => {
    setSelectedStyle(citationStyle);
  }, [citationStyle]);

  // Update formatted citation when form data or style changes
  useEffect(() => {
    const citation = formatCitation(formData, selectedStyle);
    setFormattedCitation(citation);
    
    // Validate reference data
    const validation = validateReference(formData);
    setValidationResult(validation);
  }, [formData, selectedStyle]);

  // Handle reference type change
  const handleTypeChange = (type: ReferenceType) => {
    setSelectedType(type);
    setFormData(prev => ({ ...prev, type }));
  };

  // Handle citation style change
  const handleStyleChange = (style: CitationStyle) => {
    setSelectedStyle(style);
    if (onCitationStyleChange) {
      onCitationStyleChange(style);
    }
  };

  // Handle form field change
  const handleFieldChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle author change
  const handleAuthorChange = (index: number, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = value;
    setAuthors(newAuthors);
    setFormData(prev => ({ ...prev, authors: newAuthors }));
  };

  // Add author field
  const addAuthor = () => {
    setAuthors(prev => [...prev, '']);
    setFormData(prev => ({ ...prev, authors: [...prev.authors, ''] }));
  };

  // Remove author field
  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      const newAuthors = [...authors];
      newAuthors.splice(index, 1);
      setAuthors(newAuthors);
      setFormData(prev => ({ ...prev, authors: newAuthors }));
    }
  };

  // Handle DOI/ISBN lookup
  const handleLookup = async () => {
    if (!lookupId) return;
    
    setIsLookupLoading(true);
    
    try {
      // Determine if it's a DOI or ISBN
      const isDOI = lookupId.startsWith('10.') || lookupId.includes('/');
      const endpoint = isDOI ? '/api/references/lookup-doi' : '/api/references/lookup-isbn';
      
      const response = await fetch(`${endpoint}?id=${encodeURIComponent(lookupId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to lookup reference');
      }
      
      const data = await response.json();
      
      // Update form data with retrieved information
      const newData: Partial<ReferenceData> = {
        title: data.title || '',
        authors: data.authors || [''],
        year: data.year || '',
        publisher: data.publisher || '',
      };
      
      if (isDOI) {
        newData.doi = lookupId;
        newData.journal = data.journal || '';
        newData.volume = data.volume || '';
        newData.issue = data.issue || '';
        newData.pages = data.pages || '';
        
        // Set appropriate type based on metadata
        if (data.type === 'journal-article') {
          newData.type = 'journal';
        } else if (data.type === 'proceedings-article') {
          newData.type = 'conference';
        }
      } else {
        newData.isbn = lookupId;
        newData.type = 'book';
      }
      
      setFormData((prev: ReferenceData) => ({ ...prev, ...newData }));
      setSelectedType(newData.type as ReferenceType || formData.type);
      setAuthors(newData.authors || ['']);
      setLookupId('');
    } catch (error) {
      console.error('Error looking up reference:', error);
    } finally {
      setIsLookupLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before saving
    const validation = validateReference(formData);
    setValidationResult(validation);
    
    if (validation.isValid) {
      onSave(formData);
    }
  };

  return (
    <div className="reference-container">
      {/* Reference Type Selector */}
      <div className="reference-section">
        <h3 className="reference-heading">Reference Type</h3>
        <div className="reference-type-selector">
          {referenceTypeOptions.map(option => (
            <button
              key={option.value}
              type="button"
              className={`reference-type-button ${selectedType === option.value ? 'active' : ''}`}
              onClick={() => handleTypeChange(option.value as ReferenceType)}
            >
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Citation Style Selector */}
      <div className="reference-section">
        <h3 className="reference-heading">Citation Style</h3>
        <div className="reference-style-selector">
          {citationStyleOptions.map(option => (
            <button
              key={option.value}
              type="button"
              className={`reference-style-button ${selectedStyle === option.value ? 'active' : ''}`}
              onClick={() => handleStyleChange(option.value as CitationStyle)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* DOI/ISBN Lookup */}
      <div className="reference-section">
        <h3 className="reference-heading">DOI/ISBN Lookup</h3>
        <div className="reference-lookup-input">
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Enter DOI (10.xxxx/xxxx) or ISBN"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={isLookupLoading || !lookupId}
          >
            {isLookupLoading ? (
              <span className="flex items-center gap-2">
                <FiLoader className="animate-spin" />
                Looking up...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiSearch />
                Lookup
              </span>
            )}
          </button>
        </div>
        <p className="reference-form-field-hint">
          Enter a DOI or ISBN to automatically fill in reference details
        </p>
      </div>

      {/* Reference Form */}
      <form onSubmit={handleSubmit}>
        <div className="reference-section">
          <h3 className="reference-heading">Reference Details</h3>
          
          {/* Authors */}
          <div className="reference-form-field required">
            <label>Authors</label>
            {authors.map((author, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => handleAuthorChange(index, e.target.value)}
                  placeholder="Last, First M."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  className="reference-list-item-action"
                  disabled={authors.length <= 1}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAuthor}
              className="text-sm text-white/60 hover:text-white/80 mt-1"
            >
              + Add another author
            </button>
            <p className="reference-form-field-hint">
              Format: Last, First M.
            </p>
          </div>
          
          {/* Form Fields */}
          <div className="reference-form-grid">
            {fieldsByType[selectedType]
              .filter(field => field.id !== 'authors') // Authors are handled separately
              .map(field => (
                <div 
                  key={field.id} 
                  className={`reference-form-field ${field.required ? 'required' : ''} ${
                    field.type === 'textarea' ? 'full-width' : ''
                  }`}
                >
                  <label htmlFor={field.id}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      value={formData[field.id as keyof ReferenceData] as string || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.id}
                      value={formData[field.id as keyof ReferenceData] as string || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={field.id}
                      value={formData[field.id as keyof ReferenceData] as string || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.hint && (
                    <p className="reference-form-field-hint">{field.hint}</p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Citation Preview */}
        <div className="reference-section">
          <h3 className="reference-heading">Citation Preview</h3>
          <div className="reference-preview">
            <div className="reference-preview-heading">
              {selectedStyle.toUpperCase()} Format
            </div>
            <div className="reference-preview-content">
              {formattedCitation || 'Complete the form to see the formatted citation'}
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {!validationResult.isValid && (
          <div className="reference-section">
            <h3 className="reference-heading">Validation Issues</h3>
            <div className="reference-validation-status invalid">
              <FiAlertCircle />
              <span>Please fix the following issues:</span>
            </div>
            <ul className="mt-2 space-y-1">
              {validationResult.issues.map((issue, index) => (
                <li key={index} className="text-sm text-white/70 flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Actions */}
        <div className="reference-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="reference-action-button"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="reference-action-button primary"
            disabled={!validationResult.isValid}
          >
            <FiCheck size={16} />
            Save Reference
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferenceForm;
