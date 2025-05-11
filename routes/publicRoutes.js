const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // Use node-fetch for API requests
const supabase = require('../config/supabase');

// Authentication middleware
const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        req.user = user;
        next();
    } catch (error) {
        return res.redirect('/auth/login');
    }
};



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

// Voice Assistant page
router.get('/voice-assistant', (req, res) => {
    res.render('voice-assistant');
});

router.post('/chatbot/ask', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message:', message);
        // Use Hugging Face Inference API (free-tier model)
        const HF_API_URL = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta';
        const hfHeaders = {
            'Content-Type': 'application/json',
        };
        if (process.env.HF_API_KEY) {
            hfHeaders['Authorization'] = `Bearer ${process.env.HF_API_KEY}`;
        }
        // System prompt for vermicomposting expert
        const systemPrompt = "You are a vermicomposting expert assistant. Provide helpful, accurate advice about worm composting, bin maintenance, troubleshooting, and best practices.";
        // For text-generation models, 'inputs' must be a string (not an array)
        const prompt = `${systemPrompt}\nUser: ${message}\nAssistant:`;
        const payload = {
            inputs: prompt,
            parameters: {
                max_new_tokens: 300,
                temperature: 0.7
            }
        };

        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: hfHeaders,
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Hugging Face API error (${response.status}): ${errText}`);
        }
        const data = await response.json();
        // Hugging Face returns either 'error' or an array of 'generated_text'
        let reply = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
            reply = data[0].generated_text.replace(systemPrompt, '').trim();
        } else if (data.generated_text) {
            reply = data.generated_text.replace(systemPrompt, '').trim();
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            reply = 'Sorry, I could not get a response from the AI.';
        }
        res.json({ reply });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
});

// Dashboard route
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (profileError) throw profileError;

        // Get user's bins
        const { data: bins, error: binsError } = await supabase
            .from('bins')
            .select('*')
            .eq('user_id', req.user.id);

        if (binsError) throw binsError;

        // Get recent activities
        const { data: activities, error: activitiesError } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (activitiesError) throw activitiesError;

        res.render('dashboard', {
            user: {
                ...profile,
                bins,
                activities: activities.map(activity => ({
                    ...activity,
                    date: new Date(activity.created_at).toLocaleDateString()
                }))
            },
            layout: 'layout'
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.redirect('/auth/login');
    }
});

module.exports = router;
