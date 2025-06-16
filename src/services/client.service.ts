import { supabase } from './supabase.service';
import { Client, ClientProject, ProjectContent, ClientWithProjects } from '../types/client.types';
import { ProjectStage } from '../types/project.types';

export class ClientService {
  // Client Management
  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
    try {
      console.log('Attempting to create client:', clientData);
      
      // First, check if the clients table exists by trying to read from it
      const { error: tableCheckError } = await supabase
        .from('clients')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.error('Clients table does not exist or is not accessible:', tableCheckError);
        
        // Try to create the table if it doesn't exist
        await this.createTablesIfNotExist();
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Client created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating client:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create client: ${error.message}`);
    }
  }

  // Helper method to create tables if they don't exist
  private async createTablesIfNotExist(): Promise<void> {
    try {
      console.log('Attempting to create tables...');
      
      // Create clients table
      const { error: clientsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS clients (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            company VARCHAR(255),
            industry VARCHAR(255),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            is_active BOOLEAN DEFAULT true
          );
        `
      });

      if (clientsError) {
        console.warn('Could not create clients table via RPC:', clientsError);
      }

    } catch (error) {
      console.warn('Could not create tables automatically:', error);
    }
  }

  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching clients:', error);
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          console.warn('Clients table does not exist, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      // Return empty array for now if tables don't exist
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.warn('Database tables not yet created, returning empty array');
        return [];
      }
      throw error;
    }
  }

  async getClient(clientId: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // Project Management
  async createClientProject(projectData: Omit<ClientProject, 'id' | 'created_at' | 'updated_at'>): Promise<ClientProject | null> {
    try {
      const { data, error } = await supabase
        .from('client_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating client project:', error);
      throw error;
    }
  }

  async getClientProjects(clientId: string): Promise<ClientProject[]> {
    try {
      const { data, error } = await supabase
        .from('client_projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching client projects:', error);
      throw error;
    }
  }

  // Content Management
  async createProjectContent(contentData: {
    client_project_id: string;
    content_name: string;
    keyword: string;
  }): Promise<ProjectContent | null> {
    try {
      const { data, error } = await supabase
        .from('project_contents')
        .insert([{
          ...contentData,
          stage: 'research',
          stage_data: {}
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project content:', error);
      throw error;
    }
  }

  async getProjectContents(clientProjectId: string): Promise<ProjectContent[]> {
    try {
      const { data, error } = await supabase
        .from('project_contents')
        .select('*')
        .eq('client_project_id', clientProjectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project contents:', error);
      throw error;
    }
  }

  async getProjectContent(contentId: string): Promise<ProjectContent | null> {
    try {
      const { data, error } = await supabase
        .from('project_contents')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project content:', error);
      throw error;
    }
  }

  // Auto-save functionality
  async autoSaveContent(contentId: string, stage: ProjectStage, data: any): Promise<void> {
    try {
      // Update the main content record
      const { error: updateError } = await supabase
        .from('project_contents')
        .update({
          stage,
          stage_data: data,
          last_saved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (updateError) throw updateError;

      // Save to auto_saves table for history
      const { error: saveError } = await supabase
        .from('auto_saves')
        .insert([{
          content_id: contentId,
          stage,
          data
        }]);

      if (saveError) throw saveError;
    } catch (error) {
      console.error('Error auto-saving content:', error);
      throw error;
    }
  }

  // Dashboard data
  async getClientDashboardData(): Promise<ClientWithProjects[]> {
    try {
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          client_projects (
            *,
            project_contents (*)
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (clientError) throw clientError;

      // Transform the data to match our TypeScript types
      return (clients || []).map(client => ({
        ...client,
        projects: client.client_projects.map((project: any) => ({
          ...project,
          contents: project.project_contents || []
        }))
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Search functionality
  async searchContent(searchTerm: string): Promise<ProjectContent[]> {
    try {
      const { data, error } = await supabase
        .from('project_contents')
        .select(`
          *,
          client_projects!inner (
            *,
            clients!inner (*)
          )
        `)
        .or(`keyword.ilike.%${searchTerm}%,content_name.ilike.%${searchTerm}%`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }
}

export const clientService = new ClientService();