// services/content.service.ts
import { perplexityService } from './ai/perplexity.service';
import { anthropicService } from './ai/anthropic.service';
import { geminiService } from './ai/gemini.service';
import { supabase } from './supabase.service';
import { ResearchContent, BlogContent, PodcastContent, AudioContent } from '../types/project.types';

export class ContentService {
  async generateResearch(projectId: string, keyword: string, website?: string): Promise<ResearchContent> {
    try {
      console.log('ContentService: Starting research generation for:', keyword);
      console.log('ContentService: Project ID:', projectId);
      console.log('ContentService: Website:', website);
      
      // Call Perplexity API
      console.log('ContentService: Calling Perplexity API...');
      const research = await perplexityService.generateResearch(keyword, website);
      console.log('ContentService: Research received from Perplexity');
      
      // Save to Supabase
      console.log('ContentService: Saving to Supabase...');
      await this.saveContent(projectId, 'research', research);
      console.log('ContentService: Successfully saved to Supabase');
      
      return research;
    } catch (error: any) {
      console.error('ContentService: Research generation failed:', error);
      console.error('ContentService: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(error.message || 'Failed to generate research');
    }
  }

  async generateBlog(projectId: string, keyword: string, research: ResearchContent, website?: string): Promise<BlogContent> {
    try {
      console.log('ContentService: Starting blog generation for:', keyword);
      console.log('ContentService: Project ID:', projectId);
      console.log('ContentService: Website:', website);
      
      // Use Perplexity API for blog generation (Anthropic has CORS issues)
      console.log('ContentService: Calling Perplexity API for blog...');
      const blog = await perplexityService.generateBlog(keyword, research, website);
      console.log('ContentService: Blog received from Perplexity');
      
      // Save to Supabase
      console.log('ContentService: Saving blog to Supabase...');
      await this.saveContent(projectId, 'blog', blog);
      console.log('ContentService: Successfully saved blog to Supabase');
      
      return blog;
    } catch (error: any) {
      console.error('ContentService: Blog generation failed:', error);
      console.error('ContentService: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        isCORSError: error.message.includes('CORS') || error.message.includes('Network Error')
      });
      
      // If it's a CORS/Network error, provide helpful message
      if (error.message.includes('CORS') || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to AI service due to browser security restrictions. A backend proxy is needed for this feature.');
      }
      
      throw new Error(error.message || 'Failed to generate blog');
    }
  }

