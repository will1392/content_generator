interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class N8nService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_N8N_URL || 'http://localhost:5678/webhook';
  }

  private async makeRequest<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  async generateResearch(keyword: string, projectId: string): Promise<ApiResponse> {
    return this.makeRequest('research', { keyword, projectId });
  }

  async generateBlog(keyword: string, projectId: string, researchData: any): Promise<ApiResponse> {
    return this.makeRequest('blog', { keyword, projectId, researchData });
  }

  async generatePodcast(keyword: string, projectId: string, blogContent: any): Promise<ApiResponse> {
    return this.makeRequest('podcast', { keyword, projectId, blogContent });
  }

  async generateAudio(keyword: string, projectId: string, podcastScript: any): Promise<ApiResponse> {
    return this.makeRequest('audio', { keyword, projectId, podcastScript });
  }

  async generateImages(keyword: string, projectId: string, content: any): Promise<ApiResponse> {
    return this.makeRequest('images', { keyword, projectId, content });
  }

  async generateSocial(keyword: string, projectId: string, content: any): Promise<ApiResponse> {
    return this.makeRequest('social', { keyword, projectId, content });
  }
}

export const n8nService = new N8nService();