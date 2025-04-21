const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Test authentication
router.post('/test-auth', async (req, res) => {
    try {
        // Test user registration
        const testEmail = `test${Date.now()}@example.com`;
        const testPassword = 'password123';
        
        // 1. Register test user
        const { data: registerData, error: registerError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword
        });

        if (registerError) throw registerError;

        // 2. Login test user
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError) throw loginError;

        res.json({
            success: true,
            message: 'Authentication test successful',
            registerData,
            loginData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test bin creation and retrieval
router.post('/test-bin', async (req, res) => {
    try {
        // Create a test bin
        const binData = {
            name: `Test Bin ${Date.now()}`,
            setup_date: new Date().toISOString(),
            worm_population: 1000,
            current_temperature: 25.5,
            current_moisture_level: 70.0,
            current_ph_level: 7.0,
            status: 'active'
        };

        const { data: newBin, error: createError } = await supabase
            .from('bins')
            .insert([binData])
            .select()
            .single();

        if (createError) throw createError;

        // Retrieve the created bin
        const { data: retrievedBin, error: retrieveError } = await supabase
            .from('bins')
            .select('*')
            .eq('id', newBin.id)
            .single();

        if (retrieveError) throw retrieveError;

        res.json({
            success: true,
            message: 'Bin creation and retrieval test successful',
            createdBin: newBin,
            retrievedBin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test feeding record
router.post('/test-feeding', async (req, res) => {
    try {
        // First create a test bin
        const { data: bin, error: binError } = await supabase
            .from('bins')
            .insert([{
                name: `Test Bin ${Date.now()}`,
                setup_date: new Date().toISOString(),
                status: 'active'
            }])
            .select()
            .single();

        if (binError) throw binError;

        // Create a feeding record
        const feedingData = {
            bin_id: bin.id,
            feed_type: 'Kitchen Scraps',
            quantity_kg: 2.5,
            notes: 'Test feeding record'
        };

        const { data: feeding, error: feedingError } = await supabase
            .from('feeding_records')
            .insert([feedingData])
            .select()
            .single();

        if (feedingError) throw feedingError;

        res.json({
            success: true,
            message: 'Feeding record test successful',
            bin,
            feeding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test harvest record
router.post('/test-harvest', async (req, res) => {
    try {
        // First create a test bin if none exists
        const { data: bin, error: binError } = await supabase
            .from('bins')
            .insert([{
                name: `Test Bin ${Date.now()}`,
                setup_date: new Date().toISOString(),
                status: 'active'
            }])
            .select()
            .single();

        if (binError) throw binError;

        // Create a harvest record
        const harvestData = {
            bin_id: bin.id,
            harvest_date: new Date().toISOString(),
            quantity_kg: 5.0,
            quality_rating: 4,
            notes: 'Test harvest record'
        };

        const { data: harvest, error: harvestError } = await supabase
            .from('harvests')
            .insert([harvestData])
            .select()
            .single();

        if (harvestError) throw harvestError;

        res.json({
            success: true,
            message: 'Harvest record test successful',
            bin,
            harvest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test environmental data recording
router.post('/test-environmental', async (req, res) => {
    try {
        // First create a test bin if none exists
        const { data: bin, error: binError } = await supabase
            .from('bins')
            .insert([{
                name: `Test Bin ${Date.now()}`,
                setup_date: new Date().toISOString(),
                status: 'active'
            }])
            .select()
            .single();

        if (binError) throw binError;

        // Create environmental data record
        const envData = {
            bin_id: bin.id,
            temperature: 25.5,
            moisture_level: 70.0,
            ph_level: 7.0,
            notes: 'Test environmental record'
        };

        const { data: environmental, error: envError } = await supabase
            .from('environmental_data')
            .insert([envData])
            .select()
            .single();

        if (envError) throw envError;

        res.json({
            success: true,
            message: 'Environmental data test successful',
            bin,
            environmental
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
