export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  industry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ClientProject {
  id: string;
  client_id: string;
  project_name: string;
  description?: string;
  website?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProjectContent {
  id: string;
  client_project_id: string;
  content_name: string;
  keyword: string;
  website?: string;
  topical_map_id?: string;
  topical_map_keyword_id?: string;
  stage: ProjectStage;
  stage_data: {
    research?: ResearchContent;
    blog?: BlogContent;
    podcast_script?: PodcastContent;
    audio?: AudioContent;
    images?: ImagesContent;
    social?: SocialContent;
  };
  created_at: string;
  updated_at: string;
  last_saved_at: string;
}

// Import from existing types
import { ProjectStage, ResearchContent, BlogContent, PodcastContent, AudioContent, ImagesContent, SocialContent, TopicalMap } from './project.types';

// Dashboard view types
export interface ClientWithProjects extends Client {
  projects: ClientProjectWithContent[];
}

export interface ClientProjectWithContent extends ClientProject {
  contents: ProjectContent[];
  topical_maps?: TopicalMap[];
}

// Auto-save types
export interface AutoSaveData {
  content_id: string;
  stage: ProjectStage;
  data: any;
  saved_at: string;
}