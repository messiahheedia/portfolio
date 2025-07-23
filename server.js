require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// OpenAI Chat API endpoint
app.post('/api/openai-chat', async (req, res) => {
    const userMsg = req.body.message;
    const conversationHistory = req.body.conversationHistory || [];
    
    try {
        // Build conversation with full context
        const messages = [
            {
                role: 'system', 
                content: `You are Nova, Messiah Heredia's advanced AI assistant! You're enthusiastic, knowledgeable, and love helping people discover Messiah's incredible work.

ABOUT MESSIAH HEREDIA:
- Full-stack developer and tech innovator
- Expert in web development, programming, and cutting-edge technology
- Creates stunning websites, applications, and digital solutions
- Passionate about user experience and modern design
- Always learning and implementing the latest technologies
- Portfolio showcases diverse projects in web development, AI integration, and creative solutions

YOUR PERSONALITY:
- Upbeat, friendly, and professional
- Use a conversational tone like you're genuinely excited to help
- Provide detailed, helpful responses about Messiah's work
- Keep responses engaging but focused
- Use emojis sparingly but effectively

CURRENT CONTEXT: You're speaking through voice chat on Messiah's portfolio website. Help visitors understand his skills, projects, and capabilities!`
            },
            // Add conversation history
            ...conversationHistory,
            // Add current user message
            {role: 'user', content: userMsg}
        ];

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4', // Upgraded to GPT-4 for better responses
                messages: messages,
                max_tokens: 500,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const aiText = response.data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
        res.json({ reply: aiText });
    } catch (err) {
        console.error(err);
        res.status(500).json({ reply: "Error connecting to OpenAI API." });
    }
});

// Nova Introduction endpoint
app.get('/api/nova-intro', async (req, res) => {
    try {
        const introPrompt = {
            role: 'user',
            content: 'Please introduce yourself as Nova, Messiah Heredia\'s AI assistant, and give visitors a warm welcome and overview of Messiah\'s portfolio and what you can help them with. Keep it conversational and enthusiastic but concise.'
        };

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system', 
                        content: `You are Nova, Messiah Heredia's advanced AI assistant! You're enthusiastic, knowledgeable, and love helping people discover Messiah's incredible work.

ABOUT MESSIAH HEREDIA:
- Full-stack developer and tech innovator based in Orlando, Florida
- Expert in React, Node.js, Python, JavaScript, and modern web technologies
- Creates stunning responsive websites and web applications
- Passionate about user experience, AI integration, and clean design
- Portfolio includes e-commerce solutions, AI-powered apps, and creative digital projects
- Always implementing cutting-edge technologies and best practices

YOUR PERSONALITY:
- Upbeat, friendly, and professional
- Use a conversational tone like you're genuinely excited to help
- Be welcoming and make visitors feel comfortable
- Keep responses engaging but focused (2-3 sentences max for intro)

TASK: Give a warm introduction and overview of what you can help visitors with regarding Messiah's work and portfolio.`
                    },
                    introPrompt
                ],
                max_tokens: 300,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const introText = response.data.choices?.[0]?.message?.content || "Hi! I'm Nova, Messiah's AI assistant. I'm here to help you learn about his incredible work in web development and technology!";
        res.json({ introduction: introText });
        
    } catch (err) {
        console.error('Nova intro error:', err);
        res.json({ 
            introduction: "Hello! I'm Nova, Messiah Heredia's AI assistant! I'm excited to tell you about his amazing work as a full-stack developer and help answer any questions about his skills and projects. What would you like to know?" 
        });
    }
});

// Debug endpoint to check API key
app.get('/api/debug', (req, res) => {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    const apiKeyLength = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0;
    res.json({ 
        hasApiKey,
        apiKeyLength,
        env: process.env.NODE_ENV || 'development'
    });
});

// OpenAI TTS API endpoint  
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voice = 'alloy', model = 'tts-1', speed = 1.0 } = req.body;
        
        console.log(`TTS Request received: text="${text?.substring(0, 50)}...", voice=${voice}, model=${model}`);
        
        if (!text || text.trim().length === 0) {
            console.error('TTS Error: No text provided');
            return res.status(400).json({ error: 'Text is required and cannot be empty' });
        }

        // Check if API key is available first
        if (!process.env.OPENAI_API_KEY) {
            console.error('TTS Error: OpenAI API key not found in environment variables');
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        console.log(`TTS Request: model=${model}, voice=${voice}, speed=${speed}, text length=${text.length}`);

        // Make request to OpenAI TTS API - using proven stable model
        const requestData = {
            model: model,
            input: text.trim(),
            voice: voice,
            response_format: "mp3"
        };

        // Only add speed if it's not 1.0 (some models don't support speed parameter)
        if (speed !== 1.0) {
            requestData.speed = speed;
        }

        console.log('TTS Request Data:', JSON.stringify(requestData, null, 2));

        const response = await axios.post('https://api.openai.com/v1/audio/speech', requestData, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 30000 // 30 second timeout
        });

        console.log(`TTS Response: ${response.status}, Content-Length: ${response.data.length}`);

        if (!response.data || response.data.length === 0) {
            console.error('TTS Error: Empty response from OpenAI');
            return res.status(500).json({ error: 'Empty audio response from OpenAI' });
        }

        // Stream the audio response
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', response.data.length);
        res.setHeader('Cache-Control', 'no-cache');
        res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('TTS endpoint error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            code: error.code
        });
        
        let errorMessage = 'TTS generation failed';
        let statusCode = 500;
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = 'TTS request timed out';
        } else if (error.response?.status === 401) {
            errorMessage = 'Invalid OpenAI API key';
        } else if (error.response?.status === 429) {
            errorMessage = 'OpenAI API rate limit exceeded';
        } else if (error.response?.data) {
            errorMessage = `OpenAI API error: ${JSON.stringify(error.response.data)}`;
        }
        
        res.status(statusCode).json({ 
            error: errorMessage,
            details: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT} with OpenAI Chat and TTS`));