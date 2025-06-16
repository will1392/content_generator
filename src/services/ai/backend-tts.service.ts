// services/ai/backend-tts.service.ts
import axios from 'axios';
import { PodcastContent, AudioContent } from '../../types/project.types';

const BACKEND_TTS_URL = 'http://localhost:3001';

export class BackendTTSService {
  private async testBackendConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${BACKEND_TTS_URL}/health`, { timeout: 5000 });
      console.log('✅ Backend health check:', response.data);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }

  private async synthesizeSpeech(text: string, voice: string): Promise<string> {
    console.log('🎤 Synthesizing speech via backend...');
    console.log('Text length:', text.length);
    console.log('Voice:', voice);

    try {
      const response = await axios.post(
        `${BACKEND_TTS_URL}/synthesize`,
        { text, voice },
        {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.data) {
        throw new Error('No audio data received from backend');
      }

      // Convert array buffer to blob URL
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ Audio synthesized successfully via backend');
      return audioUrl;
    } catch (error: any) {
      console.error('❌ Backend TTS synthesis failed:', error);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('TTS backend server is not running. Please start the backend server first.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('TTS backend authentication failed. Check service account permissions.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('TTS quota exceeded. Please try again later.');
      }
      
      throw new Error(`Backend TTS failed: ${error.response?.data?.error || error.message}`);
    }
  }

  private async synthesizePodcast(script: string): Promise<string> {
    console.log('🎙️  Synthesizing podcast via backend...');

    try {
      const response = await axios.post(
        `${BACKEND_TTS_URL}/synthesize-podcast`,
        { 
          script,
          speakers: {
            alex: 'en-US-Standard-J', // Professional male voice
            jordan: 'en-US-Standard-I' // Casual male voice
          }
        },
        {
          responseType: 'arraybuffer',
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.data) {
        throw new Error('No audio data received from backend');
      }

      // Convert array buffer to blob URL
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ Podcast audio synthesized successfully');
      console.log('Speaker:', response.headers['x-speaker']);
      console.log('Voice:', response.headers['x-voice']);
      
      return audioUrl;
    } catch (error: any) {
      console.error('❌ Backend podcast synthesis failed:', error);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('TTS backend server is not running. Please start the backend server first.');
      }
      
      throw new Error(`Podcast synthesis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  private parseScriptForVoices(script: string): Array<{speaker: string, text: string}> {
    const lines = script.split('\n').filter(line => line.trim());
    const segments: Array<{speaker: string, text: string}> = [];
    
    for (const line of lines) {
      // Look for speaker patterns like "Alex:" or "Jordan:"
      const match = line.match(/^(Alex|Jordan):\s*(.+)$/);
      if (match) {
        const [, speaker, text] = match;
        segments.push({ speaker, text: text.trim() });
      }
    }
    
    return segments;
  }

  async generateAudio(podcastScript: PodcastContent): Promise<AudioContent> {
    console.log('=== BACKEND TTS AUDIO GENERATION ===');
    console.log('Podcast title:', podcastScript.title);
    console.log('Script length:', podcastScript.script?.length || 0);

    if (!podcastScript.script || podcastScript.script.trim().length === 0) {
      throw new Error('No podcast script provided for audio generation');
    }

    // Check if backend is running
    const isBackendRunning = await this.testBackendConnection();
    if (!isBackendRunning) {
      throw new Error('TTS backend server is not running. Please start the backend server by running "npm start" in the tts-backend folder.');
    }

    // Try podcast synthesis first (handles multiple speakers)
    try {
      console.log('🎯 Attempting podcast synthesis...');
      const audioUrl = await this.synthesizePodcast(podcastScript.script);
      
      // Parse segments to get info for metadata
      const segments = this.parseScriptForVoices(podcastScript.script);
      const firstSegment = segments.length > 0 ? segments[0] : null;
      
      return {
        audioUrl,
        duration: Math.ceil((firstSegment?.text.length || 1000) / 150), // Rough estimate
        format: 'mp3',
        size: Math.ceil((firstSegment?.text.length || 1000) / 10), // Rough estimate
        transcript: firstSegment?.text || podcastScript.script.substring(0, 2000)
      };
    } catch (podcastError) {
      console.warn('Podcast synthesis failed, trying single voice fallback...');
      
      // Fallback: use single voice for entire script
      const limitedScript = podcastScript.script.substring(0, 2000);
      const audioUrl = await this.synthesizeSpeech(limitedScript, 'en-US-Standard-J');
      
      return {
        audioUrl,
        duration: Math.ceil(limitedScript.length / 150),
        format: 'mp3',
        size: Math.ceil(limitedScript.length / 10),
        transcript: limitedScript
      };
    }
  }
}

export const backendTTSService = new BackendTTSService();