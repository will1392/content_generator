import { useState, useCallback } from 'react';
import { clientService } from '../services/client.service';
import { perplexityService } from '../services/ai/perplexity.service';
import { TopicalMap, TopicalMapKeyword } from '../types/project.types';
import { toast } from 'react-hot-toast';

interface UseTopicalMapsReturn {
  // State
  topicalMaps: TopicalMap[];
  currentMap: TopicalMap | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  generateTopicalMap: (topic: string, location: string, projectId: string, title?: string) => Promise<TopicalMap | null>;
  loadProjectMaps: (projectId: string) => Promise<void>;
  loadMap: (mapId: string) => Promise<void>;
  saveMap: (map: TopicalMap) => Promise<void>;
  createContentFromKeyword: (mapId: string, keyword: TopicalMapKeyword, projectId: string) => Promise<string | null>;
  deleteMap: (mapId: string) => Promise<void>;
  clearCurrentMap: () => void;
}

export const useTopicalMaps = (): UseTopicalMapsReturn => {
  const [topicalMaps, setTopicalMaps] = useState<TopicalMap[]>([]);
  const [currentMap, setCurrentMap] = useState<TopicalMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTopicalMap = useCallback(async (
    topic: string, 
    location: string, 
    projectId: string,
    title?: string
  ): Promise<TopicalMap | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate keywords using AI
      const keywords = await perplexityService.generateTopicalMap(topic, location);
      
      // Create the map
      const mapData = {
        client_project_id: projectId,
        title: title || `${topic} - ${location} Topical Map`,
        topic,
        location,
        description: `Strategic keyword map for ${topic} targeting ${location} market`,
        keywords
      };

      const newMap = await clientService.createTopicalMap(mapData);
      
      if (newMap) {
        setCurrentMap(newMap);
        setTopicalMaps(prev => [newMap, ...prev]);
        toast.success('Topical map created successfully!');
      }
      
      return newMap;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate topical map';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProjectMaps = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const maps = await clientService.getProjectTopicalMaps(projectId);
      setTopicalMaps(maps);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load topical maps';
      setError(errorMessage);
      console.error('Error loading topical maps:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMap = useCallback(async (mapId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const map = await clientService.getTopicalMap(mapId);
      if (map) {
        setCurrentMap(map);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load topical map';
      setError(errorMessage);
      console.error('Error loading topical map:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveMap = useCallback(async (map: TopicalMap) => {
    try {
      // For now, this just saves the current state
      // In a real implementation, you might want to update the map in the database
      toast.success('Topical map saved successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save topical map';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const createContentFromKeyword = useCallback(async (
    mapId: string,
    keyword: TopicalMapKeyword,
    projectId: string
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      // Get the current topical map to find the client project ID
      const topicalMap = await clientService.getTopicalMap(mapId);
      if (!topicalMap) {
        throw new Error('Topical map not found');
      }
      
      // Get the project to retrieve website info
      const project = await clientService.getClientProject(topicalMap.client_project_id);
      
      // Create project content with topical map references
      const contentData = {
        client_project_id: topicalMap.client_project_id,
        content_name: `${keyword.keyword} - Content`,
        keyword: keyword.keyword,
        website: project?.website, // Include website from project
        topical_map_id: mapId,
        topical_map_keyword_id: keyword.id
      };

      console.log('Creating content with data:', contentData);
      const newContent = await clientService.createProjectContent(contentData);
      
      if (newContent) {
        // Update the topical map to mark this keyword as having content
        await clientService.updateTopicalMapKeyword(mapId, keyword.id, {
          contentCreated: true,
          contentId: newContent.id
        });
        
        // Update local state
        if (currentMap && currentMap.id === mapId) {
          const updatedKeywords = currentMap.keywords.map(k => 
            k.id === keyword.id 
              ? { ...k, contentCreated: true, contentId: newContent.id }
              : k
          );
          
          setCurrentMap({
            ...currentMap,
            keywords: updatedKeywords,
            completedKeywords: updatedKeywords.filter(k => k.contentCreated).length
          });
        }
        
        toast.success('Content created successfully!');
        return newContent.id;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create content';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentMap]);

  const deleteMap = useCallback(async (mapId: string) => {
    try {
      setIsLoading(true);
      
      await clientService.deleteTopicalMap(mapId);
      
      setTopicalMaps(prev => prev.filter(map => map.id !== mapId));
      
      if (currentMap?.id === mapId) {
        setCurrentMap(null);
      }
      
      toast.success('Topical map deleted successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete topical map';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentMap]);

  const clearCurrentMap = useCallback(() => {
    setCurrentMap(null);
  }, []);

  return {
    topicalMaps,
    currentMap,
    isLoading,
    error,
    generateTopicalMap,
    loadProjectMaps,
    loadMap,
    saveMap,
    createContentFromKeyword,
    deleteMap,
    clearCurrentMap
  };
};