// services/ai/perplexity.service.ts
import axios from 'axios';
import { ResearchContent } from '../../types/project.types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Helper function to get API key dynamically
const getPerplexityApiKey = () => {
  return process.env.REACT_APP_PERPLEXITY_API_KEY;
};

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export class PerplexityService {
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(messages: any[], retryCount: number = 0): Promise<string> {
    console.log('Making Perplexity API request...');
    const apiKey = getPerplexityApiKey();
    console.log('API Key exists:', !!apiKey);
    console.log('API Key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    console.log('Messages length:', messages.length);
    
    if (!apiKey) {
      console.error('Environment variables:', {
        REACT_APP_PERPLEXITY_API_KEY: process.env.REACT_APP_PERPLEXITY_API_KEY,
        allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
      });
      throw new Error('Perplexity API key is not configured. Please check your .env file.');
    }
    
    try {
      const requestBody = {
        model: 'sonar-pro',
        messages,
        temperature: 0.2,
        max_tokens: 4000,
      };
      
      console.log('Request body prepared, making API call...');
      
      const response = await axios.post<PerplexityResponse>(
        PERPLEXITY_API_URL,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout
        }
      );

      console.log('API response received, status:', response.status);
      console.log('Response data structure:', Object.keys(response.data));
      
      if (!response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid API response structure');
      }

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Perplexity API error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isTimeout: error.code === 'ECONNABORTED',
        retryCount
      });
      
      // Retry logic for specific errors
      const maxRetries = 2;
      const shouldRetry = retryCount < maxRetries && (
        error.response?.status === 429 || // Rate limit
        error.response?.status === 503 || // Service unavailable
        error.response?.status === 504 || // Gateway timeout
        error.code === 'ECONNABORTED' ||  // Request timeout
        error.code === 'ENOTFOUND' ||      // DNS issues
        error.code === 'ECONNREFUSED'      // Connection refused
      );
      
      if (shouldRetry) {
        const delayMs = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s
        console.log(`Retrying in ${delayMs}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await this.delay(delayMs);
        return this.makeRequest(messages, retryCount + 1);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out - please try again');
      }
      
      throw new Error(error.response?.data?.error?.message || error.message || 'Failed to get research data');
    }
  }

  async generateResearch(keyword: string): Promise<ResearchContent> {
    console.time('Perplexity Research Time');
    console.log('Starting Perplexity research for:', keyword);
    
    const systemPrompt = `You are an expert SEO research analyst focused on E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness). 
    Your research will be used to create content that ranks well on Google by demonstrating real expertise and authority.
    Always provide specific, verifiable data with sources. Focus on unique insights that demonstrate deep understanding.`;

    const userPrompt = `Research "${keyword}" and provide comprehensive information in JSON format.

Include:
1. Definition and overview
2. Current trends and statistics
3. Common questions people ask
4. Related topics and applications
5. Key challenges and opportunities

Format as JSON:
{
  "definition": "Clear definition of ${keyword}",
  "overview": "Comprehensive overview",
  "currentTrends": ["trend1", "trend2", "trend3"],
  "statistics": ["stat1 with source", "stat2 with source"],
  "commonQuestions": [
    {"question": "What is ${keyword}?", "answer": "detailed answer"},
    {"question": "How does ${keyword} work?", "answer": "detailed answer"}
  ],
  "relatedTopics": ["topic1", "topic2", "topic3"],
  "applications": ["application1", "application2"],
  "challenges": ["challenge1", "challenge2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "futureOutlook": "Analysis of future trends"
}

Return only valid JSON.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages);
    console.timeEnd('Perplexity Research Time');
    console.log('Perplexity response received, length:', response.length);
    
    try {
      const researchData = JSON.parse(response);
      console.log('Research data parsed successfully');
      return researchData as ResearchContent;
    } catch (parseError) {
      console.timeEnd('Perplexity Research Time');
      console.error('Failed to parse research response:', parseError);
      console.log('Raw response:', response.substring(0, 500) + '...');
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ResearchContent;
      }
      throw new Error('Failed to parse research data');
    }
  }

  async generatePodcastScript(keyword: string, research: any, blog: any): Promise<any> {
    console.log('Generating podcast script for:', keyword);
    console.log('Blog content length:', blog?.content?.length || 0);
    console.log('Research keys:', research ? Object.keys(research) : 'No research');

    const systemPrompt = `You are generating a podcast episode featuring two hosts: Alex and Jordan. They are knowledgeable, engaging, and bring different personalities to the show. Alex is more analytical and structured, while Jordan is more casual and prone to storytelling or going off on rants.

You specialize in creating natural, unscripted-feeling conversations that mimic real podcast dynamics. Your scripts avoid robotic delivery and include authentic banter, reactions, and personality-driven moments.`;

    // Extract key points from the blog content
    const blogSummary = blog?.content ? blog.content.substring(0, 2000) : '';
    
    // Build research insights
    let researchInsights = '';
    if (research) {
      if (research.definition) researchInsights += `\nKey Definition: ${research.definition}`;
      if (research.currentTrends) researchInsights += `\nTrends: ${Array.isArray(research.currentTrends) ? research.currentTrends.join(', ') : research.currentTrends}`;
      if (research.statistics && Array.isArray(research.statistics)) {
        researchInsights += `\nStatistics: ${research.statistics.slice(0, 3).map((stat: any) => 
          typeof stat === 'object' ? `${stat.metric}: ${stat.value}` : stat
        ).join(', ')}`;
      }
      if (research.applications) researchInsights += `\nApplications: ${Array.isArray(research.applications) ? research.applications.join(', ') : research.applications}`;
    }

    const userPrompt = `Create an engaging podcast script about "${keyword}" based on the provided blog content and research.

BLOG CONTENT SUMMARY:
${blogSummary}

RESEARCH INSIGHTS:${researchInsights}

The topic of the podcast is: "${keyword}". This episode is based on a blog post that covers this topic in-depth, but the goal is to make the discussion feel unscripted, natural, and authentic.

TONE & STYLE GUIDELINES:
- Mimic real podcast dynamics
- Do NOT simply alternate back and forth after every paragraph
- Sometimes let one host talk for a longer stretch if it fits their character (especially Jordan for rants or stories)
- Include casual banter, inside jokes, laughter, or clarifying questions
- Occasionally include light disagreement or friendly teasing to sound natural
- Avoid robotic delivery or stiff transitions

STRUCTURE OF THE EPISODE:

1. **Introduction (1-2 minutes)**
   - Hosts greet each other
   - Brief summary of what the episode is about
   - Light banter to establish rapport

2. **Main Discussion**
   - Cover key points of the topic (based on the blog)
   - Add commentary, real-world examples, or personal anecdotes
   - Let Jordan occasionally go on a humorous or passionate rant
   - Alex can jump in with clarification, stats, or counterpoints

3. **Segment Transitions**
   - Use natural transitions like: "Before we move on...", "This reminds me of...", "Let's talk about something related..."

4. **Closing Thoughts**
   - Final reflections from each host
   - Quick summary or takeaway
   - Mention of what's coming next or CTA (optional)

ADDITIONAL BEHAVIORS TO SIMULATE:
- Pauses or filler phrases like "you know," "honestly," "that's wild"
- Reactions like "wow," "no way," "I didn't know that!"
- Quick recaps when going off-topic before returning to the main point
- A few ad-libbed examples that aren't in the blog but feel relevant

FORMATTING:
Output as a script with speaker names, like:

Alex: Hey everyone, welcome back to the pod. Today we're diving into something pretty fascinating...

Jordan: Yeah, and I've got *thoughts* on this one—like, big thoughts.

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Natural podcast episode title with keyword",
  "script": "Full two-host podcast script with Alex and Jordan as speakers, natural conversations, banter, and authentic dynamics",
  "duration": 18,
  "outline": [
    "Introduction and banter",
    "Topic overview with host reactions", 
    "Deep dive with Jordan rants",
    "Alex analysis and counterpoints", 
    "Real-world examples and stories",
    "Closing thoughts and takeaways"
  ]
}

Create a script that feels like two real friends having an authentic conversation about ${keyword}, not a formal presentation.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      console.log('Raw podcast response length:', response.length);
      console.log('Response preview:', response.substring(0, 300));
      
      // Try to parse the response
      let jsonString = response.trim();
      
      // If the response has markdown code blocks, extract the JSON from them
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      }
      
      // Extract fields using regex for more robust parsing
      const extractField = (fieldName: string, isLongText: boolean = false): string => {
        const pattern = isLongText 
          ? new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)(?=",\\s*"|"\\s*}|$)`, 'i')
          : new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = jsonString.match(pattern);
        if (match && match[1]) {
          let value = match[1];
          // Clean up the extracted value
          value = value.replace(/\\"/g, '"'); // Unescape quotes
          value = value.replace(/\\\\/g, '\\'); // Unescape backslashes
          if (!isLongText) {
            value = value.replace(/[\n\r\t]/g, ' ').trim();
          }
          return value;
        }
        return '';
      };
      
      const extractArray = (fieldName: string): string[] => {
        const pattern = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]*)]`, 'i');
        const match = jsonString.match(pattern);
        if (match && match[1]) {
          return match[1]
            .split(',')
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(s => s);
        }
        return [];
      };
      
      const extractNumber = (fieldName: string): number => {
        const pattern = new RegExp(`"${fieldName}"\\s*:\\s*(\\d+)`, 'i');
        const match = jsonString.match(pattern);
        return match && match[1] ? parseInt(match[1]) : 18;
      };
      
      // Manually construct the podcast data object
      const podcastData = {
        title: extractField('title') || `${keyword} Podcast Episode`,
        script: extractField('script', true) || `# ${keyword} Podcast Script\n\nWelcome to today's episode about ${keyword}...`,
        duration: extractNumber('duration') || 18,
        outline: extractArray('outline').length > 0 ? extractArray('outline') : [
          "Introduction and hook",
          "Main topic overview", 
          "Key insights",
          "Conclusion and takeaways"
        ]
      };
      
      // Clean the script field
      podcastData.script = podcastData.script
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      console.log('Successfully constructed podcast data');
      return podcastData;
    } catch (parseError: any) {
      console.error('Failed to parse podcast response:', parseError);
      
      // Fallback: create basic structure from response
      console.log('Using fallback podcast structure');
      return {
        title: `${keyword} Podcast Episode`,
        script: response,
        duration: 18,
        outline: ["Introduction", "Main discussion", "Key insights", "Conclusion"]
      };
    }
  }

  async generateBlog(keyword: string, research: any): Promise<any> {
    console.log('Generating SEO-optimized blog for:', keyword);
    console.log('Research data:', research);

    const systemPrompt = `You are an expert SEO content writer who creates highly engaging, authoritative content that ranks well on Google. 
    You follow E-E-A-T principles and write content that demonstrates real expertise, experience, authority, and trustworthiness.
    Your content is comprehensive, well-structured, and naturally incorporates keywords for optimal SEO performance.
    
    IMPORTANT: Write at an 8th-grade reading level using:
    - Short sentences (15-20 words max)
    - Simple, common words
    - Active voice
    - Clear, direct language
    - One idea per sentence
    - Avoid jargon unless necessary (and explain it when used)`;

    // Build research summary from available data
    let researchSummary = '';
    if (research) {
      if (research.definition) researchSummary += `\nDefinition: ${research.definition}`;
      if (research.overview) researchSummary += `\nOverview: ${research.overview}`;
      if (research.currentTrends) researchSummary += `\nTrends: ${Array.isArray(research.currentTrends) ? research.currentTrends.join(', ') : research.currentTrends}`;
      if (research.statistics) researchSummary += `\nStatistics: ${JSON.stringify(research.statistics).slice(0, 500)}`;
      if (research.commonQuestions) researchSummary += `\nCommon Questions: ${JSON.stringify(research.commonQuestions).slice(0, 500)}`;
      if (research.applications) researchSummary += `\nApplications: ${Array.isArray(research.applications) ? research.applications.join(', ') : research.applications}`;
    }

    if (!researchSummary) {
      researchSummary = JSON.stringify(research, null, 2).slice(0, 2000);
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

6. READABILITY REQUIREMENTS (8th Grade Level):
   - Use short sentences (15-20 words maximum)
   - Choose simple, everyday words over complex ones
   - Write in active voice ("We tested" not "It was tested")
   - Break complex ideas into simple steps
   - Use transition words (First, Next, However, Therefore)
   - Define technical terms in simple language
   - Use concrete examples to explain abstract concepts

7. Demonstrate E-E-A-T:
   - Show expertise through accurate information
   - Include statistics and data points from the research
   - Reference authoritative sources
   - Provide practical, actionable advice

8. Engagement:
   - Use short paragraphs (2-3 sentences)
   - Include bullet points and lists
   - Add examples and analogies
   - Keep the tone conversational but professional
   - Ask rhetorical questions to engage readers
   - Use "you" to speak directly to the reader

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "SEO-optimized title with keyword",
  "metaDescription": "Compelling meta description 155-160 characters with keyword",
  "content": "Full blog post in Markdown format with ## for H2 and ### for H3 headings",
  "wordCount": 1800,
  "readingTime": 8,
  "targetKeywords": ["main keyword", "related keyword 1", "related keyword 2"],
  "readabilityScore": "Grade 8"
}

Remember: Write clearly and simply. If a 13-year-old can understand it, you're doing it right.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      console.log('Raw response length:', response.length);
      console.log('Response preview:', response.substring(0, 500));
      console.log('Character at position 509:', response.charCodeAt(509));
      console.log('Context around position 509:', response.substring(500, 520));
      
      // Try a more aggressive approach - parse the response structure manually
      let jsonString = response.trim();
      
      // If the response has markdown code blocks, extract the JSON from them
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      }
      
      // Extract fields using regex instead of trying to parse potentially broken JSON
      const extractField = (fieldName: string, isLongText: boolean = false): string => {
        const pattern = isLongText 
          ? new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)(?=",\\s*"|"\\s*}|$)`, 'i')
          : new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = jsonString.match(pattern);
        if (match && match[1]) {
          let value = match[1];
          // Clean up the extracted value
          value = value.replace(/\\"/g, '"'); // Unescape quotes
          value = value.replace(/\\\\/g, '\\'); // Unescape backslashes
          if (!isLongText) {
            value = value.replace(/[\n\r\t]/g, ' ').trim();
          }
          return value;
        }
        return '';
      };
      
      const extractArray = (fieldName: string): string[] => {
        const pattern = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]*)]`, 'i');
        const match = jsonString.match(pattern);
        if (match && match[1]) {
          return match[1]
            .split(',')
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(s => s);
        }
        return [];
      };
      
      const extractNumber = (fieldName: string): number => {
        const pattern = new RegExp(`"${fieldName}"\\s*:\\s*(\\d+)`, 'i');
        const match = jsonString.match(pattern);
        return match && match[1] ? parseInt(match[1]) : 0;
      };
      
      // Manually construct the blog data object
      const blogData = {
        title: extractField('title') || `Expert Guide to ${keyword}`,
        metaDescription: extractField('metaDescription') || `Comprehensive guide about ${keyword}. Learn everything you need to know.`,
        content: extractField('content', true) || `# ${keyword}\n\nContent generation in progress...`,
        wordCount: extractNumber('wordCount') || 1500,
        readingTime: extractNumber('readingTime') || 8,
        targetKeywords: extractArray('targetKeywords').length > 0 ? extractArray('targetKeywords') : [keyword],
        readabilityScore: extractField('readabilityScore') || 'Grade 8'
      };
      
      // Clean the content field to ensure it's valid markdown
      blogData.content = blogData.content
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
        .trim();
      
      // Ensure content has proper markdown structure
      if (!blogData.content.includes('#')) {
        blogData.content = `# ${blogData.title}\n\n${blogData.content}`;
      }
      
      console.log('Successfully constructed blog data');
      return blogData;
    } catch (parseError: any) {
      console.error('Failed to parse blog response:', parseError);
      console.error('Parse error details:', {
        message: parseError.message,
        position: parseError.message.match(/position (\d+)/)?.[1],
        response: response.substring(0, 600) + '...'
      });
      
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let cleanedExtract = jsonMatch[0];
          
          // Apply the same cleaning logic as above
          cleanedExtract = cleanedExtract.replace(/"content"\s*:\s*"([\s\S]*?)"\s*(?=,\s*"|\s*\})/g, (match, content) => {
            let fixed = content;
            fixed = fixed.replace(/\\/g, '\\\\');
            fixed = fixed.replace(/([^\\])"/g, '$1\\"');
            fixed = fixed.replace(/^"/g, '\\"');
            fixed = fixed.replace(/([^\\])\n/g, '$1\\n');
            fixed = fixed.replace(/^\n/g, '\\n');
            fixed = fixed.replace(/([^\\])\r/g, '$1\\r');
            fixed = fixed.replace(/^\r/g, '\\r');
            fixed = fixed.replace(/([^\\])\t/g, '$1\\t');
            fixed = fixed.replace(/^\t/g, '\\t');
            return `"content": "${fixed}"`;
          });
          
          // Clean other fields
          cleanedExtract = cleanedExtract.replace(/"(title|metaDescription)"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/g, (match, field, content) => {
            const fixed = content.replace(/[\n\r\t]/g, ' ').trim();
            return `"${field}": "${fixed}"`;
          });
          
          // Remove trailing commas and control characters
          cleanedExtract = cleanedExtract.replace(/,\s*([}\]])/g, '$1');
          cleanedExtract = cleanedExtract.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
          
          const extracted = JSON.parse(cleanedExtract);
          if (!extracted.wordCount) extracted.wordCount = 1500;
          if (!extracted.readingTime) extracted.readingTime = 8;
          if (!extracted.targetKeywords) extracted.targetKeywords = [keyword];
          if (!extracted.readabilityScore) extracted.readabilityScore = "Grade 8";
          return extracted;
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
        }
      }
      throw new Error('Failed to parse blog data: ' + parseError.message);
    }
  }
}

export const perplexityService = new PerplexityService();