const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic();


// Landing page
router.get('/', (req, res) => {
    res.render('landing');
});

// Test interface
router.get('/test-interface', (req, res) => {
    res.render('test');
});

// Create admin page
router.get('/create-admin', (req, res) => {
    res.render('create-admin');
});

// Auth portal
router.get('/authenticator', (req, res) => {
    res.render('auth-home');
});

// Chatbot routes
router.get('/chatbot', (req, res) => {
    res.render('chatbot');
});

router.post('/chatbot/ask', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message:', message);
        console.log('API Key:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing');
        
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('Anthropic API key is missing');
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
        
        const response = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 500,
            temperature: 0.7,
            system: "You are a vermicomposting expert assistant. Provide helpful, accurate advice about worm composting, bin maintenance, troubleshooting, and best practices.",
            messages: [{
                role: "user",
                content: message
            }]
        });

        res.json({ reply: response.content[0].text });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
});

module.exports = router;
