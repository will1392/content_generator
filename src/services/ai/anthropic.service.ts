// services/ai/anthropic.service.ts
import axios from 'axios';
import { ResearchContent, BlogContent, PodcastContent, SocialContent } from '../../types/project.types';

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export class AnthropicService {
  private async makeRequest(messages: any[], maxTokens: number = 4096): Promise<string> {
    console.log('=== ANTHROPIC API REQUEST ===');
    console.log('API Key exists:', !!ANTHROPIC_API_KEY);
    console.log('API Key length:', ANTHROPIC_API_KEY?.length || 0);
    console.log('API Key preview:', ANTHROPIC_API_KEY?.substring(0, 10) + '...' || 'None');
    console.log('API URL:', ANTHROPIC_API_URL);
    console.log('Messages length:', messages.length);
    console.log('Max tokens:', maxTokens);
    console.log('Messages preview:', JSON.stringify(messages.map(m => ({ 
      role: m.role, 
      contentLength: m.content?.length || 0 
    })), null, 2));
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key is not configured');
    }
    
    if (!ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
      throw new Error('Invalid Anthropic API key format');
    }
    
    try {
      console.time('Anthropic API Call');
      
      const requestBody = {
        model: 'claude-3-5-sonnet-20241022', // Use more recent model
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      };
      
      console.log('Full request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await axios.post(
        ANTHROPIC_API_URL,
        requestBody,
        {
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout
        }
      );

      console.timeEnd('Anthropic API Call');
      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);
      console.log('API response data keys:', Object.keys(response.data || {}));
      console.log('Full API response data:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        console.error('Response data is null/undefined');
        throw new Error('No data in API response');
      }
      
      if (!response.data.content) {
        console.error('Missing content field in response');
        console.log('Available fields:', Object.keys(response.data));
        throw new Error('No content field in API response');
      }
      
      if (!Array.isArray(response.data.content)) {
        console.error('Content is not an array:', typeof response.data.content);
        throw new Error('Content field is not an array');
      }
      
      if (response.data.content.length === 0) {
        console.error('Content array is empty');
        throw new Error('Content field is empty');
      }
      
      if (!response.data.content[0]) {
        console.error('First content item is missing');
        throw new Error('First content item is missing');
      }
      
      console.log('First content item:', JSON.stringify(response.data.content[0], null, 2));
      
      if (!response.data.content[0].text) {
        console.error('Text field missing from first content item');
        console.log('Available fields in content[0]:', Object.keys(response.data.content[0]));
        throw new Error('Text field is missing from content');
      }
      
      const textContent = response.data.content[0].text;
      console.log('Successfully extracted text, length:', textContent.length);
      console.log('Text preview:', textContent.substring(0, 200) + '...');
      return textContent;
    } catch (error: any) {
      console.error('=== ANTHROPIC API ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.response?.status);
      console.error('Error status text:', error.response?.statusText);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Is network error:', error.message.includes('Network Error'));
      console.error('Is CORS error:', error.message.includes('CORS'));
      console.error('Is timeout:', error.code === 'ECONNABORTED');
      console.error('Full error stack:', error.stack);
      console.error('===========================');
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out - please try again');
      }
      
      if (error.message.includes('Network Error') || error.message.includes('CORS')) {
        throw new Error('Cannot connect to Anthropic API due to browser security restrictions. API calls from browsers require a backend proxy.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key configuration.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(`Bad request: ${error.response?.data?.error?.message || 'Invalid request format'}`);
      }
      
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate content';
      throw new Error(errorMessage);
    }
  }

  async generateBlog(keyword: string, research: any): Promise<BlogContent> {
    console.log('Generating SEO-optimized blog for:', keyword);
    console.log('Research data type:', typeof research);
    console.log('Research keys:', research ? Object.keys(research) : 'No research');

    const systemPrompt = `You are an expert SEO content writer who creates highly engaging, authoritative content that ranks well on Google. 
    You follow E-E-A-T principles and write content that demonstrates real expertise, experience, authority, and trustworthiness.
    Your content is comprehensive, well-structured, and naturally incorporates keywords for optimal SEO performance.`;

    // Build the research summary from whatever data we have
    let researchSummary = '';
    
    // Try to extract whatever data is available
    if (research) {
      if (research.definition) {
        researchSummary += `\nDefinition: ${research.definition}`;
      }
      if (research.overview) {
        researchSummary += `\nOverview: ${research.overview}`;
      }
      if (research.currentTrends && Array.isArray(research.currentTrends)) {
        researchSummary += `\nCurrent Trends: ${research.currentTrends.join(', ')}`;
      }
      if (research.statistics && Array.isArray(research.statistics)) {
        researchSummary += `\nKey Statistics: ${JSON.stringify(research.statistics.slice(0, 5))}`;
      }
      if (research.commonQuestions && Array.isArray(research.commonQuestions)) {
        researchSummary += `\nCommon Questions: ${research.commonQuestions.map((q: any) => 
          typeof q === 'string' ? q : q.question
        ).join(', ')}`;
      }
      if (research.applications && Array.isArray(research.applications)) {
        researchSummary += `\nApplications: ${research.applications.join(', ')}`;
      }
      if (research.challenges && Array.isArray(research.challenges)) {
        researchSummary += `\nChallenges: ${research.challenges.join(', ')}`;
      }
      if (research.opportunities && Array.isArray(research.opportunities)) {
        researchSummary += `\nOpportunities: ${research.opportunities.join(', ')}`;
      }
    }

    // If we couldn't extract structured data, just stringify what we have
    if (!researchSummary) {
      researchSummary = JSON.stringify(research, null, 2).slice(0, 3000);
    }

    const userPrompt = `Create a comprehensive, SEO-optimized blog post about "${keyword}" using the provided research data.

RESEARCH DATA:${researchSummary}

BLOG POST REQUIREMENTS:

1. Create a blog post that is 1,500-2,000 words long
2. Include an SEO-optimized title that naturally includes "${keyword}"
3. Write a compelling meta description (155-160 characters)
4. Structure with:
   - Engaging introduction with a hook
   - 5-7 main sections with H2 headings
   - Subsections with H3 headings where appropriate
   - Conclusion with clear call-to-action

5. SEO Optimization:
   - Use "${keyword}" naturally 5-7 times throughout
   - Include semantic variations and related terms
   - Target potential featured snippets with clear, concise answers
   - Write in an easy-to-read style (8th-grade level)

6. Demonstrate E-E-A-T:
   - Show expertise through accurate information
   - Include statistics and data points from the research
   - Reference authoritative sources
   - Provide practical, actionable advice

7. Engagement:
   - Use short paragraphs (2-3 sentences)
   - Include bullet points and lists
   - Add examples and analogies
   - Keep the tone conversational but professional

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "SEO-optimized title with keyword",
  "metaDescription": "Compelling meta description 155-160 characters with keyword",
  "content": "Full blog post in Markdown format with ## for H2 and ### for H3 headings",
  "wordCount": 1800,
  "readingTime": 8,
  "targetKeywords": ["main keyword", "related keyword 1", "related keyword 2"]
}

Write an exceptional blog post that would rank well on Google and provide genuine value to readers.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.makeRequest(messages);
      
      // Try to parse the response
      try {
        const blogData = JSON.parse(response);
        
        // Ensure we have the required fields
        if (!blogData.wordCount) {
          blogData.wordCount = blogData.content ? blogData.content.split(/\s+/).length : 1500;
        }
        if (!blogData.readingTime) {
          blogData.readingTime = Math.ceil(blogData.wordCount / 200);
        }
        
        return blogData as BlogContent;
      } catch (parseError) {
        console.error('Failed to parse JSON response, attempting to extract...');
        
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[0]);
          if (!extracted.wordCount) {
            extracted.wordCount = extracted.content ? extracted.content.split(/\s+/).length : 1500;
          }
          if (!extracted.readingTime) {
            extracted.readingTime = Math.ceil(extracted.wordCount / 200);
          }
          return extracted as BlogContent;
        }
        
        // If all else fails, create a basic structure
        throw new Error('Could not parse blog response');
      }
    } catch (error: any) {
      console.error('Blog generation error:', error);
      throw error;
    }
  }

  async generatePodcastScript(
    keyword: string, 
    research: ResearchContent, 
    blog: BlogContent
  ): Promise<PodcastContent> {
    console.log('Generating podcast script for:', keyword);
    console.log('Blog content length:', blog.content?.length || 0);
    console.log('Research keys:', research ? Object.keys(research) : 'No research');

    const systemPrompt = `You are an expert podcast script writer who creates engaging, conversational, and informative podcast episodes. 
    You specialize in transforming written content into compelling audio experiences that keep listeners engaged throughout.
    Your scripts are well-structured, include natural transitions, and maintain an conversational yet professional tone.`;

    // Extract key points from the blog content
    const blogSummary = blog.content ? blog.content.substring(0, 2000) : '';
    
    // Build research insights
    let researchInsights = '';
    if (research) {
      if (research.definition) researchInsights += `\nKey Definition: ${research.definition}`;
      if (research.currentTrends) researchInsights += `\nTrends: ${Array.isArray(research.currentTrends) ? research.currentTrends.join(', ') : research.currentTrends}`;
      if (research.statistics && Array.isArray(research.statistics)) {
        researchInsights += `\nStatistics: ${research.statistics.slice(0, 3).map(stat => 
          typeof stat === 'object' ? `${stat.metric}: ${stat.value}` : stat
        ).join(', ')}`;
      }
      if (research.applications) researchInsights += `\nApplications: ${Array.isArray(research.applications) ? research.applications.join(', ') : research.applications}`;
    }

    const userPrompt = `Create an engaging podcast script about "${keyword}" based on the provided blog content and research.

BLOG CONTENT SUMMARY:
${blogSummary}

RESEARCH INSIGHTS:${researchInsights}

PODCAST SCRIPT REQUIREMENTS:

1. **Format**: Create a solo podcast episode (single host format)
2. **Duration**: 15-20 minutes (approximately 2,500-3,500 words)
3. **Structure**:
   - Engaging hook/intro (30-60 seconds)
   - Welcome and episode overview
   - 4-6 main segments with natural transitions
   - Key takeaways/summary
   - Call-to-action and outro

4. **Tone & Style**:
   - Conversational and approachable
   - Professional but not stuffy
   - Use "you" to connect with listeners
   - Include natural pauses and emphasis cues
   - Add occasional rhetorical questions

5. **Content Guidelines**:
   - Transform blog content into spoken format
   - Include specific examples and stories
   - Add transitions like "Now here's what's interesting..." or "But wait, there's more..."
   - Include listener engagement phrases
   - Add emphasis cues like [PAUSE], [EMPHASIS], [SLOW DOWN]

6. **Engagement Elements**:
   - Ask rhetorical questions to keep listeners thinking
   - Include "Did you know?" moments
   - Reference current trends and relatable examples
   - Add preview teasers: "We'll cover that in just a moment"

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Engaging podcast episode title with keyword",
  "script": "Full podcast script with speaker cues, pauses, and emphasis markers in markdown format",
  "duration": 18,
  "outline": [
    "Introduction and hook",
    "Main topic overview", 
    "Key point 1",
    "Key point 2", 
    "Key point 3",
    "Takeaways and conclusion"
  ]
}

