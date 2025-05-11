const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Authentication middleware
const requireAuth = async (req, res, next) => {
    // Check for token in cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
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

// Main dashboard route
router.get('/', requireAuth, async (req, res) => {
    try {
        console.log('Dashboard route hit for user:', req.user.id);

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw profileError;
        }

        if (!profile) {
            console.error('No profile found for user:', req.user.id);
            throw new Error('Profile not found');
        }

        // Get user's bins
        const { data: bins, error: binsError } = await supabase
            .from('bins')
            .select('*')
            .eq('user_id', req.user.id);

        if (binsError) {
            console.error('Bins fetch error:', binsError);
            throw binsError;
        }

        // Get recent activities
        const { data: activities, error: activitiesError } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (activitiesError) {
            console.error('Activities fetch error:', activitiesError);
            throw activitiesError;
        }

        console.log('Rendering dashboard with data:', {
            profileId: profile.id,
            binsCount: bins.length,
            activitiesCount: activities.length
        });

        // Prepare stats
        const stats = {
            totalBins: bins?.length || 0,
            activeBins: bins?.filter(bin => bin.status === 'active').length || 0,
            needsAttention: bins?.filter(bin => bin.needs_attention).length || 0
        };

        res.render('dashboard', {
            user: {
                ...profile,
                bins: bins || [],
                activities: (activities || []).map(activity => ({
                    ...activity,
                    date: new Date(activity.created_at).toLocaleDateString()
                }))
            },
            stats: stats,
            layout: 'layout'
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.redirect('/auth/login');
    }
});

module.exports = router;
