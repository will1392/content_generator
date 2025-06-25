export type ProjectStage = 
  | 'research' 
  | 'blog' 
  | 'podcast_script' 
  | 'audio' 
  | 'images' 
  | 'social' 
  | 'complete';

export interface Project {
  id: string;
  keyword: string;
  website?: string;
  status: ProjectStage;
  created_at: string;
  updated_at: string;
}

export interface ResearchContent {
  // SEO-Focused Additions
  searchIntent: {
    primary: 'informational' | 'transactional' | 'navigational' | 'commercial';
    userGoals: string[];
    relatedQueries: string[];
    questionsToAnswer: string[];
  };
  
  // E-E-A-T Components
  expertiseIndicators: {
    technicalSpecs: string[];
    industryStandards: string[];
    terminology: Array<{ term: string; definition: string }>;
    misconceptions: Array<{ misconception: string; truth: string }>;
  };
  
  experienceEvidence: Array<{
    type: string;
    description: string;
    outcome: string;
    source: string;
  }>;
  
  authoritativeData: Array<{
    metric: string;
    value: string;
    source: string;
    year: string;
    url?: string;
  }>;
  
  trustSignals: {
    regulations: string[];
    bestPractices: string[];
    safetyConsiderations: string[];
  };
  
  // SEO Competition Analysis
  competitiveLandscape: {
    topRankingContent: string[];
    contentGaps: string[];
    uniqueAngles: string[];
  };
  
  // Semantic SEO
  semanticSEO: {
    lsiKeywords: string[];
    entities: string[];
    topicClusters: string[];
  };
  
  // Featured Snippet Opportunities
  featuredSnippetOpps: Array<{
    question: string;
    optimalAnswer: string;
  }>;
  
  // Content Requirements
  contentDepthRequirements: {
    mustCoverTopics: string[];
    uniqueInsights: string[];
    originalAngles: string[];
  };
  
  // Original fields (keep for compatibility)
  definition: string;
  overview: string;
  history?: string;
  currentTrends: string[];
  statistics: Array<{
    metric: string;
    value: string;
    source: string;
  }>;
  expertInsights?: string[];
  commonQuestions: Array<{
    question: string;
    answer: string;
  }>;
  relatedTopics: string[];
  applications: string[];
  futureOutlook: string;
  challenges: string[];
  opportunities: string[];
}

export interface BlogContent {
  title: string;
  metaDescription: string;
  content: string;
  wordCount: number;
  readingTime: number;
  targetKeywords?: string[];
  readabilityScore?: string;
  seoScore?: {
    keywordDensity: string;
    readabilityScore: string;
    featuredSnippets: string[];
  };
  internalLinks?: Array<{
    anchor: string;
    suggestion: string;
  }>;
  externalLinks?: Array<{
    anchor: string;
    url: string;
    source: string;
    context?: string;
  }>;
  images?: Array<{
    alt: string;
    caption: string;
    placement: string;
    url?: string;
  }>;
}

export interface PodcastContent {
  title: string;
  script: string;
  duration: number;
  outline: string[];
}

export interface AudioContent {
  audioUrl: string;
  duration: number;
  format: string;
  size: number;
  transcript: string;
}

export interface ImagesContent {
  thumbnailUrl: string;
  featuredImageUrl: string;
  socialMediaImages: {
    platform: string;
    imageUrl: string;
    dimensions: string;
  }[];
}

export interface SocialContent {
  twitter: {
    thread: string[];
    hashtags: string[];
  };
  linkedin: {
    post: string;
    hashtags: string[];
  };
  instagram: {
    caption: string;
    hashtags: string[];
  };
}

export interface TopicalMapKeyword {
  id: string;
  keyword: string;
  searchVolume?: number;
  difficulty?: string;
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  priority: 'high' | 'medium' | 'low';
  contentCreated: boolean;
  contentId?: string;
}

export interface TopicalMap {
  id: string;
  client_project_id: string;
  title: string;
  topic: string;
  location: string;
  description?: string;
  keywords: TopicalMapKeyword[];
  totalKeywords: number;
  completedKeywords: number;
  created_at: string;
  updated_at: string;
}