Create a script that would keep listeners engaged from start to finish while delivering valuable insights about ${keyword}.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.makeRequest(messages, 4096);
      
      console.log('=== PODCAST RESPONSE DEBUG ===');
      console.log('Raw response length:', response?.length || 0);
      console.log('Response preview:', response?.substring(0, 300) || 'No response');
      console.log('==============================');
      
      if (!response || response.length === 0) {
        throw new Error('Empty response from Anthropic API');
      }
      
      // Try to parse the response
      try {
        const podcastData = JSON.parse(response);
        
        console.log('Parsed podcast data keys:', Object.keys(podcastData || {}));
        
        // Ensure we have required fields
        if (!podcastData.duration) {
          podcastData.duration = 18; // Default 18 minutes
        }
        if (!podcastData.outline || !Array.isArray(podcastData.outline)) {
          podcastData.outline = [
            "Introduction and overview",
            "Main content discussion", 
            "Key insights and examples",
            "Conclusion and takeaways"
          ];
        }
        if (!podcastData.title) {
          podcastData.title = `${keyword} Podcast Episode`;
        }
        if (!podcastData.script) {
          podcastData.script = response; // Use raw response as fallback
        }
        
        console.log('Final podcast data structure:', {
          hasTitle: !!podcastData.title,
          hasScript: !!podcastData.script,
          hasDuration: !!podcastData.duration,
          hasOutline: !!podcastData.outline
        });
        
        return podcastData as PodcastContent;
      } catch (parseError) {
        console.error('Failed to parse podcast JSON response:', parseError);
        console.log('Attempting to extract JSON from response...');
        
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extracted = JSON.parse(jsonMatch[0]);
            if (!extracted.duration) extracted.duration = 18;
            if (!extracted.outline) extracted.outline = ["Introduction", "Main content", "Conclusion"];
            if (!extracted.title) extracted.title = `${keyword} Podcast Episode`;
            if (!extracted.script) extracted.script = response;
            
            console.log('Successfully extracted and fixed podcast data');
            return extracted as PodcastContent;
          } catch (extractError) {
            console.error('Failed to parse extracted JSON:', extractError);
          }
        }
        
        // Fallback: create basic structure from response
        console.log('Using fallback podcast structure');
        return {
          title: `${keyword} Podcast Episode`,
          script: response,
          duration: 18,
          outline: ["Introduction", "Main discussion", "Key insights", "Conclusion"]
        } as PodcastContent;
      }
    } catch (error: any) {
      console.error('=== PODCAST GENERATION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('================================');
      throw error;
    }
  }

  async generateSocialCaptions(
    keyword: string,
    blog: BlogContent,
    images: any
  ): Promise<SocialContent> {
    // Implementation coming next
    throw new Error('Not implemented yet');
  }
}

export const anthropicService = new AnthropicService();