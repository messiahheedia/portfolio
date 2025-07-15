require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/openai-chat', async (req, res) => {
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));