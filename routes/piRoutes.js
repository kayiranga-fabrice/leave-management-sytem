const express = require('express');
const router = express.Router();
const axios = require('axios');

// Dashboard route
router.get('/pi-dashboard', (req, res) => {
    res.render('pi-dashboard', { title: 'Raspberry Pi Dashboard' });
});

// Test endpoint to check Raspberry Pi data format
router.get('/test-pi-data', async (req, res) => {
    try {
        console.log('Attempting to connect to Raspberry Pi...');
        const response = await axios.get('http://192.168.137.240:8000/stats', {
            timeout: 5000, // 5 second timeout
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Node.js Dashboard'
            }
        });
        
        console.log('Raspberry Pi Response Status:', response.status);
        console.log('Raspberry Pi Response Headers:', response.headers);
        console.log('Raspberry Pi Response Data:', response.data);

        res.json({
            message: 'Successfully connected to Raspberry Pi',
            status: response.status,
            data: response.data,
            headers: response.headers
        });
    } catch (error) {
        console.error('Detailed Error:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            } : null
        });

        res.status(500).json({ 
            error: 'Failed to connect to Raspberry Pi',
            details: error.message,
            code: error.code
        });
    }
});

// Proxy endpoint to fetch data from Raspberry Pi
router.get('/api/pi-data', async (req, res) => {
    try {
        const response = await axios.get('http://192.168.137.240:8000/stats');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Raspberry Pi:', error);
        res.status(500).json({ error: 'Failed to fetch data from Raspberry Pi' });
    }
});

module.exports = router; 