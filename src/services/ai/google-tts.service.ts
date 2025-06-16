// services/ai/google-tts.service.ts
import axios from 'axios';
import { PodcastContent, AudioContent } from '../../types/project.types';

// Service account credentials (Note: In production, this should be on the backend)
const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "gen-lang-client-0844938419",
  private_key_id: "e5bc200ea1ed3e82948ef37e1f397e6cfdf3169d",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDE+oXihZou0YSr\nPJCueyj2RYkVs6vn42lqDGO50lwl5abDV4RbLhYfz9fL9qriFfKGcOagomdTUSFz\n8dnNo1nMRG+PxW2K45WLkHdjQ6LvjfqHSGq45fcqfCy+gwm/HPSDSA8bcrkLyl+f\nDLbCgiiJMERSS2hIepbGGLVC0BGxxYO4otRGqB3iT9Kw+VrWq03VqaImkzI5p+KC\noeeWJkY5L4MNb9cNFZL2MxXYM7giSzo0mA/+QUYjscKiiRXmkS4aRebIzMJmFel1\nWW+nmabnFYgMzgtLJF6JiM9HhS9A6b+Do9o9spMYQL27SC95zLhZp7luXvk05o+q\nmTbjQkgrAgMBAAECggEAVfXeJ5SWTIgylWfA2+PzZEXEJSxbgL7FafouKxGaFQ+7\nTtQKdqAOF6PkUKY8vJ1HUVRD0SYOYVWue6K3of3/Wh0jcmJ+A3Z99IH/F9qUaGZV\nRmRb7oSs8GVwQVN+FWDVc9Umgpv2FScjw40Q1KFofzYJGsC9qaOV2K0/rQCQODtt\nEyWkgSMNd1uGrxS0jStE1vzixZ2T/lSqB30FzvXXie2QjqjRyiMWR5UZ0Dinz+7c\nbjK69dGTkr32I340ndLQ102WlAMQULWVqvDFXWjP19VVUcUmX5BAqv+rJVp3vzLU\nJlihw5uoK/q0sHkV41TGklhziiRvY5QK1CjdXUdNQQKBgQD1byLfVAdC43amtkvA\nvbDIeK3CxDB5aroHLf4++QC2hoP4qtjdhOowxkhPeDbaFMC+pv2kECWgKdGNnFpV\nA2QGCVTIKeQaOZRyoR8M4CI//galWPaYRPvlEgSCYoYAEbwA6Xonsno34JvBpqgo\n+CMYZeoihx6FYU0j9TF5kxfsHwKBgQDNdV8XeVPjkSKo10XzvAhSyZkuM+idfZN7\n1udH+n3L2d2k6f0n6F4UHDHMRVPMt+jAd3vVnoKuLCGT5GqLpXR9jDGoYYaWGEJk\nRxoWdf4M5JJ0pf/DeD4ZH914LDJpB2m470MwZLfJEWE8tujdpnIKJ7ytb88nfezJ\ng4hhGSDidQKBgQDr27VjcNjZisYHR8BcpO4yeOZi+S6sP8guBiECW0A4J+TDH0vw\n9T4pSSNMW3Y69R6VGN0+wNWnqQhcUhjtAakps+XpxXgTS6pAzl2Mfgfr/y5bz7aK\ndiCr7jivJAcqIeDN75EYfQe+kvabjpCjbnIrjCUIsVi/TNZY69RzxMuEeQKBgGin\nDmbAkDBsLwFdle4OqxawRWw5WJVP752221vYhdceBD4KSb7YJ4OK0PrBnWu7ibzv\nn44yDVJ2fCv+vx6einWgwXKJKqqtdLPrW6hxNZSPoOH15A9G4iqeBos9x/ejpQBk\nLw8pXkv2pFbuvDKao5/0mbCmMRhmlgQXEZKT4CI5AoGAGBrQ7M2eZXMyorrNKiEy\n6lbJdy4lZlgUKy1J0GLi/9v5buRkqDynmRdiOsjPKvkF8l2sP27jN+LK/JE3F2N4\nWnf8sbemUZ0yS1lStfD4DWiSyg83LN4eCZiiFvU/Ozocp+sH9gGe4ASFUn3jU2a7\no12hFkZzb8tpsslpQvejQZg=\n-----END PRIVATE KEY-----\n",
  client_email: "tts-access@gen-lang-client-0844938419.iam.gserviceaccount.com",
  client_id: "100548858905681550209",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/tts-access%40gen-lang-client-0844938419.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// Helper function to create JWT for Google OAuth2
function createJWT(privateKey: string, email: string): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // For simplicity in development, we'll use a different approach
  // In production, this should be handled by a backend service
  console.warn('JWT creation skipped - using alternative auth method');
  return '';
}

export class GoogleTTSService {
  private async getAccessToken(): Promise<string> {
    console.log('=== GOOGLE TTS AUTHENTICATION ===');
    console.log('Service account email:', SERVICE_ACCOUNT.client_email);
    console.log('Project ID:', SERVICE_ACCOUNT.project_id);

    // For development, we'll use a different approach
    // In a real app, this would be handled by your backend
    throw new Error('Google TTS requires backend authentication for production use. Service account credentials should not be exposed in frontend code.');
  }

  private async synthesizeSpeech(text: string, voiceName: string): Promise<string> {
    console.log('=== GOOGLE TTS REQUEST ===');
    console.log('Text length:', text.length);
    console.log('Voice:', voiceName);
    
    try {
      const accessToken = await this.getAccessToken();

      const requestBody = {
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: voiceName,
          ssmlGender: voiceName.includes('Standard-A') || voiceName.includes('Standard-C') ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      const response = await axios.post(
        TTS_API_URL,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      if (!response.data.audioContent) {
        throw new Error('No audio content in TTS response');
      }

      // Convert base64 audio to blob URL
      const audioBytes = response.data.audioContent;
      const audioBlob = new Blob([Uint8Array.from(atob(audioBytes), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('TTS synthesis successful, audio URL created');
      return audioUrl;
    } catch (error: any) {
      console.error('Google TTS synthesis failed:', error);
      throw new Error(`Google TTS failed: ${error.message}`);
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
    console.log('=== GOOGLE TTS AUDIO GENERATION ===');
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
      
      // Limit script length
      const limitedScript = podcastScript.script.substring(0, 1000);
      console.log('Using limited script length:', limitedScript.length, 'characters');
      
      const audioUrl = await this.synthesizeSpeech(limitedScript, 'en-US-Standard-J');
      
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
    const voiceName = firstSegment.speaker === 'Alex' ? 'en-US-Standard-J' : 'en-US-Standard-I';
    
    console.log(`Generating audio for ${firstSegment.speaker} using voice ${voiceName}`);
    console.log(`Text: "${firstSegment.text.substring(0, 100)}..."`);
    
    const audioUrl = await this.synthesizeSpeech(firstSegment.text, voiceName);
    
    return {
      audioUrl,
      duration: Math.ceil(firstSegment.text.length / 150), // Rough estimate
      format: 'mp3', 
      size: Math.ceil(firstSegment.text.length / 10), // Rough estimate
      transcript: firstSegment.text
    };
  }
}

export const googleTTSService = new GoogleTTSService();