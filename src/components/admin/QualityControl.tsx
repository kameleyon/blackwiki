"use client";

import { useState } from 'react';
import { 
  QualityHeader,
  QualityOverview,
  QualityDistribution,
  IssueDistribution,
  ArticleTable,
  QualityControlProps,
  calculateQualityMetrics,
  filterArticles,
  sortArticles
} from './quality-control';

export default function QualityControl(props: QualityControlProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('qualityScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Handle article assessment
  const handleAssessArticle = async (articleId: string) => {
    setIsProcessing(true);
    try {
      await props.onAssessArticle(articleId);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsProcessing(true);
    try {
      // This would typically be a prop function to refresh data
      // For now, we'll just wait a bit to simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Filter and sort articles
  const filteredArticles = filterArticles(props.articles, searchQuery, filterType);
  const sortedArticles = sortArticles(filteredArticles, sortField, sortDirection);
  
  // Calculate quality metrics
  const metrics = calculateQualityMetrics(props.articles);
  
  return (
    <div className="space-y-6">
      {/* Quality Control Header */}
      <QualityHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        onRefresh={handleRefresh}
        isProcessing={isProcessing}
      />
      
      {/* Quality Overview */}
      <QualityOverview metrics={metrics} />
      
      {/* Quality Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityDistribution metrics={metrics} />
        <IssueDistribution metrics={metrics} />
      </div>
      
      {/* Articles Table */}
      <ArticleTable
        articles={sortedArticles}
        onAssessArticle={handleAssessArticle}
        onVerifyCitations={props.onVerifyCitations}
        onCheckPlagiarism={props.onCheckPlagiarism}
        onAnalyzeReadability={props.onAnalyzeReadability}
        onOptimizeSEO={props.onOptimizeSEO}
        onViewArticle={props.onViewArticle}
        onEditArticle={props.onEditArticle}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        isProcessing={isProcessing}
      />
    </div>
  );
}
