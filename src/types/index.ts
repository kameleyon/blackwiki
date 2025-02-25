export type ArticleStatus = 'pending' | 'in review' | 'approved' | 'denied' | 'reported';

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: 'AfroWiki' | 'wikipedia';
  categories?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
  author?: {
    name: string;
    email: string;
  };
  views?: number;
  updatedAt?: Date;
}
