import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FolderOpen, FileText, BarChart3, Clock, TrendingUp, Globe } from 'lucide-react';
import { ClientSelector } from './ClientSelector';
import { ProjectOrganizer } from './ProjectOrganizer';
import { CreateModal } from './CreateModal';
import { useClientProject } from '../../hooks/useClientProject';
import { Client } from '../../types/client.types';

interface ClientDashboardProps {
  onContentSelected: (contentId: string) => void;
  onTopicalMapRequested?: (projectId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onContentSelected, onTopicalMapRequested }) => {
  const {
    selectedClient,
    selectedProject,
    selectedContent,
    clients,
    projects,
    contents,
    isLoading,
    loadClients,
    selectClient,
    selectProject,
    selectContent,
    createClient,
    createProject,
    createContent
  } = useClientProject();

  const [modalType, setModalType] = useState<'client' | 'project' | 'content' | null>(null);
  
  // Debug modal state changes
  useEffect(() => {
    console.log('Modal type changed to:', modalType);
  }, [modalType]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (selectedContent) {
      onContentSelected(selectedContent.id);
    }
  }, [selectedContent, onContentSelected]);

  const handleCreateClient = async (data: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
    const newClient = await createClient({ ...data, is_active: true });
    if (newClient) {
      setModalType(null);
    }
  };

  const handleCreateProject = async (data: { project_name: string; description?: string; website?: string }) => {
    console.log('Creating project with data:', data);
    console.log('Selected client:', selectedClient);
    try {
      const newProject = await createProject(data.project_name, data.description, data.website);
      console.log('Project creation result:', newProject);
      if (newProject) {
        setModalType(null);
      }
    } catch (error) {
      console.error('Project creation error:', error);
    }
  };

  const handleCreateContent = async (data: { content_name: string; keyword: string }) => {
    const newContent = await createContent(data.content_name, data.keyword);
    if (newContent) {
      setModalType(null);
      selectContent(newContent);
    }
  };

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const projectsWithWebsites = projects.filter(p => p.website).length;
  const totalContents = contents.length;
  const completedContents = contents.filter(c => c.stage === 'complete').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-[#1a0d3d] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-[#533de3]" />
              <h1 className="text-3xl font-bold text-white">Content Dashboard</h1>
            </div>
            <button
              onClick={() => onContentSelected('quick-start')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/20"
            >
              <FileText className="w-5 h-5" />
              Quick Start
            </button>
          </div>
          <p className="text-white/60">Manage your clients, projects, and content in one place</p>
        </div>

        {/* Database Setup Warning */}
        {clients.length === 0 && !isLoading && (
          <div className="mb-8 p-6 bg-yellow-500/10 backdrop-blur-xl rounded-2xl border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Database Setup Required</h3>
            <p className="text-yellow-200/80 mb-4">
              It looks like the database tables haven't been created yet. To use the full client management features:
            </p>
            <ol className="list-decimal list-inside text-yellow-200/80 mb-4 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Run the SQL script found in <code className="bg-black/20 px-2 py-1 rounded text-yellow-300">create_tables.sql</code></li>
            </ol>
            <p className="text-yellow-200/60 text-sm">
              Or use "Quick Start" to skip client management for now.
            </p>
          </div>
        )}

        {/* Client Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-white/60" />
            Select Client
          </h2>
          <ClientSelector
            clients={clients}
            selectedClient={selectedClient}
            onSelectClient={selectClient}
            onCreateClient={() => setModalType('client')}
            isLoading={isLoading}
          />
        </div>

        {selectedClient && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <FolderOpen className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{totalProjects}</span>
                </div>
                <p className="text-white/60 text-sm">Total Projects</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{activeProjects}</span>
                </div>
                <p className="text-white/60 text-sm">Active Projects</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="w-8 h-8 text-cyan-400" />
                  <span className="text-2xl font-bold text-white">{projectsWithWebsites}</span>
                </div>
                <p className="text-white/60 text-sm">With Websites</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{totalContents}</span>
                </div>
                <p className="text-white/60 text-sm">Total Content</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <span className="text-2xl font-bold text-white">{completedContents}</span>
                </div>
                <p className="text-white/60 text-sm">Completed</p>
              </div>
            </div>

            {/* Project Organizer */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-white/60" />
                Projects & Content
              </h2>
              <ProjectOrganizer
                projects={projects}
                contents={contents}
                selectedProject={selectedProject}
                selectedContent={selectedContent}
                onSelectProject={selectProject}
                onSelectContent={selectContent}
                onCreateProject={() => {
                  console.log('New Project button clicked, selectedClient:', selectedClient);
                  setModalType('project');
                }}
                onCreateContent={() => setModalType('content')}
                onCreateTopicalMap={selectedProject ? () => onTopicalMapRequested?.(selectedProject.id) : undefined}
              />
            </div>

            {/* Quick Actions */}
            {selectedContent && (
              <div className="bg-[#533de3]/20 backdrop-blur-xl rounded-2xl p-6 border border-[#533de3]/30">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to Continue
                </h3>
                <p className="text-white/80 mb-4">
                  You have selected: <span className="font-semibold">{selectedContent.content_name}</span>
                </p>
                <p className="text-white/60 text-sm">
                  Current stage: <span className="text-[#533de3] font-medium">{selectedContent.stage.replace('_', ' ')}</span>
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Close this dashboard to continue working on your content.
                </p>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <CreateModal
          type={modalType || 'client'}
          isOpen={modalType !== null}
          onClose={() => setModalType(null)}
          onSubmit={
            modalType === 'client' ? handleCreateClient :
            modalType === 'project' ? handleCreateProject :
            handleCreateContent
          }
        />
      </div>
    </div>
  );
};