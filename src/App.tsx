// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { supabase } from './services/supabase.service';
import { clientService } from './services/client.service';
import { AppLayout } from './components/layout/AppLayout';
import { ClientDashboard } from './components/client/ClientDashboard';
import { KeywordInput } from './components/stages/KeywordInput';
import { ResearchDisplay } from './components/stages/ResearchDisplay';
import { BlogDisplay } from './components/stages/BlogDisplay';
import { PodcastDisplay } from './components/stages/PodcastDisplay';
import { AudioPlayer } from './components/stages/AudioPlayer';
import { ImageGallery } from './components/stages/ImageGallery';
import { SocialCaptions } from './components/stages/SocialCaptions';
import { ContentSummary } from './components/final/ContentSummary';
import { useProject } from './hooks/useProject';
import { useClientProject } from './hooks/useClientProject';
import { ProjectStage, ResearchContent } from './types/project.types';
import { ProjectContent } from './types/client.types';

function App() {
  const {
    project,
    currentStage,
    isLoading,
    error,
    createProject,
    updateStage,
    getStageContent,
    regenerateContent
  } = useProject();

  const {
    selectedContent,
    autoSave
  } = useClientProject();

  const [stageContent, setStageContent] = useState<Record<string, any>>({});
  const [showDashboard, setShowDashboard] = useState(true);
  const [activeContent, setActiveContent] = useState<ProjectContent | null>(null);

  // Ensure we always start on the dashboard
  useEffect(() => {
    // Clear any saved state
    localStorage.removeItem('currentProjectId');
    localStorage.removeItem('currentContentId');
    
    // Reset to dashboard
    setShowDashboard(true);
    setActiveContent(null);
    setStageContent({});
    
    console.log('App initialized - forcing dashboard view');
  }, []);

  // Test Supabase connection on component mount
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('projects').select('*').limit(1);
        console.log('Supabase test result:', { data, error });
        
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connected successfully');
        }
      } catch (err) {
        console.error('Supabase test failed:', err);
      }
    };
    
    testSupabaseConnection();
  }, []);

  // Handle content selection from dashboard
  const handleContentSelected = useCallback(async (contentId: string) => {
    // Handle quick start option
    if (contentId === 'quick-start') {
      setShowDashboard(false);
      setActiveContent(null);
      setStageContent({});
      return;
    }

    try {
      const content = await clientService.getProjectContent(contentId);
      if (content) {
        console.log('=== LOADING CONTENT ===');
        console.log('Content:', content);
        console.log('Stage data keys:', Object.keys(content.stage_data || {}));
        
        setActiveContent(content);
        setShowDashboard(false);
        
        // Load stage data
        if (content.stage_data) {
          setStageContent(content.stage_data);
          console.log('Loaded stage content:', Object.keys(content.stage_data));
        } else {
          console.log('No stage data found, starting fresh');
          setStageContent({});
        }
      }
    } catch (err) {
      console.error('Failed to load content:', err);
      toast.error('Failed to load content');
    }
  }, []);

  // Auto-save when content changes
  const handleContentUpdate = useCallback(async (stage: ProjectStage, data: any) => {
    console.log('=== CONTENT UPDATE DEBUG ===');
    console.log('Stage:', stage);
    console.log('Data keys:', Object.keys(data || {}));
    console.log('Has activeContent:', !!activeContent);
    console.log('Current stageContent keys:', Object.keys(stageContent));
    
    if (!activeContent) {
      console.log('No activeContent - using legacy project update');
      // Fallback for legacy projects
      setStageContent(prev => ({ ...prev, [stage]: data }));
      return;
    }

    // Update local state immediately
    const newStageContent = { ...stageContent, [stage]: data };
    setStageContent(newStageContent);
    
    console.log('Updated local state, now auto-saving...');
    
    // Auto-save to database using clientService directly
    try {
      if (activeContent) {
        await clientService.autoSaveContent(activeContent.id, stage, newStageContent);
        console.log('Auto-save completed successfully');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [activeContent, stageContent]);

  const loadAllStageContent = useCallback(async () => {
    if (!project?.id) return;
    
    const stages: ProjectStage[] = [
      'research', 'blog', 'podcast_script', 
      'audio', 'images', 'social'
    ];
    
    const content: Record<string, any> = {};
    
    for (const stage of stages) {
      const data = await getStageContent(project.id, stage);
      if (data) {
        content[stage] = data;
      }
    }
    
    setStageContent(content);
  }, [project?.id, getStageContent]);

  useEffect(() => {
    if (project?.id) {
      loadAllStageContent();
    }
  }, [project?.id, loadAllStageContent]);

  const handleKeywordSubmit = async (keyword: string) => {
    if (activeContent) {
      // If we have an active content from client dashboard, use that
      await handleGenerateResearch(activeContent.id, keyword);
    } else {
      // Legacy flow - create a project directly
      const newProject = await createProject(keyword);
      if (newProject) {
        await handleGenerateResearch(newProject.id, keyword);
      }
    }
  };

  const handleGenerateResearch = async (contentId: string, keyword: string) => {
    const timeoutId = setTimeout(() => {
      console.warn('Research is taking longer than expected... Still processing...');
    }, 15000);

    try {
      const research = await regenerateContent(contentId, 'research', { keyword });
      clearTimeout(timeoutId);
      
      if (research) {
        await handleContentUpdate('research', research);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const handleGenerateBlog = async () => {
    const projectId = activeContent?.id || project?.id;
    const keyword = activeContent?.keyword || project?.keyword;
    
    console.log('=== BLOG GENERATION DEBUG ===');
    console.log('Project ID:', projectId);
    console.log('Keyword:', keyword);
    console.log('Has research data:', !!stageContent.research);
    console.log('Research data keys:', stageContent.research ? Object.keys(stageContent.research) : 'None');
    console.log('==============================');
    
    if (!projectId || !stageContent.research) {
      console.error('Missing required data for blog generation:', {
        hasProjectId: !!projectId,
        hasResearch: !!stageContent.research,
        projectId,
        keyword
      });
      toast.error('Missing required data. Please generate research first.');
      return;
    }
    
    if (!keyword) {
      console.error('Missing keyword for blog generation');
      toast.error('Missing keyword. Please check your project setup.');
      return;
    }
    
    try {
      console.log('Starting blog generation...');
      const blog = await regenerateContent(projectId, 'blog', {
        keyword,
        research: stageContent.research
      });
      
      console.log('Blog generation result:', blog);
      
      if (blog) {
        console.log('Updating content with blog data...');
        await handleContentUpdate('blog', blog);
        
        // Only update stage if we have a project (not for activeContent)
        if (project?.id) {
          await updateStage(projectId, 'blog');
        }
        
        console.log('Blog generation completed successfully');
      } else {
        console.error('Blog generation returned null/undefined');
        toast.error('Blog generation failed - no content returned');
      }
    } catch (error: any) {
      console.error('Blog generation error:', error);
      toast.error(`Blog generation failed: ${error.message}`);
    }
  };

  const handleGeneratePodcast = async () => {
    const projectId = activeContent?.id || project?.id;
    const keyword = activeContent?.keyword || project?.keyword;
    
    console.log('=== PODCAST GENERATION DEBUG ===');
    console.log('Project ID:', projectId);
    console.log('Keyword:', keyword);
    console.log('Has blog:', !!stageContent.blog);
    console.log('Has research:', !!stageContent.research);
    console.log('=================================');
    
    if (!projectId || !stageContent.blog) {
      console.error('Missing required data for podcast generation:', {
        hasProjectId: !!projectId,
        hasBlog: !!stageContent.blog,
        hasResearch: !!stageContent.research
      });
      toast.error('Missing required data. Please generate blog content first.');
      return;
    }
    
    if (!keyword) {
      console.error('Missing keyword for podcast generation');
      toast.error('Missing keyword. Please check your project setup.');
      return;
    }
    
    try {
      console.log('Starting podcast generation...');
      const podcast = await regenerateContent(projectId, 'podcast_script', {
        keyword,
        research: stageContent.research,
        blog: stageContent.blog
      });
      
      console.log('Podcast generation result:', podcast);
      
      if (podcast) {
        console.log('Updating content with podcast data...');
        await handleContentUpdate('podcast_script', podcast);
        
        // Only update stage if we have a project (not for activeContent)
        if (project?.id) {
          await updateStage(projectId, 'podcast_script');
        }
        
        console.log('Podcast generation completed successfully');
      } else {
        console.error('Podcast generation returned null/undefined');
        toast.error('Podcast generation failed - no content returned');
      }
    } catch (error: any) {
      console.error('Podcast generation error:', error);
      toast.error(`Podcast generation failed: ${error.message}`);
    }
  };

  const handleGenerateAudio = async () => {
    const projectId = activeContent?.id || project?.id;
    const keyword = activeContent?.keyword || project?.keyword;
    
    console.log('=== AUDIO GENERATION DEBUG ===');
    console.log('Project ID:', projectId);
    console.log('Keyword:', keyword);
    console.log('Has podcast script:', !!stageContent.podcast_script);
    console.log('Current audio content:', stageContent.audio);
    console.log('Is loading state:', isLoading);
    console.log('===============================');
    
    if (!projectId || !stageContent.podcast_script) {
      console.error('Missing required data for audio generation:', {
        hasProjectId: !!projectId,
        hasPodcastScript: !!stageContent.podcast_script
      });
      toast.error('Missing required data. Please generate podcast script first.');
      return;
    }
    
    if (!keyword) {
      console.error('Missing keyword for audio generation');
      toast.error('Missing keyword. Please check your project setup.');
      return;
    }
    
    try {
      console.log('Starting audio generation...');
      
      // Clear existing audio to show loading state
      await handleContentUpdate('audio', null);
      
      const audio = await regenerateContent(projectId, 'audio', {
        keyword,
        podcastScript: stageContent.podcast_script
      });
      
      console.log('Audio generation result:', audio);
      console.log('Audio result type:', typeof audio);
      console.log('Audio result keys:', audio ? Object.keys(audio) : 'null');
      
      if (audio) {
        console.log('Updating content with audio data...');
        await handleContentUpdate('audio', audio);
        
        // Only update stage if we have a project (not for activeContent)
        if (project?.id) {
          await updateStage(projectId, 'audio');
        }
        
        console.log('Audio generation completed successfully');
        toast.success('Audio generated successfully!');
      } else {
        console.error('Audio generation returned null/undefined');
        toast.error('Audio generation failed - no content returned');
      }
    } catch (error: any) {
      console.error('Audio generation error:', error);
      console.error('Error stack:', error.stack);
      toast.error(`Audio generation failed: ${error.message}`);
    }
  };

  const handleGenerateImages = async () => {
    const projectId = activeContent?.id || project?.id;
    if (!projectId || !stageContent.blog) return;
    
    const images = await regenerateContent(projectId, 'images', {
      keyword: activeContent?.keyword || project?.keyword,
      content: stageContent.blog
    });
    
    if (images) {
      await handleContentUpdate('images', images);
      await updateStage(projectId, 'images');
    }
  };

  const handleGenerateSocial = async () => {
    const projectId = activeContent?.id || project?.id;
    if (!projectId || !stageContent.blog) return;
    
    const social = await regenerateContent(projectId, 'social', {
      keyword: activeContent?.keyword || project?.keyword,
      content: stageContent.blog
    });
    
    if (social) {
      await handleContentUpdate('social', social);
      await updateStage(projectId, 'social');
    }
  };

  const handleCompleteProject = async () => {
    const projectId = activeContent?.id || project?.id;
    if (!projectId) return;
    await updateStage(projectId, 'complete');
  };

  const getCurrentStage = () => {
    if (activeContent) {
      // Determine stage based on what content exists
      if (stageContent.social) return 'social';
      if (stageContent.images) return 'images';
      if (stageContent.audio) return 'audio';
      if (stageContent.podcast_script) return 'podcast_script';
      if (stageContent.blog) return 'blog';
      if (stageContent.research) return 'research';
      return 'research'; // Default to research if no content
    }
    return currentStage;
  };

  const renderCurrentStage = () => {
    const stage = getCurrentStage();
    const keyword = activeContent?.keyword || project?.keyword;

    if (!keyword && !activeContent) {
      return <KeywordInput onSubmit={handleKeywordSubmit} isLoading={isLoading} />;
    }

    switch (stage) {
      case 'research':
        return (
          <ResearchDisplay
            research={stageContent.research}
            isLoading={isLoading}
            onRegenerate={() => handleGenerateResearch(activeContent?.id || project?.id || '', keyword || '')}
            onContinue={handleGenerateBlog}
          />
        );
      
      case 'blog':
        return (
          <BlogDisplay
            blog={stageContent.blog}
            isLoading={isLoading}
            onRegenerate={handleGenerateBlog}
            onContinue={handleGeneratePodcast}
          />
        );

      case 'podcast_script':
        return (
          <PodcastDisplay
            podcast={stageContent.podcast_script}
            isLoading={isLoading}
            onRegenerate={handleGeneratePodcast}
            onContinue={handleGenerateAudio}
          />
        );

      case 'audio':
        return (
          <AudioPlayer
            audio={stageContent.audio}
            isLoading={isLoading}
            onRegenerate={handleGenerateAudio}
            onContinue={handleGenerateImages}
          />
        );

      case 'images':
        return (
          <ImageGallery
            images={stageContent.images}
            isLoading={isLoading}
            onRegenerate={handleGenerateImages}
            onContinue={handleGenerateSocial}
          />
        );

      case 'social':
        return (
          <SocialCaptions
            social={stageContent.social}
            isLoading={isLoading}
            onRegenerate={handleGenerateSocial}
            onContinue={handleCompleteProject}
          />
        );

      case 'complete':
        return (
          <ContentSummary
            project={project || { 
              id: activeContent?.id || '', 
              keyword: keyword || '',
              status: 'complete',
              created_at: activeContent?.created_at || '',
              updated_at: activeContent?.updated_at || ''
            }}
            onNewProject={() => {
              setShowDashboard(true);
              setActiveContent(null);
              setStageContent({});
            }}
          />
        );
      
      default:
        return <div>Unknown stage</div>;
    }
  };

  if (showDashboard) {
    return (
      <>
        <ClientDashboard onContentSelected={handleContentSelected} />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(20, 20, 20, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 bg-gradient-to-br from-gray-900 via-gray-950 to-[#1a0d3d]">
      {/* Navigation Bar */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between">
        {/* Home/Dashboard Button */}
        <button
          onClick={() => {
            setShowDashboard(true);
            setActiveContent(null);
            setStageContent({});
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
        >
          <Menu className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Dashboard</span>
        </button>

        {/* Current Content Info */}
        {activeContent && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
            <p className="text-white/80 text-sm">
              <span className="text-white/60">Working on:</span> {activeContent.content_name}
            </p>
          </div>
        )}
      </div>

      <AppLayout 
        project={project || (activeContent ? {
          id: activeContent.id,
          keyword: activeContent.keyword,
          status: activeContent.stage as ProjectStage,
          created_at: activeContent.created_at,
          updated_at: activeContent.updated_at
        } : null)}
      >
        <div className="max-w-4xl mx-auto pt-20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl text-red-400">
              {error}
            </div>
          )}
          
          {renderCurrentStage()}
        </div>
      </AppLayout>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 20, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </div>
  );
}

export default App;