const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.SOIL_SENSOR_API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};

// POST endpoint for soil sensor data
router.post('/api/soil-data', verifyApiKey, async (req, res) => {
    const { 
        nitrogen, 
        phosphorus, 
        potassium, 
        ph, 
        temperature, 
        moisture, 
        timestamp = new Date().toISOString(),
        device_id,
        location
    } = req.body;

    // Validate required fields
    if (nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
        return res.status(400).json({ 
            error: 'Missing required fields. Required: nitrogen, phosphorus, potassium' 
        });
    }

    try {
        // Insert data into Supabase
        const { data, error } = await supabase
            .from('soil_measurements')
            .insert([{
                nitrogen,
                phosphorus,
                potassium,
                ph,
                temperature,
                moisture,
                measured_at: timestamp,
                device_id,
                location,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error saving soil data:', error);
            return res.status(500).json({ 
                error: 'Failed to save soil data',
                details: error.message 
            });
        }


        res.status(201).json({ 
            message: 'Soil data received and stored successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// GET endpoint to retrieve soil data (for testing and verification)
router.get('/api/soil-data', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('soil_measurements')
            .select('*')
            .order('measured_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        console.error('Error retrieving soil data:', error);
        res.status(500).json({ error: 'Failed to retrieve soil data' });
    }
});

module.exports = router;
