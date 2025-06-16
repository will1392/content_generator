// services/ai/elevenlabs.service.ts
import axios from 'axios';
import { PodcastContent, AudioContent } from '../../types/project.types';

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Pre-defined voice IDs for different characteristics
const VOICES = {
  alex: 'pNInz6obpgDQGcFmaJgB', // Adam - professional male voice
  jordan: '21m00Tcm4TlvDq8ikWAM', // Rachel - casual female voice (we can use as casual male alternative)
  default: 'pNInz6obpgDQGcFmaJgB' // Adam as fallback
};

export class ElevenLabsService {
  private async synthesizeSpeech(text: string, voiceId: string): Promise<string> {
    console.log('=== ELEVENLABS TTS REQUEST ===');
    console.log('Text length:', text.length);
    console.log('Voice ID:', voiceId);
    console.log('API Key exists:', !!ELEVENLABS_API_KEY);
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key is not configured');
    }

    if (!ELEVENLABS_API_KEY.startsWith('sk_')) {
      throw new Error('Invalid ElevenLabs API key format');
    }

    try {
      const requestBody = {
        text: text.substring(0, 2500), // Limit text length for free tier
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      };

      console.log('Making request to ElevenLabs...');

      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        requestBody,
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          responseType: 'arraybuffer',
          timeout: 30000,
        }
      );

      console.log('ElevenLabs response received:', response.status);

      if (!response.data) {
        throw new Error('No audio data received from ElevenLabs');
      }

      // Convert array buffer to blob URL
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('Audio blob created successfully');
      return audioUrl;
    } catch (error: any) {
      console.error('ElevenLabs TTS failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      } else if (error.response?.status === 429) {
        throw new Error('ElevenLabs rate limit exceeded');
      } else if (error.response?.status === 400) {
        throw new Error(`ElevenLabs bad request: ${error.response?.data?.detail || 'Invalid request'}`);
      }
      
      throw new Error(`ElevenLabs TTS failed: ${error.message}`);
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
    console.log('=== ELEVENLABS AUDIO GENERATION ===');
    console.log('Podcast title:', podcastScript.title);
    console.log('Script length:', podcastScript.script?.length || 0);

    if (!podcastScript.script || podcastScript.script.trim().length === 0) {
      throw new Error('No podcast script provided for audio generation');
    }

    // Parse the script to extract speaker segments
    const segments = this.parseScriptForVoices(podcastScript.script);
    console.log('Parsed segments:', segments.length);

    if (segments.length === 0) {
      // Fallback: treat entire script as single voice
      console.log('No speaker segments found, using default voice');
      
      // Limit script length for free tier
      const limitedScript = podcastScript.script.substring(0, 2500);
      console.log('Using limited script length:', limitedScript.length, 'characters');
      
      const audioUrl = await this.synthesizeSpeech(limitedScript, VOICES.default);
      
      return {
        audioUrl,
        duration: Math.ceil(limitedScript.length / 150), // Rough estimate
        format: 'mp3',
        size: Math.ceil(limitedScript.length / 10), // Rough estimate
        transcript: limitedScript
      };
    }

    // Generate audio for the first segment only (for testing)
    console.log('Generating audio for first segment...');
    const firstSegment = segments[0];
    const voiceId = firstSegment.speaker === 'Alex' ? VOICES.alex : VOICES.jordan;
    
    console.log(`Generating audio for ${firstSegment.speaker} using voice ${voiceId}`);
    console.log(`Text: "${firstSegment.text.substring(0, 100)}..."`);
    
    const audioUrl = await this.synthesizeSpeech(firstSegment.text, voiceId);
    
    return {
      audioUrl,
      duration: Math.ceil(firstSegment.text.length / 150), // Rough estimate
      format: 'mp3', 
      size: Math.ceil(firstSegment.text.length / 10), // Rough estimate
      transcript: firstSegment.text
    };
  }
}

export const elevenLabsService = new ElevenLabsService();