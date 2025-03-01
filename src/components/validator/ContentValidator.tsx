"use client";

import React, { useState, useEffect } from 'react';
import './validator.css';
import { 
  FiFileText, FiAlertCircle, FiCheckCircle, FiInfo, 
  FiLink, FiBookOpen, FiCopy, FiBarChart2, FiEye 
} from 'react-icons/fi';

// Types for validation data
export type ValidationIssue = {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  location?: string;
  suggestion?: string;
};

export type LinkStatus = {
  url: string;
  status: 'valid' | 'invalid' | 'unknown';
  statusCode?: number;
  error?: string;
};

export type CitationIssue = {
  reference: string;
  isValid: boolean;
  issues?: string[];
  suggestion?: string;
};

export type ReadabilityMetrics = {
  fleschKincaid: number;
  gunningFog: number;
  colemanLiau: number;
  smog: number;
  automatedReadability: number;
  averageGradeLevel: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageSentenceLength: number;
  averageWordLength: number;
  longSentences: number;
  complexWords: number;
};

export type ContentQuality = {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type ValidationResult = {
  readability: ReadabilityMetrics;
  grammarIssues: ValidationIssue[];
  links: LinkStatus[];
  citations: CitationIssue[];
  duplicateContent: {
    score: number;
    matches: Array<{
      text: string;
      similarity: number;
      source?: string;
    }>;
  };
  contentQuality: ContentQuality;
  overallScore: number;
};

interface ContentValidatorProps {
  content: string;
  title: string;
  references?: string[];
  onValidationComplete?: (result: ValidationResult) => void;
  initialValidation?: ValidationResult;
}

const ContentValidator: React.FC<ContentValidatorProps> = ({
  content,
  title,
  references = [],
  onValidationComplete,
  initialValidation
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(initialValidation || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialValidation);
  const [activeTab, setActiveTab] = useState<'readability' | 'grammar' | 'links' | 'citations' | 'duplicates' | 'quality'>('readability');
  const [error, setError] = useState<string | null>(null);

  // Mock validation data for demonstration
  const getMockValidationData = React.useCallback((): ValidationResult => {
    return {
      readability: {
        fleschKincaid: 65.3,
        gunningFog: 10.2,
        colemanLiau: 9.8,
        smog: 11.5,
        automatedReadability: 10.1,
        averageGradeLevel: 10.4,
        wordCount: content.split(/\s+/).filter(Boolean).length,
        sentenceCount: content.split(/[.!?]+/).filter(Boolean).length,
        paragraphCount: content.split(/\n\s*\n/).filter(Boolean).length,
        averageSentenceLength: 18.2,
        averageWordLength: 4.8,
        longSentences: 5,
        complexWords: 42
      },
      grammarIssues: [
        {
          type: 'error',
          title: 'Spelling error',
          description: 'The word "recieve" is misspelled.',
          location: '...they would recieve the...',
          suggestion: 'receive'
        },
        {
          type: 'warning',
          title: 'Passive voice',
          description: 'Consider using active voice for clearer writing.',
          location: '...the book was written by...',
          suggestion: '...wrote the book...'
        },
        {
          type: 'info',
          title: 'Wordiness',
          description: 'This phrase could be more concise.',
          location: '...due to the fact that...',
          suggestion: '...because...'
        }
      ],
      links: references.filter(ref => ref.startsWith('http')).map(url => ({
        url,
        status: Math.random() > 0.2 ? 'valid' : 'invalid',
        statusCode: Math.random() > 0.2 ? 200 : 404,
        error: Math.random() > 0.2 ? undefined : 'Not found'
      })),
      citations: references.map(ref => ({
        reference: ref,
        isValid: Math.random() > 0.3,
        issues: Math.random() > 0.3 ? undefined : ['Missing author', 'Incomplete date'],
        suggestion: Math.random() > 0.3 ? undefined : 'Add author name and publication date'
      })),
      duplicateContent: {
        score: Math.floor(Math.random() * 15),
        matches: Math.random() > 0.7 ? [
          {
            text: 'This is a sample of potentially duplicated content that was found elsewhere.',
            similarity: 85,
            source: 'example.com/similar-article'
          }
        ] : []
      },
      contentQuality: {
        score: Math.floor(Math.random() * 40) + 60,
        level: 'good',
        strengths: [
          'Well-structured paragraphs',
          'Good use of headings',
          'Appropriate tone for the subject'
        ],
        weaknesses: [
          'Could use more specific examples',
          'Some sections lack depth'
        ],
        suggestions: [
          'Add more specific examples to support your points',
          'Consider expanding the analysis section'
        ]
      },
      overallScore: Math.floor(Math.random() * 30) + 70
    };
  }, [content, references]);

  const validateContent = React.useCallback(async () => {
    if (!content) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the validation API
      const response = await fetch('/api/articles/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title,
          references
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to validate content');
      }
      
      const result: ValidationResult = await response.json();
      setValidation(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate content. Please try again.');
      
      // Use mock data for demonstration if API fails
      setValidation(getMockValidationData());
    } finally {
      setIsLoading(false);
    }
  }, [content, title, references, onValidationComplete, getMockValidationData]);

  useEffect(() => {
    if (!initialValidation) {
      validateContent();
    }
  }, [initialValidation, validateContent]);

  // Get readability level description
  const getReadabilityLevel = (score: number): string => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  // Get readability color class
  const getReadabilityColorClass = (score: number): string => {
    if (score >= 80) return 'validator-progress-fill-excellent';
    if (score >= 60) return 'validator-progress-fill-good';
    if (score >= 40) return 'validator-progress-fill-fair';
    return 'validator-progress-fill-poor';
  };

  // Get quality level color class
  const getQualityColorClass = (level: string): string => {
    switch (level) {
      case 'excellent': return 'validator-progress-fill-excellent';
      case 'good': return 'validator-progress-fill-good';
      case 'fair': return 'validator-progress-fill-fair';
      case 'poor': return 'validator-progress-fill-poor';
      default: return 'validator-progress-fill-fair';
    }
  };

  // Get issue icon based on type
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <FiAlertCircle size={16} color="rgba(248, 113, 113, 0.8)" />;
      case 'warning': return <FiAlertCircle size={16} color="rgba(251, 146, 60, 0.8)" />;
      case 'info': return <FiInfo size={16} color="rgba(96, 165, 250, 0.8)" />;
      case 'success': return <FiCheckCircle size={16} color="rgba(74, 222, 128, 0.8)" />;
      default: return <FiInfo size={16} color="rgba(255, 255, 255, 0.8)" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/30"></div>
          <span className="ml-3 text-white/70">Analyzing content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex items-center text-white/70 mb-2">
          <FiAlertCircle className="mr-2" />
          <span>Error</span>
        </div>
        <p className="text-white/60 text-sm">{error}</p>
        <button
          onClick={validateContent}
          className="mt-4 px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-normal text-white/80 mb-4">Content Validation</h2>
      
      {/* Overall Score */}
      <div className="validator-summary mb-6">
        <div className="validator-summary-score">
          <span className="validator-summary-score-value">{validation.overallScore}</span>
          <span className="validator-summary-score-label">Score</span>
        </div>
        <div className="validator-summary-details">
          <h3 className="validator-summary-title font-normal">
            {validation.overallScore >= 90 ? 'Excellent' : 
             validation.overallScore >= 80 ? 'Very Good' :
             validation.overallScore >= 70 ? 'Good' :
             validation.overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
          </h3>
          <p className="validator-summary-description">
            {validation.overallScore >= 80 ? 'Your content is well-written and meets high quality standards.' :
             validation.overallScore >= 70 ? 'Your content is good with some areas for improvement.' :
             validation.overallScore >= 60 ? 'Your content needs some improvements to meet quality standards.' :
             'Your content needs significant improvements to meet quality standards.'}
          </p>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('readability')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'readability' ? 'text-white border-b-2 border-white/80' : 'text-white/60 hover:text-white/80'}`}
        >
          Readability
        </button>
        <button
          onClick={() => setActiveTab('grammar')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'grammar' ? 'text-white border-b-2 border-white/80' : 'text-white/60 hover:text-white/80'}`}
        >
          Grammar & Style
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'links' ? 'text-white border-b-2 border-white/80' : 'text-white/60 hover:text-white/80'}`}
        >
          Links
        </button>
        <button
          onClick={() => setActiveTab('citations')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'citations' ? 'text-white border-b-2 border-white/80' : 'text-white/60 hover:text-white/80'}`}
        >
          Citations
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'duplicates' ? 'text-white border-b-2 border-white/80' : 'text-white/60 hover:text-white/80'}`}
        >
          Duplicates
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'quality' ? 'text-white border-b-2 border-white/80' : 'text-white/60 hover:text-white/80'}`}
        >
          Quality
        </button>
      </div>
      
      {/* Readability Tab */}
      {activeTab === 'readability' && (
        <div>
          <div className="validator-section">
            <h3 className="validator-heading">
              <FiFileText className="mr-2" />
              Readability Score
            </h3>
            <div className="validator-metric">
              <span className="validator-metric-label">Flesch-Kincaid Reading Ease</span>
              <span className="validator-metric-value">{validation.readability.fleschKincaid.toFixed(1)} ({getReadabilityLevel(validation.readability.fleschKincaid)})</span>
            </div>
            <div className="validator-progress-bar">
              <div 
                className={`validator-progress-fill ${getReadabilityColorClass(validation.readability.fleschKincaid)}`}
                style={{ width: `${Math.min(100, validation.readability.fleschKincaid)}%` }}
              ></div>
            </div>
            
            <div className="mt-4 text-sm text-white/70">
              <p>Average Grade Level: {validation.readability.averageGradeLevel.toFixed(1)}</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p>Word Count: {validation.readability.wordCount}</p>
                  <p>Sentence Count: {validation.readability.sentenceCount}</p>
                  <p>Paragraph Count: {validation.readability.paragraphCount}</p>
                </div>
                <div>
                  <p>Avg. Sentence Length: {validation.readability.averageSentenceLength.toFixed(1)} words</p>
                  <p>Avg. Word Length: {validation.readability.averageWordLength.toFixed(1)} characters</p>
                  <p>Complex Words: {validation.readability.complexWords}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="validator-section">
            <h3 className="validator-heading">
              <FiBarChart2 className="mr-2" />
              Readability Analysis
            </h3>
            
            <div className="text-sm text-white/70 mb-4">
              <p>
                {validation.readability.fleschKincaid >= 80 ? 
                  'Your content is very easy to read and will be accessible to a wide audience.' :
                 validation.readability.fleschKincaid >= 60 ? 
                  'Your content is fairly easy to read and should be accessible to most readers.' :
                 validation.readability.fleschKincaid >= 40 ? 
                  'Your content is somewhat difficult to read and may be challenging for some readers.' :
                  'Your content is difficult to read and may be inaccessible to many readers.'}
              </p>
            </div>
            
            {validation.readability.longSentences > 0 && (
              <div className="validator-issue validator-issue-warning">
                <div className="validator-issue-header">
                  <div className="validator-issue-icon">
                    {getIssueIcon('warning')}
                  </div>
                  <div className="validator-issue-title">
                    Long Sentences Detected
                  </div>
                </div>
                <div className="validator-issue-description">
                  Found {validation.readability.longSentences} sentences that are longer than 25 words. Consider breaking these into shorter sentences for better readability.
                </div>
              </div>
            )}
            
            {validation.readability.complexWords > validation.readability.wordCount * 0.15 && (
              <div className="validator-issue validator-issue-info">
                <div className="validator-issue-header">
                  <div className="validator-issue-icon">
                    {getIssueIcon('info')}
                  </div>
                  <div className="validator-issue-title">
                    Complex Word Usage
                  </div>
                </div>
                <div className="validator-issue-description">
                  Your content contains {((validation.readability.complexWords / validation.readability.wordCount) * 100).toFixed(1)}% complex words. Consider using simpler alternatives where appropriate.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Grammar & Style Tab */}
      {activeTab === 'grammar' && (
        <div>
          <div className="validator-section">
            <h3 className="validator-heading">
              <FiFileText className="mr-2" />
              Grammar & Style Issues
            </h3>
            
            {validation.grammarIssues.length === 0 ? (
              <div className="validator-issue validator-issue-success">
                <div className="validator-issue-header">
                  <div className="validator-issue-icon">
                    {getIssueIcon('success')}
                  </div>
                  <div className="validator-issue-title">
                    No grammar or style issues detected
                  </div>
                </div>
                <div className="validator-issue-description">
                  Your content appears to be free of grammar and style issues. Great job!
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Found {validation.grammarIssues.length} issues</span>
                  <div className="flex space-x-1">
                    <span className="validator-tag validator-tag-error">
                      {validation.grammarIssues.filter(i => i.type === 'error').length} Errors
                    </span>
                    <span className="validator-tag validator-tag-warning">
                      {validation.grammarIssues.filter(i => i.type === 'warning').length} Warnings
                    </span>
                    <span className="validator-tag validator-tag-info">
                      {validation.grammarIssues.filter(i => i.type === 'info').length} Suggestions
                    </span>
                  </div>
                </div>
                
                {validation.grammarIssues.map((issue, index) => (
                  <div key={index} className={`validator-issue validator-issue-${issue.type}`}>
                    <div className="validator-issue-header">
                      <div className="validator-issue-icon">
                        {getIssueIcon(issue.type)}
                      </div>
                      <div className="validator-issue-title">
                        {issue.title}
                      </div>
                    </div>
                    <div className="validator-issue-description">
                      {issue.description}
                    </div>
                    {issue.location && (
                      <div className="validator-issue-location">
                        &quot;{issue.location}&quot;
                      </div>
                    )}
                    {issue.suggestion && (
                      <div className="validator-suggestion">
                        Suggestion: {issue.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Links Tab */}
      {activeTab === 'links' && (
        <div>
          <div className="validator-section">
            <h3 className="validator-heading">
              <FiLink className="mr-2" />
              Link Validation
            </h3>
            
            {validation.links.length === 0 ? (
              <div className="text-sm text-white/70">
                No links found in your content or references.
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Found {validation.links.length} links</span>
                  <div className="flex space-x-1">
                    <span className="validator-tag validator-tag-success">
                      {validation.links.filter(l => l.status === 'valid').length} Valid
                    </span>
                    <span className="validator-tag validator-tag-error">
                      {validation.links.filter(l => l.status === 'invalid').length} Invalid
                    </span>
                    <span className="validator-tag validator-tag-warning">
                      {validation.links.filter(l => l.status === 'unknown').length} Unknown
                    </span>
                  </div>
                </div>
                
                <div className="validator-link-list">
                  {validation.links.map((link, index) => (
                    <div key={index} className="validator-link">
                      <div className={`validator-link-status validator-link-status-${link.status}`}></div>
                      <div className="validator-link-url">{link.url}</div>
                      {link.status === 'invalid' && link.error && (
                        <div className="text-xs text-white/50 ml-2">{link.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Citations Tab */}
      {activeTab === 'citations' && (
        <div>
          <div className="validator-section">
            <h3 className="validator-heading">
              <FiBookOpen className="mr-2" />
              Citation Validation
            </h3>
            
            {validation.citations.length === 0 ? (
              <div className="text-sm text-white/70">
                No citations found in your references.
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Found {validation.citations.length} citations</span>
                  <div className="flex space-x-1">
                    <span className="validator-tag validator-tag-success">
                      {validation.citations.filter(c => c.isValid).length} Valid
                    </span>
                    <span className="validator-tag validator-tag-error">
                      {validation.citations.filter(c => !c.isValid).length} Invalid
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  {validation.citations.map((citation, index) => (
                    <div key={index} className="validator-citation">
                      <div className={`validator-citation-status ${citation.isValid ? 'validator-link-status-valid' : 'validator-link-status-invalid'}`}></div>
                      <div className="validator-citation-content">
                        <div className="validator-citation-text">{citation.reference}</div>
                        {!citation.isValid && citation.issues && (
                          <div className="validator-citation-issue">
                            Issues: {citation.issues.join(', ')}
                          </div>
                        )}
                        {!citation.isValid && citation.suggestion && (
                          <div className="validator-suggestion">
                            {citation.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Duplicates Tab */}
      {activeTab === 'duplicates' && (
        <div>
          <div className="validator-section">
            <h3 className="validator-heading">
              <FiCopy className="mr-2" />
              Duplicate Content Check
            </h3>
            
            <div className="validator-metric">
              <span className="validator-metric-label">Originality Score</span>
              <span className="validator-metric-value">{100 - validation.duplicateContent.score}%</span>
            </div>
            <div className="validator-progress-bar">
              <div 
                className={`validator-progress-fill ${validation.duplicateContent.score < 10 ? 'validator-progress-fill-excellent' : validation.duplicateContent.score < 20 ? 'validator-progress-fill-good' : validation.duplicateContent.score < 30 ? 'validator-progress-fill-fair' : 'validator-progress-fill-poor'}`}
                style={{ width: `${100 - validation.duplicateContent.score}%` }}
              ></div>
            </div>
            
            <div className="mt-4">
              {validation.duplicateContent.matches.length === 0 ? (
                <div className="validator-issue validator-issue-success">
                  <div className="validator-issue-header">
                    <div className="validator-issue-icon">
                      {getIssueIcon('success')}
                    </div>
                    <div className="validator-issue-title">
                      No significant duplicate content detected
                    </div>
                  </div>
                  <div className="validator-issue-description">
                    Your content appears to be original. Great job!
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-white/70 mb-2">
                    Found {validation.duplicateContent.matches.length} potential matches with similar content.
                  </div>
                  
                  {validation.duplicateContent.matches.map((match, index) => (
                    <div key={index} className="validator-issue validator-issue-warning">
                      <div className="validator-issue-header">
                        <div className="validator-issue-icon">
                          {getIssueIcon('warning')}
                        </div>
                        <div className="validator-issue-title">
                          {match.similarity}% similarity detected
                        </div>
                      </div>
                      <div className="validator-issue-description">
                        {match.text}
                      </div>
                      {match.source && (
                        <div className="validator-issue-location">
                          Source: {match.source}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Quality Tab */}
      {activeTab === 'quality' && (
        <div>
          <div className="validator-section">
            <h3 className="validator-heading">
              <FiEye className="mr-2" />
              Content Quality Assessment
            </h3>
            
            <div className="validator-metric">
              <span className="validator-metric-label">Quality Score</span>
              <span className="validator-metric-value">{validation.contentQuality.score}/100 ({validation.contentQuality.level})</span>
            </div>
            <div className="validator-progress-bar">
              <div 
                className={`validator-progress-fill ${getQualityColorClass(validation.contentQuality.level)}`}
                style={{ width: `${validation.contentQuality.score}%` }}
              ></div>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-normal text-white/80 mb-2">Strengths</h4>
                <ul className="list-disc pl-5 text-sm text-white/70 space-y-1">
                  {validation.contentQuality.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-normal text-white/80 mb-2">Areas for Improvement</h4>
                <ul className="list-disc pl-5 text-sm text-white/70 space-y-1">
                  {validation.contentQuality.weaknesses.length > 0 ? 
                    validation.contentQuality.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    )) : 
                    <li>No significant weaknesses detected.</li>
                  }
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-normal text-white/80 mb-2">Suggestions</h4>
                <ul className="list-disc pl-5 text-sm text-white/70 space-y-1">
                  {validation.contentQuality.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={validateContent}
          className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
        >
          Refresh Analysis
        </button>
      </div>
    </div>
  );
};

export default ContentValidator;
