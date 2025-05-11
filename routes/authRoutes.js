const express = require('express');
const router = express.Router();
const path = require('path');
const supabase = require('../config/supabase');

// Authentication middleware
const requireAuth = async (req, res, next) => {
    // Check token from cookie first
    const cookieToken = req.cookies.token;
    // Then check Authorization header
    const headerToken = req.headers.authorization?.split(' ')[1];
    // Use cookie token if available, otherwise use header token
    const token = cookieToken || headerToken;

    if (!token) {
        console.log('No token found, redirecting to login');
        return res.redirect('/auth/login');
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) {
            console.error('Token validation error:', error);
            throw error;
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
};

// Login page route
router.get('/login', (req, res) => {
    res.render('login', { layout: 'layout' });
});

// Register page route
router.get('/register', (req, res) => {
    res.render('register', { layout: 'layout' });
});

// Handle login POST request
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    try {
        // Attempt to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return res.status(500).json({
                success: false,
                error: 'Error fetching user profile'
            });
        }

        // Set session token in cookie
        res.cookie('token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Store user data in session
        req.session.user = data.user;
        req.session.token = data.session.access_token;

        // Send success response
        res.json({
            success: true,
            message: 'Login successful!',
            token: data.session.access_token,
            redirect: profile.role === 'admin' ? '/admin/dashboard' : '/dashboard',
            role: profile.role || 'user'
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(401).json({ error: error.message, details: error });
    }
});

// Handle register POST request
router.post('/register', async (req, res) => {
    console.log('Registration endpoint hit');
    const { email, password, name } = req.body;

    console.log('Registration data:', { email, name, passwordLength: password?.length });

    // Server-side validation
    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            error: 'Name must be at least 2 characters long'
        });
    }

    if (!email || !email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)) {
        return res.status(400).json({
            success: false,
            error: 'Please enter a valid email address'
        });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long'
        });
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered. Please login instead.'
            });
        }

        // Create user in Supabase Auth
        console.log('Creating user in Supabase Auth...');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) {
            console.error('Supabase Auth Error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'Registration failed'
            });
        }

        if (!data.user) {
            return res.status(400).json({
                success: false,
                error: 'Registration failed. Please try again.'
            });
        }

        console.log('User created successfully:', data.user.id);

        try {
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
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create user profile'
                });
            }

            console.log('Profile created successfully');
            
            // Create default bin for the user
            const { error: binError } = await supabase
                .from('bins')
                .insert([
                    {
                        name: 'My First Bin',
                        user_id: data.user.id,
                        status: 'active',
                        description: 'Default vermicomposting bin'
                    }
                ]);

            if (binError) {
                console.error('Bin Creation Error:', binError);
                // Non-critical error, continue with registration
            }

            // Create a session for the user
            const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (sessionError) {
                console.error('Session creation error:', sessionError);
                return res.status(401).json({ 
                    success: false,
                    error: 'Registration successful, but login failed. Please log in manually.',
                    redirect: '/auth/login'
                });
            }

            // Set authorization header for future requests
            res.cookie('token', sessionData.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Store user data in session
            req.session.user = sessionData.user;
            req.session.token = sessionData.session.access_token;

            // Send success response
            return res.json({
                success: true,
                message: 'Registration successful! Redirecting to dashboard...',
                redirect: '/dashboard',
                token: sessionData.session.access_token
            });
        } catch (error) {
            console.error('Registration process error:', error);
            return res.status(500).json({
                success: false,
                error: 'Registration failed. Please try again.'
            });
        }
    } catch (error) {
        console.error('Registration Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        return res.status(500).json({
            success: false,
            error: error.message || 'Registration failed. Please try again.'
        });
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
// Dashboard route
router.get('/dashboard', requireAuth, (req, res) => {
    try {
        console.log('Dashboard route hit for user:', req.user.id);
        
        // Create a basic user object with just the necessary properties
        const user = {
            id: req.user.id,
            email: req.user.email || '',
            name: req.user.user_metadata?.full_name || 'User'
        };

        // Render the dashboard with minimal data
        res.render('dashboard', {
            user: user,
            bins: [],
            activities: [],
            layout: 'layout'
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.redirect('/auth/login');
    }
});

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

