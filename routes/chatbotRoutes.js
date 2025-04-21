const express = require('express');
const router = express.Router();
const axios = require('axios');

// Chatbot page route
router.get('/', (req, res) => {
    res.render('chatbot');
});

// Handle chat messages
router.post('/ask', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a vermicomposting expert assistant. Provide helpful, accurate advice about worm composting, bin maintenance, troubleshooting, and best practices."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

module.exports = router;
