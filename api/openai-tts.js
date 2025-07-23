import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice = 'alloy', model = 'tts-1' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('TTS Request:', { text: text.substring(0, 100) + '...', voice, model });

    // Validate voice parameter
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ 
        error: 'Invalid voice parameter',
        validVoices: validVoices
      });
    }

    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text.substring(0, 4000), // Limit text length
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    console.log('TTS Response generated, buffer size:', buffer.length);

    // Set appropriate headers for audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.status(200).send(buffer);

  } catch (error) {
    console.error('TTS API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'API quota exceeded. Please try again later.',
        details: 'OpenAI API quota limit reached'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'API configuration error',
        details: 'Invalid OpenAI API key'
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message
    });
  }
}
