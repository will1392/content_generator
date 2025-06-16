import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../services/supabase.service';
import { contentService } from '../services/content.service';
import { Project, ProjectStage } from '../types/project.types';

const LOCAL_STORAGE_KEY = 'currentProjectId';

export const useProject = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [currentStage, setCurrentStage] = useState<ProjectStage>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove or comment out this auto-load effect
  // useEffect(() => {
  //   const savedProjectId = localStorage.getItem(LOCAL_STORAGE_KEY);
  //   if (savedProjectId) {
  //     loadProject(savedProjectId);
  //   }
  // }, []);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      setProject(data);
      setCurrentStage(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (keyword: string): Promise<Project | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const newProject = {
        keyword,
        status: 'research' as ProjectStage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;

      setProject(data);
      setCurrentStage(data.status);
      localStorage.setItem(LOCAL_STORAGE_KEY, data.id);
      toast.success('Project created successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStage = async (projectId: string, newStage: ProjectStage): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStage,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      setCurrentStage(newStage);
      if (project) {
        setProject({ ...project, status: newStage });
      }
      toast.success(`Stage updated to ${newStage}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stage';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getStageContent = useCallback(async (projectId: string, stageType: ProjectStage): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('content_stages')
        .select('*')
        .eq('project_id', projectId)
        .eq('stage_type', stageType)
        .eq('is_current', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        throw error;
      }

      return data?.content || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get content';
      setError(errorMessage);
      console.error(`Failed to fetch ${stageType} content:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateContent = useCallback(async (
    projectId: string,
    stageType: ProjectStage,
    params: any
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      switch (stageType) {
        case 'research':
          response = await contentService.generateResearch(projectId, params.keyword);
          break;
          
        case 'blog':
          response = await contentService.generateBlog(
            projectId, 
            params.keyword, 
            params.research
          );
          break;
          
        case 'podcast_script':
          response = await contentService.generatePodcastScript(
            projectId,
            params.keyword,
            params.research,
            params.blog
          );
          break;
          
        case 'audio':
          response = await contentService.generateAudio(
            projectId,
            params.keyword,
            params.podcastScript
          );
          break;
          
        default:
          throw new Error('Invalid stage type');
      }
      
      toast.success(`${stageType.replace('_', ' ')} generated successfully!`);
      return response;
    } catch (err: any) {
      setError(err.message || `Failed to generate ${stageType}`);
      toast.error(err.message || `Failed to generate ${stageType}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearProject = useCallback(() => {
    setProject(null);
    setCurrentStage('research');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  return {
    project,
    currentStage,
    isLoading,
    error,
    createProject,
    updateStage,
    getStageContent,
    regenerateContent,
    clearProject,
  };
};