"use client";

export interface Policy {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  url: string;
}

export interface DonationTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  benefits: string[];
  isRecurring?: boolean;
}

export interface OrganizationMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface WikipediaStylePage {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
}

export interface SpecialPage {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
}

export interface WikipediaStyleTool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
}

export interface HelpDocumentation {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  url: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export interface StatisticMetric {
  id: string;
  name: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  icon?: string;
}