  async generatePodcastScript(
    projectId: string, 
    keyword: string, 
    research: ResearchContent, 
    blog: BlogContent
  ): Promise<PodcastContent> {
    try {
      console.log('ContentService: Starting podcast script generation for:', keyword);
      console.log('ContentService: Project ID:', projectId);
      console.log('ContentService: Has research:', !!research);
      console.log('ContentService: Has blog:', !!blog);
      
      // Try Anthropic API first
      console.log('ContentService: Attempting Anthropic API for podcast...');
      try {
        const podcast = await anthropicService.generatePodcastScript(keyword, research, blog);
        console.log('ContentService: Podcast script received from Anthropic');
        
        // Save to Supabase
        console.log('ContentService: Saving podcast to Supabase...');
        await this.saveContent(projectId, 'podcast_script', podcast);
        console.log('ContentService: Successfully saved podcast to Supabase');
        
        return podcast;
      } catch (anthropicError: any) {
        console.warn('ContentService: Anthropic failed, trying Perplexity fallback...');
        console.warn('ContentService: Anthropic error:', anthropicError.message);
        
        // If Anthropic fails (likely CORS), use Perplexity as fallback
        console.log('ContentService: Calling Perplexity API for podcast...');
        const podcast = await perplexityService.generatePodcastScript(keyword, research, blog);
        console.log('ContentService: Podcast script received from Perplexity');
        
        // Save to Supabase
        console.log('ContentService: Saving podcast to Supabase...');
        await this.saveContent(projectId, 'podcast_script', podcast);
        console.log('ContentService: Successfully saved podcast to Supabase');
        
        return podcast;
      }
    } catch (error: any) {
      console.error('ContentService: Podcast generation failed:', error);
      console.error('ContentService: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        isCORSError: error.message.includes('CORS') || error.message.includes('Network Error')
      });
      
      
      throw new Error(error.message || 'Failed to generate podcast script');
    }
  }

  async generateAudio(
    projectId: string,
    keyword: string,
    podcastScript: PodcastContent
  ): Promise<AudioContent> {
    try {
      console.log('ContentService: Starting audio generation for:', keyword);
      console.log('ContentService: Project ID:', projectId);
      console.log('ContentService: Has podcast script:', !!podcastScript);
      console.log('ContentService: Script length:', podcastScript.script?.length || 0);
      
      // Use Gemini API for audio generation
      console.log('ContentService: Calling Gemini API for audio...');
      const audio = await geminiService.generateAudio(podcastScript);
      console.log('ContentService: Audio content received from Gemini');
      
      // Save to Supabase
      console.log('ContentService: Saving audio to Supabase...');
      await this.saveContent(projectId, 'audio', audio);
      console.log('ContentService: Successfully saved audio to Supabase');
      
      return audio;
    } catch (error: any) {
      console.error('ContentService: Audio generation failed:', error);
      console.error('ContentService: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        isCORSError: error.message.includes('CORS') || error.message.includes('Network Error')
      });
      
      throw new Error(error.message || 'Failed to generate audio');
    }
  }

  private async saveContent(
    projectId: string,
    stageType: string,
    content: any
  ): Promise<void> {
    console.log('ContentService: Saving content to database...');
    console.log('ContentService: Project ID:', projectId);
    console.log('ContentService: Stage Type:', stageType);
    console.log('ContentService: Content keys:', Object.keys(content || {}));
    
    try {
      // Check if this is a project_contents ID or old projects ID
      // First try to get the content record from project_contents
      const { data: existingContent, error: fetchError } = await supabase
        .from('project_contents')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('ContentService: Error fetching existing content:', fetchError);
        // Fallback to old content_stages table if project_contents doesn't work
        await this.saveToOldStructure(projectId, stageType, content);
        return;
      }

      if (existingContent) {
        // New structure - update project_contents table
        console.log('ContentService: Updating project_contents table...');
        const updatedStageData = {
          ...existingContent.stage_data,
          [stageType]: content
        };

        const { error: updateError } = await supabase
          .from('project_contents')
          .update({
            stage: stageType,
            stage_data: updatedStageData,
            last_saved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);

        if (updateError) {
          console.error('ContentService: Database update error:', updateError);
          throw updateError;
        }

        console.log('ContentService: Content saved successfully to project_contents');
      } else {
        // Fallback to old structure
        await this.saveToOldStructure(projectId, stageType, content);
      }
    } catch (error) {
      console.error('ContentService: Save content error:', error);
      throw error;
    }
  }

  private async saveToOldStructure(
    projectId: string,
    stageType: string,
    content: any
  ): Promise<void> {
    console.log('ContentService: Using old structure fallback...');
    
    try {
      // Mark previous versions as not current
      const { error: updateError } = await supabase
        .from('content_stages')
        .update({ is_current: false })
        .eq('project_id', projectId)
        .eq('stage_type', stageType);

      if (updateError) {
        console.warn('ContentService: Error updating old content:', updateError);
      }

      // Insert new version
      const { data, error } = await supabase
        .from('content_stages')
        .insert({
          project_id: projectId,
          stage_type: stageType,
          content,
          is_current: true,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('ContentService: Database insert error:', error);
        throw error;
      }
      
      console.log('ContentService: Content saved successfully to content_stages');
    } catch (error) {
      console.error('ContentService: Old structure save error:', error);
      throw error;
    }
  }
}

export const contentService = new ContentService();