import { useState, useCallback, useEffect } from 'react';
import { clientService } from '../services/client.service';
import { contentService } from '../services/content.service';
import { Client, ClientProject, ProjectContent } from '../types/client.types';
import { ProjectStage } from '../types/project.types';
import { toast } from 'react-toastify';

interface UseClientProjectReturn {
  // State
  selectedClient: Client | null;
  selectedProject: ClientProject | null;
  selectedContent: ProjectContent | null;
  clients: Client[];
  projects: ClientProject[];
  contents: ProjectContent[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadClients: () => Promise<void>;
  selectClient: (client: Client) => Promise<void>;
  selectProject: (project: ClientProject) => Promise<void>;
  selectContent: (content: ProjectContent) => void;
  createClient: (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client | null>;
  createProject: (projectName: string, description?: string) => Promise<ClientProject | null>;
  createContent: (contentName: string, keyword: string) => Promise<ProjectContent | null>;
  updateContentStage: (stage: ProjectStage, data: any) => Promise<void>;
  autoSave: (stage: ProjectStage, data: any) => Promise<void>;
}

export const useClientProject = (): UseClientProjectReturn => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);
  const [selectedContent, setSelectedContent] = useState<ProjectContent | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [contents, setContents] = useState<ProjectContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const clientList = await clientService.getClients();
      setClients(clientList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectClient = useCallback(async (client: Client) => {
    try {
      setIsLoading(true);
      setSelectedClient(client);
      setSelectedProject(null);
      setSelectedContent(null);
      
      const projectList = await clientService.getClientProjects(client.id);
      setProjects(projectList);
      setContents([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectProject = useCallback(async (project: ClientProject) => {
    try {
      setIsLoading(true);
      setSelectedProject(project);
      setSelectedContent(null);
      
      const contentList = await clientService.getProjectContents(project.id);
      setContents(contentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contents');
      toast.error('Failed to load contents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectContent = useCallback((content: ProjectContent) => {
    setSelectedContent(content);
    // Store in localStorage for quick access
    localStorage.setItem('currentContentId', content.id);
  }, []);

  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      const newClient = await clientService.createClient(clientData);
      if (newClient) {
        await loadClients();
        toast.success('Client created successfully');
      }
      return newClient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
      toast.error('Failed to create client');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadClients]);

  const createProject = useCallback(async (projectName: string, description?: string) => {
    if (!selectedClient) {
      toast.error('Please select a client first');
      return null;
    }

    try {
      setIsLoading(true);
      const newProject = await clientService.createClientProject({
        client_id: selectedClient.id,
        project_name: projectName,
        description,
        status: 'active'
      });
      
      if (newProject) {
        await selectClient(selectedClient);
        toast.success('Project created successfully');
      }
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      toast.error('Failed to create project');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient, selectClient]);

  const createContent = useCallback(async (contentName: string, keyword: string) => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      return null;
    }

    try {
      setIsLoading(true);
      const newContent = await clientService.createProjectContent({
        client_project_id: selectedProject.id,
        content_name: contentName,
        keyword
      });
      
      if (newContent) {
        await selectProject(selectedProject);
        toast.success('Content created successfully');
      }
      return newContent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
      toast.error('Failed to create content');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, selectProject]);

  const updateContentStage = useCallback(async (stage: ProjectStage, data: any) => {
    if (!selectedContent) return;

    try {
      await clientService.autoSaveContent(selectedContent.id, stage, {
        ...selectedContent.stage_data,
        [stage]: data
      });
      
      // Update local state
      setSelectedContent({
        ...selectedContent,
        stage,
        stage_data: {
          ...selectedContent.stage_data,
          [stage]: data
        },
        last_saved_at: new Date().toISOString()
      });
      
      toast.success('Progress saved');
    } catch (err) {
      console.error('Failed to save progress:', err);
      toast.error('Failed to save progress');
    }
  }, [selectedContent]);

  const autoSave = useCallback(async (stage: ProjectStage, stageData: any) => {
    // For App.tsx usage - we'll get the activeContent from the context
    // This is a bit of a hack but necessary for the current architecture
    console.log('AutoSave called with stage:', stage);
    console.log('AutoSave stageData keys:', Object.keys(stageData || {}));
    
    // We'll implement this as immediate save rather than delayed
    // since the App.tsx is managing the activeContent
    return Promise.resolve(); // Placeholder for now
  }, []);

  // Load saved content on mount - DISABLED to ensure dashboard starts fresh
  // useEffect(() => {
  //   const savedContentId = localStorage.getItem('currentContentId');
  //   if (savedContentId) {
  //     clientService.getProjectContent(savedContentId).then(content => {
  //       if (content) {
  //         setSelectedContent(content);
  //       }
  //     });
  //   }
  // }, []);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return {
    selectedClient,
    selectedProject,
    selectedContent,
    clients,
    projects,
    contents,
    isLoading,
    error,
    loadClients,
    selectClient,
    selectProject,
    selectContent,
    createClient,
    createProject,
    createContent,
    updateContentStage,
    autoSave
  };
};