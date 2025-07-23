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
    const { message, history = [], systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('OpenAI Chat Request:', { message, historyLength: history.length });

    // Build messages array
    const messages = [
      {
        role: 'system',
        content: systemPrompt || "You are Nova, Messiah Heredia's AI assistant. You're knowledgeable about his skills as a full-stack developer, cybersecurity expert, and his projects. Keep responses conversational, helpful, and under 100 words for voice chat. Highlight his expertise in JavaScript, Python, React, Node.js, cybersecurity frameworks, network design, and his passion for creating innovative digital solutions."
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    console.log('OpenAI Response:', response);

    res.status(200).json({ 
      response: response,
      message: response // For backward compatibility
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
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
      error: 'Failed to get AI response',
      details: error.message
    });
  }
}
