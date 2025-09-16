module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        const apiKeyLength = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0;
        
        res.json({
            message: "API test successful",
            environment: process.env.NODE_ENV || 'development',
            hasOpenAIKey: hasOpenAI,
            keyLength: apiKeyLength,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test API error:', error);
        res.status(500).json({ error: error.message });
    }
};
