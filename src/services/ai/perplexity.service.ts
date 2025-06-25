// services/ai/perplexity.service.ts
import axios from 'axios';
import { ResearchContent, TopicalMapKeyword } from '../../types/project.types';

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

  private async makeRequest(messages: any[], retryCount: number = 0, useDeepResearch: boolean = false): Promise<string> {
    console.log('Making Perplexity API request...');
    const apiKey = getPerplexityApiKey();
    console.log('API Key exists:', !!apiKey);
    console.log('API Key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    console.log('Messages length:', messages.length);
    console.log('Using deep research model:', useDeepResearch);
    
    if (!apiKey) {
      console.error('Environment variables:', {
        REACT_APP_PERPLEXITY_API_KEY: process.env.REACT_APP_PERPLEXITY_API_KEY,
        allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
      });
      throw new Error('Perplexity API key is not configured. Please check your .env file.');
    }
    
    try {
      const requestBody = {
        model: useDeepResearch ? 'sonar-reasoning' : 'sonar-pro',
        messages,
        temperature: 0.2,
        max_tokens: useDeepResearch ? 8000 : 4000, // Deep research supports more tokens
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

  async generateResearch(keyword: string, website?: string): Promise<ResearchContent> {
    console.time('Perplexity Research Time');
    console.log('Starting Perplexity DEEP RESEARCH for:', keyword);
    console.log('Website for internal linking:', website);
    
    const systemPrompt = `You are an expert SEO research analyst focused on E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness). 
    Your research will be used to create content that ranks well on Google by demonstrating real expertise and authority.
    Always provide specific, verifiable data with sources. Focus on unique insights that demonstrate deep understanding.
    Conduct thorough, comprehensive research that goes beyond surface-level information.`;

    const websiteContext = website ? `

Additional context: If applicable, consider how this topic relates to the website ${website} for potential internal linking opportunities.` : '';
    
    const userPrompt = `Conduct DEEP RESEARCH on "${keyword}" and provide comprehensive, in-depth information in JSON format.${websiteContext}

Perform thorough research including:
1. Comprehensive definition and detailed overview
2. Current trends with specific data points and statistics
3. Common questions people ask with expert answers
4. Related topics and real-world applications
5. Key challenges, opportunities, and future outlook
6. Expert insights and industry perspectives
7. Case studies or examples where applicable

Go deep into the topic - don't just provide surface-level information. Include specific data, statistics, expert opinions, and unique insights that demonstrate true expertise.

Format your response as a COMPLETE JSON object with ALL of these fields:
{
  "searchIntent": {
    "primary": "informational",
    "userGoals": ["goal1", "goal2"],
    "relatedQueries": ["query1", "query2"],
    "questionsToAnswer": ["question1", "question2"]
  },
  "expertiseIndicators": {
    "technicalSpecs": ["spec1", "spec2"],
    "industryStandards": ["standard1", "standard2"],
    "terminology": [{"term": "term1", "definition": "def1"}],
    "misconceptions": [{"misconception": "myth1", "truth": "fact1"}]
  },
  "experienceEvidence": [
    {"type": "type1", "description": "desc1", "outcome": "outcome1", "source": "source1"}
  ],
  "authoritativeData": [
    {"metric": "metric1", "value": "value1", "source": "source1", "year": "2024"}
  ],
  "trustSignals": {
    "regulations": ["reg1", "reg2"],
    "bestPractices": ["practice1", "practice2"],
    "safetyConsiderations": ["safety1", "safety2"]
  },
  "competitiveLandscape": {
    "topRankingContent": ["content1", "content2"],
    "contentGaps": ["gap1", "gap2"],
    "uniqueAngles": ["angle1", "angle2"]
  },
  "semanticSEO": {
    "lsiKeywords": ["keyword1", "keyword2"],
    "entities": ["entity1", "entity2"],
    "topicClusters": ["cluster1", "cluster2"]
  },
  "featuredSnippetOpps": [
    {"question": "question1", "optimalAnswer": "answer1"}
  ],
  "contentDepthRequirements": {
    "mustCoverTopics": ["topic1", "topic2"],
    "uniqueInsights": ["insight1", "insight2"],
    "originalAngles": ["angle1", "angle2"]
  },
  "definition": "Comprehensive definition of ${keyword}",
  "overview": "In-depth overview with key concepts",
  "history": "Historical context if applicable",
  "currentTrends": ["detailed trend 1", "detailed trend 2", "detailed trend 3"],
  "statistics": [
    {"metric": "metric name", "value": "specific value", "source": "data source"}
  ],
  "expertInsights": ["expert insight 1", "expert insight 2"],
  "commonQuestions": [
    {"question": "What is ${keyword}?", "answer": "comprehensive expert answer"},
    {"question": "How does ${keyword} work?", "answer": "detailed technical answer"}
  ],
  "relatedTopics": ["topic1", "topic2", "topic3"],
  "applications": ["detailed application1", "detailed application2"],
  "futureOutlook": "Detailed analysis of future trends and predictions",
  "challenges": ["specific challenge1", "specific challenge2"],
  "opportunities": ["concrete opportunity1", "concrete opportunity2"]
}

IMPORTANT: Return ONLY valid JSON. Ensure statistics field contains objects with metric, value, and source properties.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages, 0, true); // Enable deep research mode
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

  async generateBlog(keyword: string, research: any, website?: string): Promise<any> {
    console.log('Generating SEO-optimized blog for:', keyword);
    console.log('Website for internal linking:', website);
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
    let externalSources: Array<{url: string, source: string, context: string}> = [];
    
    if (research) {
      if (research.definition) researchSummary += `\nDefinition: ${research.definition}`;
      if (research.overview) researchSummary += `\nOverview: ${research.overview}`;
      if (research.currentTrends) researchSummary += `\nTrends: ${Array.isArray(research.currentTrends) ? research.currentTrends.join(', ') : research.currentTrends}`;
      if (research.statistics) researchSummary += `\nStatistics: ${JSON.stringify(research.statistics).slice(0, 500)}`;
      if (research.commonQuestions) researchSummary += `\nCommon Questions: ${JSON.stringify(research.commonQuestions).slice(0, 500)}`;
      if (research.applications) researchSummary += `\nApplications: ${Array.isArray(research.applications) ? research.applications.join(', ') : research.applications}`;
      
      // Extract external links from research data
      if (research.authoritativeData && Array.isArray(research.authoritativeData)) {
        research.authoritativeData.forEach((item: any) => {
          if (item.url && item.source) {
            externalSources.push({
              url: item.url,
              source: item.source,
              context: `${item.metric}: ${item.value} (${item.year})`
            });
          }
        });
      }
      
      if (research.statistics && Array.isArray(research.statistics)) {
        research.statistics.forEach((stat: any) => {
          if (stat.source && stat.source.startsWith('http')) {
            externalSources.push({
              url: stat.source,
              source: stat.source,
              context: `${stat.metric}: ${stat.value}`
            });
          }
        });
      }
      
      if (research.experienceEvidence && Array.isArray(research.experienceEvidence)) {
        research.experienceEvidence.forEach((evidence: any) => {
          if (evidence.source && evidence.source.startsWith('http')) {
            externalSources.push({
              url: evidence.source,
              source: evidence.source,
              context: evidence.description
            });
          }
        });
      }
    }

    if (!researchSummary) {
      researchSummary = JSON.stringify(research, null, 2).slice(0, 2000);
    }

    const websiteInstructions = website ? `

9. Internal Linking Strategy:
   - When relevant, suggest internal links to ${website}
   - Include 3-5 potential internal link suggestions in the internalLinks field
   - Only suggest links that would genuinely add value to readers
   - Format: {"anchor": "suggested anchor text", "suggestion": "description of what this link should point to"}
   - Example: {"anchor": "learn more about X", "suggestion": "Link to a relevant page about X on ${website}"}` : '';

    const externalLinksInstructions = externalSources.length > 0 ? `

10. External Link Integration:
   - Incorporate authoritative external sources naturally within the content
   - Use the external sources provided from research data to add credibility
   - Include 3-7 external links that support key points in your content
   - Place links contextually where they add the most value
   - Available sources: ${JSON.stringify(externalSources.slice(0, 5))}
   - Format in externalLinks field: {"anchor": "natural anchor text", "url": "actual URL", "source": "source name", "context": "why this link is relevant"}` : '';

    const userPrompt = `Create a comprehensive, SEO-optimized blog post about "${keyword}" using the provided research data.

RESEARCH DATA:${researchSummary}${websiteInstructions}${externalLinksInstructions}

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
  "readabilityScore": "Grade 8",
  "internalLinks": [{"anchor": "suggested anchor text", "suggestion": "description of what this link should point to"}],
  "externalLinks": [{"anchor": "natural anchor text", "url": "actual URL", "source": "source name", "context": "why this link is relevant"}]
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
      // Extract internal links if they exist
      const extractInternalLinks = (): Array<{anchor: string, suggestion: string}> => {
        const pattern = /"internalLinks"\s*:\s*\[([^\]]*)]]/i;
        const match = jsonString.match(pattern);
        if (match && match[1]) {
          try {
            const linksStr = `[${match[1]}]`;
            return JSON.parse(linksStr) || [];
          } catch {
            return [];
          }
        }
        return [];
      };
      
      // Extract external links if they exist
      const extractExternalLinks = (): Array<{anchor: string, url: string, source: string, context?: string}> => {
        const pattern = /"externalLinks"\s*:\s*\[([^\]]*)]]/i;
        const match = jsonString.match(pattern);
        if (match && match[1]) {
          try {
            const linksStr = `[${match[1]}]`;
            return JSON.parse(linksStr) || [];
          } catch {
            return [];
          }
        }
        return [];
      };
      
      const blogData = {
        title: extractField('title') || `Expert Guide to ${keyword}`,
        metaDescription: extractField('metaDescription') || `Comprehensive guide about ${keyword}. Learn everything you need to know.`,
        content: extractField('content', true) || `# ${keyword}\n\nContent generation in progress...`,
        wordCount: extractNumber('wordCount') || 1500,
        readingTime: extractNumber('readingTime') || 8,
        targetKeywords: extractArray('targetKeywords').length > 0 ? extractArray('targetKeywords') : [keyword],
        readabilityScore: extractField('readabilityScore') || 'Grade 8',
        internalLinks: extractInternalLinks(),
        externalLinks: extractExternalLinks()
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
          // eslint-disable-next-line no-control-regex
          cleanedExtract = cleanedExtract.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
          
          const extracted = JSON.parse(cleanedExtract);
          if (!extracted.wordCount) extracted.wordCount = 1500;
          if (!extracted.readingTime) extracted.readingTime = 8;
          if (!extracted.targetKeywords) extracted.targetKeywords = [keyword];
          if (!extracted.readabilityScore) extracted.readabilityScore = "Grade 8";
          if (!extracted.internalLinks) extracted.internalLinks = [];
          if (!extracted.externalLinks) extracted.externalLinks = [];
          return extracted;
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
        }
      }
      throw new Error('Failed to parse blog data: ' + parseError.message);
    }
  }

  async generateTopicalMap(topic: string, location: string): Promise<TopicalMapKeyword[]> {
    console.log('Generating topical map for:', { topic, location });

    const systemPrompt = `You are an SEO strategist tasked with building topical maps for local SEO based on core keywords and locations. You specialize in creating comprehensive keyword strategies that establish topical authority while targeting local search opportunities.`;

    const userPrompt = `You are an SEO strategist tasked with building a topical map for local SEO based on a core keyword and location. The core keyword is:
"${topic} ${location}"

Build a structured topical map that includes:

I. Core Topic Cluster
A short paragraph explaining the core search intent

A list of 3–5 target pages (or pillar articles) to rank for the primary keyword

II. Supporting Content Clusters (Silos)
For each supporting silo, do the following:

Name the subtopic cluster (e.g., "Luxury Travel Services in Pittsburgh")

List 5–10 longtail keyword variations (local modifiers, intent-based searches, question formats, etc.)

Suggest a blog post or landing page title for each keyword

Label search intent: Informational, Commercial, or Transactional

III. FAQ / "People Also Ask" Section
List 10–15 common local search questions people ask related to the core keyword and location

Provide one-sentence suggested answers that could be featured snippets

IV. Local SEO Optimization Opportunities
Recommend 5 optimizations for Google Business Profile

Suggest structured data markup types to use

Suggest opportunities for local backlinks (e.g., directories, chambers, partnerships)

CRITICAL: Extract exactly 10 of the BEST longtail keywords from your comprehensive analysis above and format them as JSON:

{
  "keywords": [
    {
      "keyword": "specific keyword phrase",
      "intent": "informational|commercial|transactional|navigational",
      "priority": "high|medium|low",
      "difficulty": "Easy|Medium|Hard",
      "searchVolume": 1200
    }
  ]
}

Focus on keywords that have the highest potential for ranking and conversion in "${location}" for "${topic}".`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      console.log('Raw topical map response:', response.substring(0, 500));
      
      let jsonString = response.trim();
      
      // Extract JSON from code blocks if present
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      }
      
      const parsed = JSON.parse(jsonString);
      
      if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
        throw new Error('Invalid response format: missing keywords array');
      }
      
      // Convert to TopicalMapKeyword format with unique IDs
      const keywords: TopicalMapKeyword[] = parsed.keywords.map((kw: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        keyword: kw.keyword || '',
        searchVolume: kw.searchVolume || undefined,
        difficulty: kw.difficulty || 'Medium',
        intent: kw.intent || 'informational',
        priority: kw.priority || 'medium',
        contentCreated: false,
        contentId: undefined
      }));
      
      console.log('Successfully generated topical map with', keywords.length, 'keywords');
      return keywords;
      
    } catch (parseError: any) {
      console.error('Failed to parse topical map response:', parseError);
      
      // Fallback: try to extract keywords manually
      const keywordMatches = response.match(/"keyword":\s*"([^"]+)"/g);
      if (keywordMatches && keywordMatches.length > 0) {
        const fallbackKeywords: TopicalMapKeyword[] = keywordMatches.slice(0, 10).map((match, index) => {
          const keyword = match.match(/"keyword":\s*"([^"]+)"/)?.[1] || '';
          return {
            id: `${Date.now()}-${index}`,
            keyword,
            searchVolume: undefined,
            difficulty: 'Medium',
            intent: 'informational' as const,
            priority: 'medium' as const,
            contentCreated: false,
            contentId: undefined
          };
        });
        
        console.log('Using fallback keyword extraction, found', fallbackKeywords.length, 'keywords');
        return fallbackKeywords;
      }
      
      throw new Error('Failed to generate topical map: ' + parseError.message);
    }
  }
}

export const perplexityService = new PerplexityService();