module.exports = async (req, res) => {
    console.log('=== CHATAPI CALLED ===');
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        console.log('Processing POST request...');
        const { message } = req.body;

        if (!message || message.trim() === '') {
            console.log('Empty message received');
            return res.json({ 
                reply: "Please send a message and I'll be happy to help you learn more about Messiah's background!" 
            });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key not configured');
            return res.json({
                reply: "I'm currently offline. Please contact Messiah directly at messiah.heredia@icloud.com for inquiries about his experience and projects."
            });
        }

        console.log('Making OpenAI API request with message:', message);
        
        // Use native fetch (available in Node.js 18+)
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are Messiah Heredia's AI assistant on his portfolio website. You are knowledgeable about his background and work. Here's what you should know about Messiah:

BACKGROUND:
- Systems Administrator and Infrastructure Engineer
- Specializes in enterprise infrastructure management, network security, and virtualization platforms
- Builds and maintains scalable, secure IT environments
- Software development skills for automation and custom solutions

CERTIFICATIONS:
- CompTIA A+ (Hardware and software fundamentals, troubleshooting)
- CompTIA Network+ (Networking fundamentals, infrastructure, and security)
- CompTIA Security+ (Cybersecurity principles and threat management)
- Currently pursuing: CompTIA CySA+ and AWS certifications

SKILLS:
- Infrastructure management, network security
- Virtualization (VMware, Hyper-V)
- Cloud platforms (AWS, Azure, GCP)
- Python automation and scripting
- Enterprise IT operations
- SIEM, threat hunting, incident response
- React, Node.js, JavaScript for web development

KEY PROJECTS:
1. Our Family Connect Application - Modern React-based web app for family communication with real-time messaging, event planning, and photo sharing
2. QuickCommand - Advanced Python CLI tool for DevOps automation with secure task execution and encrypted credential management
3. Cloud Infrastructure - Multi-cloud implementations with AWS, Azure, GCP featuring automated deployment pipelines and infrastructure as code
4. Security Operations - SOC implementations with SIEM integration and threat hunting capabilities
5. Professional Writing - Academic and technical writing samples in cybersecurity domains
6. IT Diagrams - Network topology diagrams and IT onboarding documentation

CONTACT:
- Email: messiah.heredia@icloud.com
- LinkedIn: https://www.linkedin.com/in/messiah-heredia-587a11362/
- GitHub: https://github.com/messiahheedia
- Resume available for download on the website

Always be helpful, professional, and enthusiastic about Messiah's work. Provide specific details when asked, and encourage visitors to contact him directly for professional opportunities. Keep responses concise but informative.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 300,
                temperature: 0.7,
            })
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error('OpenAI API error:', openaiResponse.status, errorText);
            
            // Fallback response if OpenAI fails
            return res.json({
                reply: "I'm having trouble connecting to my AI service right now. Please contact Messiah directly at messiah.heredia@icloud.com for any questions about his experience, projects, or to discuss opportunities."
            });
        }

        const data = await openaiResponse.json();
        console.log('OpenAI API response received successfully');
        
        const aiReply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request. Please contact Messiah directly at messiah.heredia@icloud.com";

        console.log('Sending response:', aiReply.substring(0, 100) + '...');
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('Chat API error:', error.message);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({ 
            reply: "I'm experiencing technical difficulties. Please contact Messiah directly at messiah.heredia@icloud.com for any inquiries."
        });
    }
};
