// Vercel Serverless Function for OpenAI Chat
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get API key from environment variables (secure)
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are Messiah Heredia's AI assistant. You help visitors learn about his portfolio, skills, and experience. 
                        
                        Key information about Messiah:
                        - IT Engineer passionate about software development and systems administration
                        - Has CompTIA A+, Network+, and Security+ certifications
                        - Working on CompTIA CySA+ and AWS Cloud Practitioner
                        - Projects include Our Family Connect (React/Node.js), QuickCommand (Python/JavaScript), and this portfolio
                        - Building a home lab with VMware, Docker, Kubernetes, and security tools
                        - Contact: messiah.heredia@icloud.com
                        - LinkedIn: https://www.linkedin.com/in/messiah-heredia-587a11362/
                        - GitHub: https://github.com/messiahheedia
                        
                        Be helpful, professional, and concise. Always encourage direct contact for specific opportunities.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ 
            error: 'Failed to get AI response',
            fallback: "Thanks for your interest! You can reach Messiah at messiah.heredia@icloud.com for specific questions, or check out his projects on GitHub: https://github.com/messiahheedia"
        });
    }
}
