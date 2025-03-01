export interface Article {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
  qualityScore: number;
  factScore: number;
  readabilityScore: number;
  seoScore: number;
  citationCount: number;
  flaggedIssues: FlaggedIssue[];
}

export interface FlaggedIssue {
  type: 'citation' | 'fact' | 'plagiarism' | 'readability' | 'seo';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface QualityControlProps {
  articles: Article[];
  onAssessArticle: (articleId: string) => Promise<void>;
  onVerifyCitations: (articleId: string) => Promise<void>;
  onCheckPlagiarism: (articleId: string) => Promise<void>;
  onAnalyzeReadability: (articleId: string) => Promise<void>;
  onOptimizeSEO: (articleId: string) => Promise<void>;
  onViewArticle: (articleId: string) => void;
  onEditArticle: (articleId: string) => void;
}

export interface QualityMetrics {
  averageQualityScore: number;
  averageFactScore: number;
  averageReadabilityScore: number;
  averageSeoScore: number;
  totalArticles: number;
  articlesWithIssues: number;
  issuesByType: {
    citation: number;
    fact: number;
    plagiarism: number;
    readability: number;
    seo: number;
  };
  qualityDistribution: {
    excellent: number; // 90-100
    good: number; // 80-89
    average: number; // 70-79
    belowAverage: number; // 60-69
    poor: number; // Below 60
  };
}
