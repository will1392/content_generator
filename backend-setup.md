# Backend Setup for Google TTS

## Why Backend is Needed:
- Service account credentials must stay secure
- `GOOGLE_APPLICATION_CREDENTIALS` only works in server environments
- Frontend apps can't safely use private keys

## Quick Backend Setup Options:

### Option 1: Simple Node.js Express Server

1. Create a new folder: `mkdir tts-backend && cd tts-backend`
2. Initialize: `npm init -y`
3. Install: `npm install express @google-cloud/text-to-speech cors dotenv`
4. Create `server.js`:

```javascript
const express = require('express');
const textToSpeech = require('@google-cloud/text-to-speech');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Set credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = './gen-lang-client-0844938419-e5bc200ea1ed.json';

const client = new textToSpeech.TextToSpeechClient();

app.post('/synthesize', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: voice || 'en-US-Standard-J',
      },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.audioContent.length,
    });
    
    res.send(response.audioContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('TTS Backend running on port 3001');
});
```

5. Copy your JSON file to the backend folder
6. Run: `node server.js`
7. Update frontend to call `http://localhost:3001/synthesize`

### Option 2: Vercel/Netlify Serverless Function

1. Create `/api/tts.js` (for Vercel)
2. Use environment variables for credentials
3. Deploy as serverless function

## Recommendation:
For development speed, use **ElevenLabs** (frontend-ready).
For production with Google TTS, use **backend approach**.