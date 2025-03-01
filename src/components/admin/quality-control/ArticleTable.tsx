"use client";

import { useState } from 'react';
import { 
  FiFileText, 
  FiEye, 
  FiEdit, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiLink,
  FiBook,
  FiType,
  FiSearch
} from 'react-icons/fi';
import { Article, FlaggedIssue } from './types';
import { getScoreColor, getScoreBackground, getSeverityColor } from './utils';

interface ArticleTableProps {
  articles: Article[];
  onAssessArticle: (articleId: string) => Promise<void>;
  onVerifyCitations: (articleId: string) => Promise<void>;
  onCheckPlagiarism: (articleId: string) => Promise<void>;
  onAnalyzeReadability: (articleId: string) => Promise<void>;
  onOptimizeSEO: (articleId: string) => Promise<void>;
  onViewArticle: (articleId: string) => void;
  onEditArticle: (articleId: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  isProcessing: boolean;
}

export const ArticleTable = ({
  articles,
  onAssessArticle,
  onVerifyCitations,
  onCheckPlagiarism,
  onAnalyzeReadability,
  onOptimizeSEO,
  onViewArticle,
  onEditArticle,
  sortField,
  sortDirection,
  onSort,
  isProcessing
}: ArticleTableProps) => {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  
  // Toggle article expansion
  const toggleArticleExpansion = (articleId: string) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(articleId);
    }
  };
  
  return (
    <div className="bg-white/5 rounded-xl shadow-sm shadow-black overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => onSort('title')}
                >
                  <span>Article</span>
                  {sortField === 'title' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => onSort('author')}
                >
                  <span>Author</span>
                  {sortField === 'author' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => onSort('qualityScore')}
                >
                  <span>Quality</span>
                  {sortField === 'qualityScore' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => onSort('issueCount')}
                >
                  <span>Issues</span>
                  {sortField === 'issueCount' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/60 uppercase tracking-wider">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleRow 
                  key={article.id}
                  article={article}
                  isExpanded={expandedArticle === article.id}
                  onToggleExpand={() => toggleArticleExpansion(article.id)}
                  onAssessArticle={onAssessArticle}
                  onVerifyCitations={onVerifyCitations}
                  onCheckPlagiarism={onCheckPlagiarism}
                  onAnalyzeReadability={onAnalyzeReadability}
                  onOptimizeSEO={onOptimizeSEO}
                  onViewArticle={onViewArticle}
                  onEditArticle={onEditArticle}
                  isProcessing={isProcessing}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-white/60">
                  No articles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ArticleRowProps {
  article: Article;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAssessArticle: (articleId: string) => Promise<void>;
  onVerifyCitations: (articleId: string) => Promise<void>;
  onCheckPlagiarism: (articleId: string) => Promise<void>;
  onAnalyzeReadability: (articleId: string) => Promise<void>;
  onOptimizeSEO: (articleId: string) => Promise<void>;
  onViewArticle: (articleId: string) => void;
  onEditArticle: (articleId: string) => void;
  isProcessing: boolean;
}

const ArticleRow = ({
  article,
  isExpanded,
  onToggleExpand,
  onAssessArticle,
  onVerifyCitations,
  onCheckPlagiarism,
  onAnalyzeReadability,
  onOptimizeSEO,
  onViewArticle,
  onEditArticle,
  isProcessing
}: ArticleRowProps) => {
  return (
    <>
      <tr 
        className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
        onClick={onToggleExpand}
      >
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden mr-3 flex items-center justify-center">
              <FiFileText className="text-white/60" size={16} />
            </div>
            <div>
              <div className="text-sm font-medium">{article.title}</div>
              <div className="text-xs text-white/60">{article.slug}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm">{article.author.name}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 rounded-full text-xs ${getScoreBackground(article.qualityScore)} ${getScoreColor(article.qualityScore)}`}>
            {article.qualityScore}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {article.flaggedIssues.length > 0 ? (
            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
              {article.flaggedIssues.length} issues
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
              No issues
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <button 
              className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
              title="View Article"
              onClick={() => onViewArticle(article.id)}
            >
              <FiEye size={16} />
            </button>
            <button 
              className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
              title="Edit Article"
              onClick={() => onEditArticle(article.id)}
            >
              <FiEdit size={16} />
            </button>
            <button 
              className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/80"
              title="Assess Quality"
              onClick={() => onAssessArticle(article.id)}
              disabled={isProcessing}
            >
              <FiCheckCircle size={16} />
            </button>
          </div>
        </td>
      </tr>
      
      {/* Expanded Article Details */}
      {isExpanded && (
        <tr className="bg-white/5">
          <td colSpan={5} className="px-6 py-4">
            <div className="space-y-4">
              {/* Quality Scores */}
              <div>
                <h4 className="text-sm font-medium mb-2">Quality Scores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">Overall</span>
                      <span className={`text-sm ${getScoreColor(article.qualityScore)}`}>{article.qualityScore}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getScoreBackground(article.qualityScore)}`}
                        style={{ width: `${article.qualityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">Fact Checking</span>
                      <span className={`text-sm ${getScoreColor(article.factScore)}`}>{article.factScore}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getScoreBackground(article.factScore)}`}
                        style={{ width: `${article.factScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">Readability</span>
                      <span className={`text-sm ${getScoreColor(article.readabilityScore)}`}>{article.readabilityScore}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getScoreBackground(article.readabilityScore)}`}
                        style={{ width: `${article.readabilityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">SEO</span>
                      <span className={`text-sm ${getScoreColor(article.seoScore)}`}>{article.seoScore}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getScoreBackground(article.seoScore)}`}
                        style={{ width: `${article.seoScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Flagged Issues */}
              {article.flaggedIssues.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-2">Flagged Issues</h4>
                  <div className="space-y-2">
                    {article.flaggedIssues.map((issue, index) => (
                      <FlaggedIssueItem key={index} issue={issue} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-sm text-white/60">No issues detected</p>
                </div>
              )}
              
              {/* Quality Assessment Tools */}
              <div>
                <h4 className="text-sm font-medium mb-2">Quality Assessment Tools</h4>
                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1"
                    onClick={() => onVerifyCitations(article.id)}
                    disabled={isProcessing}
                  >
                    <FiLink size={14} />
                    <span>Verify Citations</span>
                  </button>
                  
                  <button 
                    className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1"
                    onClick={() => onCheckPlagiarism(article.id)}
                    disabled={isProcessing}
                  >
                    <FiSearch size={14} />
                    <span>Check Plagiarism</span>
                  </button>
                  
                  <button 
                    className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1"
                    onClick={() => onAnalyzeReadability(article.id)}
                    disabled={isProcessing}
                  >
                    <FiType size={14} />
                    <span>Analyze Readability</span>
                  </button>
                  
                  <button 
                    className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1"
                    onClick={() => onOptimizeSEO(article.id)}
                    disabled={isProcessing}
                  >
                    <FiBook size={14} />
                    <span>Optimize SEO</span>
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

interface FlaggedIssueItemProps {
  issue: FlaggedIssue;
}

const FlaggedIssueItem = ({ issue }: FlaggedIssueItemProps) => {
  return (
    <div className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}>
      <div className="flex items-start">
        <FiAlertTriangle className="mt-0.5 mr-2 flex-shrink-0" size={16} />
        <div>
          <p className="text-sm font-medium">{issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue</p>
          <p className="text-xs mt-1">{issue.description}</p>
        </div>
      </div>
    </div>
  );
};
