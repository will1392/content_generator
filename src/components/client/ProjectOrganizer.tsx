import React, { useState } from 'react';
import { Folder, FileText, Plus, ChevronRight, ChevronDown, Clock, CheckCircle, Archive, Search, Globe, ExternalLink, Map } from 'lucide-react';
import { ClientProject, ProjectContent } from '../../types/client.types';

interface ProjectOrganizerProps {
  projects: ClientProject[];
  contents: ProjectContent[];
  selectedProject: ClientProject | null;
  selectedContent: ProjectContent | null;
  onSelectProject: (project: ClientProject) => void;
  onSelectContent: (content: ProjectContent) => void;
  onCreateProject: () => void;
  onCreateContent: () => void;
  onCreateTopicalMap?: () => void;
}

export const ProjectOrganizer: React.FC<ProjectOrganizerProps> = ({
  projects,
  contents,
  selectedProject,
  selectedContent,
  onSelectProject,
  onSelectContent,
  onCreateProject,
  onCreateContent,
  onCreateTopicalMap
}) => {
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      research: 'text-purple-400',
      blog: 'text-blue-400',
      podcast_script: 'text-green-400',
      audio: 'text-yellow-400',
      images: 'text-pink-400',
      social: 'text-orange-400',
      complete: 'text-emerald-400'
    };
    return colors[stage] || 'text-white/60';
  };

  const filteredProjects = projects.filter(project =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contents.some(content => 
      content.client_project_id === project.id &&
      (content.content_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       content.keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Projects & Content</h3>
          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#533de3]/20 hover:bg-[#533de3]/30 rounded-lg text-[#533de3] text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search projects or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#533de3]/50"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </div>
        ) : (
          filteredProjects.map((project) => {
            const projectContents = contents.filter(c => c.client_project_id === project.id);
            const isExpanded = expandedProjects.includes(project.id);
            const isSelected = selectedProject?.id === project.id;

            return (
              <div key={project.id} className="border-b border-white/5 last:border-0">
                {/* Project Header */}
                <div
                  className={`flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#533de3]/10' : ''
                  }`}
                  onClick={() => {
                    onSelectProject(project);
                    if (!isExpanded) toggleProject(project.id);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProject(project.id);
                    }}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                  
                  <Folder className={`w-5 h-5 ${isSelected ? 'text-[#533de3]' : 'text-white/60'}`} />
                  
                  <div className="flex-1">
                    <p className="font-medium text-white">{project.project_name}</p>
                    {project.description && (
                      <p className="text-sm text-white/60 mt-0.5">{project.description}</p>
                    )}
                    {project.website && (
                      <div className="flex items-center gap-1 mt-1">
                        <Globe className="w-3 h-3 text-white/40" />
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#533de3] hover:text-[#4531b8] transition-colors flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(project.status)}
                      <span className="text-xs text-white/60 capitalize">{project.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <FileText className="w-3 h-3" />
                      <span>{projectContents.length} content{projectContents.length !== 1 ? 's' : ''}</span>
                    </div>
                    {projectContents.length > 0 && (
                      <div className="text-xs text-white/40">
                        {projectContents.filter(c => c.stage === 'complete').length} completed
                      </div>
                    )}
                  </div>
                </div>

                {/* Content List */}
                {isExpanded && (
                  <div className="bg-black/20">
                    {projectContents.length === 0 ? (
                      <div className="p-4 pl-12 text-sm text-white/40">
                        No content yet
                      </div>
                    ) : (
                      projectContents.map((content) => {
                        const isContentSelected = selectedContent?.id === content.id;
                        
                        return (
                          <div
                            key={content.id}
                            onClick={() => onSelectContent(content)}
                            className={`flex items-center gap-3 p-3 pl-12 hover:bg-white/5 cursor-pointer transition-colors ${
                              isContentSelected ? 'bg-[#533de3]/10' : ''
                            }`}
                          >
                            <FileText className={`w-4 h-4 ${isContentSelected ? 'text-[#533de3]' : 'text-white/40'}`} />
                            
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{content.content_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-white/60">{content.keyword}</span>
                                <span className="text-xs text-white/40">•</span>
                                <span className={`text-xs font-medium ${getStageColor(content.stage)}`}>
                                  {content.stage.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-white/40">
                              {new Date(content.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    {/* Add Content Buttons */}
                    {isSelected && (
                      <div className="p-3 pl-12 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateContent();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Content
                        </button>
                        
                        {onCreateTopicalMap && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateTopicalMap();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm transition-colors"
                          >
                            <Map className="w-3 h-3" />
                            Topical Map
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};