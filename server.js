require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Chat API endpoint - matches frontend call to /api/chat
app.post('/api/chat', async (req, res) => {
    const userMsg = req.body.message;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {role: 'system', content: "You are a helpful assistant for Messiah Heredia's portfolio website."},
                    {role: 'user', content: userMsg}
                ]
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

// Download endpoints for project files
app.get('/api/download/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    const filePath = `./projects/${projectId}.pdf`;
    
    console.log(`Download request for: ${projectId}`);
    console.log(`Looking for file at: ${filePath}`);
    
    // Check if file exists
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(__dirname, 'projects', `${projectId}.pdf`);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return res.status(404).send('File not found');
    }
    
    console.log(`File found, sending: ${fullPath}`);
    res.download(fullPath, `${projectId}.pdf`, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).send('Error downloading file');
        } else {
            console.log(`Successfully sent: ${projectId}.pdf`);
        }
    });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, '0.0.0.0', () => console.log(`Portfolio server running on port ${PORT} - accessible on network`));