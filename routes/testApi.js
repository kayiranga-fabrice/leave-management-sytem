const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const Anthropic = require('@anthropic-ai/sdk');

// Simple test route
router.get('/', async (req, res) => {
    try {
        console.log('Testing APIs...');
        console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing');
        
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('Anthropic API key is missing');
        }

        // Test Claude API first
        console.log('Testing Claude API...');
        try {
            const anthropic = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY
            });

            const claudeTest = await anthropic.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 100,
                temperature: 0.7,
                messages: [{
                    role: "user",
                    content: "Hello!"
                }]
            });
            console.log('Claude response:', claudeTest);
        } catch (openaiError) {
            console.error('OpenAI Error:', {
                message: openaiError.message,
                response: openaiError.response?.data,
                status: openaiError.response?.status
            });
            throw openaiError;
        }

        // Test Supabase
        console.log('Testing Supabase...');
        const supabaseTest = await supabase.from('profiles').select('*').limit(1);
        console.log('Supabase test complete');

        res.json({
            supabase: {
                status: supabaseTest.error ? 'failed' : 'success',
                error: supabaseTest.error,
                data: supabaseTest.data
            },
            claude: {
                status: 'success',
                data: claudeTest.content[0].text
            }
        });
    } catch (error) {
        console.error('Test API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });
        res.status(500).json({
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

module.exports = router;
