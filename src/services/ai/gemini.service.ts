// services/ai/gemini.service.ts
import axios from 'axios';
import { PodcastContent } from '../../types/project.types';
import { elevenLabsService } from './elevenlabs.service';
import { backendTTSService } from './backend-tts.service';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_TTS_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';
const GEMINI_PRO_TTS_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent';
const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

export interface AudioContent {
  audioUrl: string;
  duration: number;
  format: string;
  size: number;
  transcript: string;
}

export class GeminiService {
  private async makeRequest(prompt: string): Promise<string> {
    console.log('=== GEMINI API REQUEST ===');
    console.log('API Key exists:', !!GEMINI_API_KEY);
    console.log('API Key length:', GEMINI_API_KEY?.length || 0);
    console.log('API Key preview:', GEMINI_API_KEY?.substring(0, 10) + '...' || 'None');
    console.log('API URL:', GEMINI_TTS_API_URL);
    console.log('Prompt length:', prompt.length);
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
    }
    
    try {
      console.time('Gemini API Call');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      };
      
      console.log('Request body prepared for Gemini API');
      
      const response = await axios.post(
        `${GEMINI_TTS_API_URL}?key=${GEMINI_API_KEY}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout
        }
      );

      console.timeEnd('Gemini API Call');
      console.log('API response status:', response.status);
      console.log('API response data keys:', Object.keys(response.data || {}));
      console.log('Full API response data:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        console.error('Response data is null/undefined');
        throw new Error('No data in API response');
      }
      
      if (!response.data.candidates || !Array.isArray(response.data.candidates)) {
        console.error('Missing candidates field in response');
        console.log('Available fields:', Object.keys(response.data));
        throw new Error('No candidates field in API response');
      }
      
      if (response.data.candidates.length === 0) {
        console.error('Candidates array is empty');
        throw new Error('No candidates in API response');
      }
      
      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
        console.error('Invalid candidate structure');
        console.log('Candidate structure:', JSON.stringify(candidate, null, 2));
        throw new Error('Invalid candidate content structure');
      }
      
      if (candidate.content.parts.length === 0 || !candidate.content.parts[0].text) {
        console.error('No text content in candidate');
        throw new Error('No text content in API response');
      }
      
      const textContent = candidate.content.parts[0].text;
      console.log('Successfully extracted text, length:', textContent.length);
      console.log('Text preview:', textContent.substring(0, 200) + '...');
      return textContent;
    } catch (error: any) {
      console.error('=== GEMINI API ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.response?.status);
      console.error('Error status text:', error.response?.statusText);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Is network error:', error.message.includes('Network Error'));
      console.error('Is timeout:', error.code === 'ECONNABORTED');
      console.error('Full error stack:', error.stack);
      console.error('===========================');
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out - please try again');
      }
      
      if (error.message.includes('Network Error')) {
        throw new Error('Network error connecting to Gemini API. Please check your internet connection.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Gemini API key configuration.');
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

  private async synthesizeSpeechWithGemini(text: string, speaker: string = 'Alex', useProModel: boolean = false): Promise<string> {
    console.log('=== GEMINI NATIVE TTS REQUEST ===');
    console.log('Text length:', text.length);
    console.log('Speaker:', speaker);
    console.log('Using Pro model:', useProModel);
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
    }
    
    try {
      // Voice mapping for different speakers
      const voiceMap: { [key: string]: string } = {
        'Alex': 'Kore',     // Professional, analytical voice
        'Jordan': 'Zephyr', // Bright, casual voice
        'narrator': 'Puck', // Upbeat narrator voice
        'host': 'Kore',
        'co_host': 'Zephyr',
        'guest': 'Puck'
      };
      
      const voiceName = voiceMap[speaker] || 'Kore';
      const apiUrl = useProModel ? GEMINI_PRO_TTS_API_URL : GEMINI_TTS_API_URL;
      
      // Create stylistic prompt for natural delivery
      const stylePrompt = this.getStylePromptForSpeaker(speaker);
      const fullPrompt = `${stylePrompt}: ${text}`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        },
        model: useProModel ? 'gemini-2.5-pro-preview-tts' : 'gemini-2.5-flash-preview-tts'
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      console.log('Making Gemini TTS request with voice:', voiceName);
      
      const response = await axios.post(
        `${apiUrl}?key=${GEMINI_API_KEY}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout for TTS
        }
      );
      
      console.log('Gemini TTS response status:', response.status);
      console.log('Response keys:', Object.keys(response.data || {}));
      
      if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No audio content in Gemini TTS response');
      }
      
      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid audio response structure');
      }
      
      // Look for audio data in the response
      const audioPart = candidate.content.parts.find((part: any) => part.inlineData && part.inlineData.mimeType?.includes('audio'));
      
      if (!audioPart || !audioPart.inlineData || !audioPart.inlineData.data) {
        throw new Error('No audio data found in Gemini TTS response');
      }
      
      // Convert base64 audio to blob URL
      const audioBase64 = audioPart.inlineData.data;
      const mimeType = audioPart.inlineData.mimeType || 'audio/wav';
      
      const audioBytes = atob(audioBase64);
      const uint8Array = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        uint8Array[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([uint8Array], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('✅ Gemini TTS synthesis successful, audio URL created');
      console.log('Audio format:', mimeType);
      console.log('Audio size:', audioBlob.size, 'bytes');
      
      return audioUrl;
    } catch (error: any) {
      console.error('❌ Gemini TTS synthesis failed:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(`Gemini TTS failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  private getStylePromptForSpeaker(speaker: string): string {
    const styleMap: { [key: string]: string } = {
      'Alex': 'Say in a professional, analytical tone',
      'Jordan': 'Say in a casual, friendly, storytelling tone',
      'narrator': 'Say in a clear, engaging narrator voice',
      'host': 'Say as a podcast host with enthusiasm',
      'co_host': 'Say as a knowledgeable co-host',
      'guest': 'Say as an expert guest speaker'
    };
    
    return styleMap[speaker] || 'Say naturally';
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
    console.log('=== ATTEMPTING REAL AUDIO GENERATION ===');
    console.log('Podcast title:', podcastScript.title);
    console.log('Script length:', podcastScript.script?.length || 0);

    if (!podcastScript.script || podcastScript.script.trim().length === 0) {
      throw new Error('No podcast script provided for audio generation');
    }

    // Try Gemini native TTS first (latest capability)
    try {
      console.log('🎯 Attempting Gemini native TTS (latest model)...');
      const result = await this.generateAudioWithGeminiTTS(podcastScript);
      console.log('✅ Gemini TTS Success! Result:', result);
      return result;
    } catch (geminiError: any) {
      console.warn('❌ Gemini TTS failed, trying Google TTS via backend...');
      console.warn('Gemini error:', geminiError.message);
      
      // Fallback to Google TTS via backend
      try {
        console.log('🔄 Falling back to Google TTS via backend...');
        return await backendTTSService.generateAudio(podcastScript);
      } catch (backendError: any) {
        console.warn('Backend TTS failed, trying ElevenLabs fallback...');
        console.warn('Backend error:', backendError.message);
        
        // Final fallback to ElevenLabs
        try {
          console.log('🔄 Final fallback to ElevenLabs...');
          return await elevenLabsService.generateAudio(podcastScript);
        } catch (elevenLabsError: any) {
          console.error('All TTS services failed');
          
          // Provide helpful error messages
          let errorMessage = 'Audio generation failed across all services. ';
          
          if (geminiError.message.includes('API key')) {
            errorMessage += 'Gemini API key issue. ';
          } else {
            errorMessage += `Gemini TTS: ${geminiError.message}. `;
          }
          
          if (backendError.message.includes('not running')) {
            errorMessage += 'Backend TTS server is not running. ';
          } else {
            errorMessage += `Backend TTS: ${backendError.message}. `;
          }
          
          if (elevenLabsError.message.includes('API key')) {
            errorMessage += 'ElevenLabs API key also missing.';
          } else {
            errorMessage += `ElevenLabs: ${elevenLabsError.message}`;
          }
          
          throw new Error(errorMessage);
        }
      }
    }
  }
  
  private async generateAudioWithGeminiTTS(podcastScript: PodcastContent): Promise<AudioContent> {
    console.log('=== GEMINI NATIVE TTS GENERATION ===');
    
    const segments = this.parseScriptForVoices(podcastScript.script!);
    console.log(`Found ${segments.length} speaker segments`);
    
    if (segments.length === 0) {
      // No speaker segments found, treat as single narrator
      console.log('No speaker segments found, using single voice');
      const audioUrl = await this.synthesizeSpeechWithGemini(podcastScript.script!, 'narrator', false);
      
      return {
        audioUrl,
        duration: Math.ceil(podcastScript.script!.length / 150), // Rough estimate
        format: 'audio/wav',
        size: 0, // Will be calculated when blob is created
        transcript: podcastScript.script!
      };
    }
    
    // Multi-speaker generation
    if (segments.length === 1) {
      // Single speaker, use basic TTS
      const segment = segments[0];
      const audioUrl = await this.synthesizeSpeechWithGemini(segment.text, segment.speaker, false);
      
      return {
        audioUrl,
        duration: Math.ceil(segment.text.length / 150),
        format: 'audio/wav',
        size: 0,
        transcript: segment.text
      };
    }
    
    // Multiple speakers - use Pro model for better multi-speaker support
    console.log('Using Gemini Pro model for multi-speaker generation');
    
    // Combine segments with speaker annotations for Gemini
    const combinedScript = segments.map(seg => 
      `${this.getStylePromptForSpeaker(seg.speaker)}: ${seg.text}`
    ).join('\n\n');
    
    const audioUrl = await this.synthesizeSpeechWithGemini(combinedScript, 'multi-speaker', true);
    
    return {
      audioUrl,
      duration: Math.ceil(combinedScript.length / 150),
      format: 'audio/wav',
      size: 0,
      transcript: segments.map(seg => `${seg.speaker}: ${seg.text}`).join('\n')
    };
  }
}

export const geminiService = new GeminiService();