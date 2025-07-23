export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, voice = 'alloy', model = 'tts-1' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`TTS Request: model=${model}, voice=${voice}, text length=${text.length}`);
        console.log('API Key present:', !!process.env.OPENAI_API_KEY);
        console.log('API Key length:', process.env.OPENAI_API_KEY?.length);

        // Check if API key is available
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key not found in environment variables');
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        // Make request to OpenAI TTS API
        console.log('Making OpenAI TTS request...');
        const requestBody = {
            model: model,
            input: text,
            voice: voice,
            response_format: "mp3"
        };
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        // Make request to OpenAI TTS API
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('OpenAI TTS Response status:', response.status);
        console.log('OpenAI TTS Response headers:', Object.fromEntries(response.headers));

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI TTS API error status:', response.status);
            console.error('OpenAI TTS API error response:', errorData);
            
            // Try to parse error as JSON for more details
            let parsedError;
            try {
                parsedError = JSON.parse(errorData);
                console.error('Parsed error:', parsedError);
            } catch (e) {
                console.error('Could not parse error as JSON');
            }
            
            return res.status(response.status).json({ 
                error: 'TTS API request failed',
                details: errorData,
                status: response.status
            });
        }

        // Stream the audio response
        const audioBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.byteLength);
        res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('TTS endpoint error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}
