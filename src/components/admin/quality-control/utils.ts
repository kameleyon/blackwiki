import { Article, FlaggedIssue, QualityMetrics } from './types';

/**
 * Calculate quality metrics from articles
 */
export const calculateQualityMetrics = (articles: Article[]): QualityMetrics => {
  const totalArticles = articles.length;
  
  if (totalArticles === 0) {
    return {
      averageQualityScore: 0,
      averageFactScore: 0,
      averageReadabilityScore: 0,
      averageSeoScore: 0,
      totalArticles: 0,
      articlesWithIssues: 0,
      issuesByType: {
        citation: 0,
        fact: 0,
        plagiarism: 0,
        readability: 0,
        seo: 0
      },
      qualityDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        belowAverage: 0,
        poor: 0
      }
    };
  }
  
  // Calculate average scores
  const averageQualityScore = articles.reduce((sum, article) => sum + article.qualityScore, 0) / totalArticles;
  const averageFactScore = articles.reduce((sum, article) => sum + article.factScore, 0) / totalArticles;
  const averageReadabilityScore = articles.reduce((sum, article) => sum + article.readabilityScore, 0) / totalArticles;
  const averageSeoScore = articles.reduce((sum, article) => sum + article.seoScore, 0) / totalArticles;
  
  // Count articles with issues
  const articlesWithIssues = articles.filter(article => article.flaggedIssues.length > 0).length;
  
  // Count issues by type
  const issuesByType = {
    citation: 0,
    fact: 0,
    plagiarism: 0,
    readability: 0,
    seo: 0
  };
  
  articles.forEach(article => {
    article.flaggedIssues.forEach(issue => {
      issuesByType[issue.type]++;
    });
  });
  
  // Calculate quality distribution
  const qualityDistribution = {
    excellent: articles.filter(a => a.qualityScore >= 90).length,
    good: articles.filter(a => a.qualityScore >= 80 && a.qualityScore < 90).length,
    average: articles.filter(a => a.qualityScore >= 70 && a.qualityScore < 80).length,
    belowAverage: articles.filter(a => a.qualityScore >= 60 && a.qualityScore < 70).length,
    poor: articles.filter(a => a.qualityScore < 60).length
  };
  
  return {
    averageQualityScore,
    averageFactScore,
    averageReadabilityScore,
    averageSeoScore,
    totalArticles,
    articlesWithIssues,
    issuesByType,
    qualityDistribution
  };
};

/**
 * Filter articles based on search query and filter type
 */
export const filterArticles = (
  articles: Article[],
  searchQuery: string,
  filterType: string
): Article[] => {
  return articles.filter(article => {
    // Filter by search query
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by issue type
    if (filterType !== 'all') {
      if (filterType === 'low-quality' && article.qualityScore >= 70) {
        return false;
      } else if (filterType === 'citation-issues' && !article.flaggedIssues.some(issue => issue.type === 'citation')) {
        return false;
      } else if (filterType === 'fact-issues' && !article.flaggedIssues.some(issue => issue.type === 'fact')) {
        return false;
      } else if (filterType === 'readability-issues' && !article.flaggedIssues.some(issue => issue.type === 'readability')) {
        return false;
      } else if (filterType === 'seo-issues' && !article.flaggedIssues.some(issue => issue.type === 'seo')) {
        return false;
      } else if (filterType === 'plagiarism-issues' && !article.flaggedIssues.some(issue => issue.type === 'plagiarism')) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Sort articles based on field and direction
 */
export const sortArticles = (
  articles: Article[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
): Article[] => {
  return [...articles].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'author':
        valueA = a.author.name.toLowerCase();
        valueB = b.author.name.toLowerCase();
        break;
      case 'updatedAt':
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
        break;
      case 'qualityScore':
        valueA = a.qualityScore;
        valueB = b.qualityScore;
        break;
      case 'issueCount':
        valueA = a.flaggedIssues.length;
        valueB = b.flaggedIssues.length;
        break;
      default:
        valueA = a.qualityScore;
        valueB = b.qualityScore;
    }
    
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

/**
 * Get severity color class based on severity level
 */
export const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'low':
      return 'text-gray-400 bg-gray-400/10';
    case 'medium':
      return 'text-gray-500 bg-gray-500/10';
    case 'high':
      return 'text-gray-600 bg-gray-600/10';
    default:
      return 'text-white/60 bg-white/10';
  }
};

/**
 * Get score color class based on score
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) {
    return 'text-gray-300';
  } else if (score >= 70) {
    return 'text-gray-400';
  } else {
    return 'text-gray-500';
  }
};

/**
 * Get score background class based on score
 */
export const getScoreBackground = (score: number): string => {
  if (score >= 90) {
    return 'bg-gray-600/20';
  } else if (score >= 70) {
    return 'bg-gray-700/20';
  } else {
    return 'bg-gray-800/20';
  }
};

/**
 * Default chart options
 */
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
      }
    }
  }
};
