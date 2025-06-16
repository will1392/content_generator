const express = require('express');
const textToSpeech = require('@google-cloud/text-to-speech');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));
app.use(express.json());

// Set up Google Cloud credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'gen-lang-client-0844938419-e5bc200ea1ed.json');

console.log('🔑 Google TTS credentials loaded from:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Initialize Google TTS client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Google TTS Backend',
    timestamp: new Date().toISOString()
  });
});

// TTS synthesis endpoint
app.post('/synthesize', async (req, res) => {
  console.log('🎤 TTS Request received:', {
    textLength: req.body.text?.length || 0,
    voice: req.body.voice,
    timestamp: new Date().toISOString()
  });

  try {
    const { text, voice = 'en-US-Standard-J' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text is required and cannot be empty' 
      });
    }

    // Limit text length to prevent abuse
    const limitedText = text.substring(0, 5000);
    if (text.length > 5000) {
      console.log('⚠️  Text truncated from', text.length, 'to 5000 characters');
    }

    // Prepare the synthesis request
    const request = {
      input: { text: limitedText },
      voice: {
        languageCode: 'en-US',
        name: voice,
        ssmlGender: voice.includes('Standard-A') || voice.includes('Standard-C') ? 'FEMALE' : 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    console.log('🔄 Calling Google TTS API...');
    const [response] = await ttsClient.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    console.log('✅ Audio generated successfully, size:', response.audioContent.length, 'bytes');

    // Set appropriate headers
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.audioContent.length,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': 'http://localhost:3000'
    });

    // Send the audio content
    res.send(response.audioContent);

  } catch (error) {
    console.error('❌ TTS Error:', error.message);
    console.error('Error details:', error);

    let errorMessage = 'Text-to-speech generation failed';
    let statusCode = 500;

    if (error.code === 3) {
      errorMessage = 'Invalid request parameters';
      statusCode = 400;
    } else if (error.code === 7) {
      errorMessage = 'Permission denied - check service account permissions';
      statusCode = 403;
    } else if (error.code === 8) {
      errorMessage = 'Resource exhausted - quota exceeded';
      statusCode = 429;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      code: error.code
    });
  }
});

// Podcast synthesis endpoint (handles multiple speakers)
app.post('/synthesize-podcast', async (req, res) => {
  console.log('🎙️  Podcast synthesis request received');

  try {
    const { script, speakers = { alex: 'en-US-Standard-J', jordan: 'en-US-Standard-I' } } = req.body;

    if (!script || script.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Script is required and cannot be empty' 
      });
    }

    // Parse script for speakers
    const lines = script.split('\n').filter(line => line.trim());
    const segments = [];
    
    for (const line of lines) {
      const match = line.match(/^(Alex|Jordan):\s*(.+)$/);
      if (match) {
        const [, speaker, text] = match;
        segments.push({ 
          speaker: speaker.toLowerCase(), 
          text: text.trim(),
          voice: speakers[speaker.toLowerCase()] || speakers.alex
        });
      }
    }

    console.log(`📝 Found ${segments.length} speaker segments`);

    if (segments.length === 0) {
      return res.status(400).json({ 
        error: 'No speaker segments found. Use format "Alex: text" or "Jordan: text"' 
      });
    }

    // For now, synthesize just the first segment
    // In production, you'd combine multiple segments
    const firstSegment = segments[0];
    console.log(`🎯 Synthesizing first segment for ${firstSegment.speaker}`);

    const request = {
      input: { text: firstSegment.text.substring(0, 2000) }, // Limit for demo
      voice: {
        languageCode: 'en-US',
        name: firstSegment.voice,
        ssmlGender: firstSegment.voice.includes('Standard-A') || firstSegment.voice.includes('Standard-C') ? 'FEMALE' : 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    console.log('✅ Podcast audio generated successfully');

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.audioContent.length,
      'X-Speaker': firstSegment.speaker,
      'X-Voice': firstSegment.voice
    });

    res.send(response.audioContent);

  } catch (error) {
    console.error('❌ Podcast synthesis error:', error.message);
    res.status(500).json({ 
      error: 'Podcast synthesis failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Google TTS Backend Server started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log('🎤 TTS endpoint: POST /synthesize');
  console.log('🎙️  Podcast endpoint: POST /synthesize-podcast');
  console.log('');
  console.log('Ready to serve audio requests! 🎧');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down TTS backend server...');
  process.exit(0);
});