export default function handler(req, res) {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    const apiKeyLength = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0;
    res.json({ 
        hasApiKey,
        apiKeyLength,
        env: process.env.NODE_ENV || 'development'
    });
}
