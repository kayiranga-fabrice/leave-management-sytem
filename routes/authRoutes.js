const express = require('express');
const router = express.Router();
const path = require('path');
const supabase = require('../config/supabase');

// Authentication middleware
const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Login page route
router.get('/login', (req, res) => {
    res.render('login');
});

// Register page route
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle login POST request
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: password ? '***' : undefined });

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        console.log('Supabase signInWithPassword:', { data, error });

        if (error) {
            console.error('Supabase Auth Error:', error);
            throw error;
        }

        // Get user role from profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
        console.log('Profile lookup:', { profile, profileError });

        if (profileError) {
            console.error('Profile Table Error:', profileError);
            throw profileError;
        }

        if (profile?.role === 'admin') {
            res.json({
                token: data.session.access_token,
                redirect: '/admin/dashboard',
                role: 'admin'
            });
        } else {
            res.json({
                token: data.session.access_token,
                redirect: '/dashboard',
                role: 'user'
            });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(401).json({ error: error.message, details: error });
    }
});

// Handle register POST request
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    console.log('Registration attempt for:', email);

    try {
        // Create user in Supabase Auth
        console.log('Creating user in Supabase Auth...');
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error('Supabase Auth Error:', error);
            throw error;
        }

        console.log('User created successfully:', data.user.id);

        // Create profile in profiles table
        console.log('Creating profile in profiles table...');
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    name,
                    role: 'user',
                    email
                }
            ]);

        if (profileError) {
            console.error('Profile Creation Error:', profileError);
            throw profileError;
        }

        console.log('Profile created successfully');
        res.json({ message: 'Registration successful! Please check your email for verification.' });
    } catch (error) {
        console.error('Registration Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        res.status(400).json({ error: error.message });
    }
});

// Logout route
router.post('/logout', async (req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        res.status(500).json({ error: error.message });
    } else {
        res.json({ message: 'Logged out successfully' });
    }
});

// Protected routes
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

