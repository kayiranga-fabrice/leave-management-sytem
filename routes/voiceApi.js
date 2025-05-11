// Voice Assistant API endpoint: returns a summary status for the vermicomposting system
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get system status
router.get('/status', async (req, res) => {
    try {
        // Get bin count and total worm population
        const { data: bins, error: binsError } = await supabase
            .from('bins')
            .select('id, worm_population, current_temperature, current_moisture_level, current_ph_level');
        
        if (binsError) throw binsError;

        const binCount = bins ? bins.length : 0;
        const totalWorms = bins ? bins.reduce((sum, bin) => sum + (bin.worm_population || 0), 0) : 0;
        
        // Calculate average environmental conditions
        const avgTemp = bins ? bins.reduce((sum, bin) => sum + (bin.current_temperature || 0), 0) / binCount : 0;
        const avgMoisture = bins ? bins.reduce((sum, bin) => sum + (bin.current_moisture_level || 0), 0) / binCount : 0;
        const avgPH = bins ? bins.reduce((sum, bin) => sum + (bin.current_ph_level || 0), 0) / binCount : 0;

        // Get today's feedings
        const today = new Date().toISOString().split('T')[0];
        const { data: feedings, error: feedingsError } = await supabase
            .from('feeding_records')
            .select('id, amount')
            .gte('feeding_date', today);
        
        if (feedingsError) throw feedingsError;

        const todayFeedings = feedings ? feedings.length : 0;
        const totalFoodToday = feedings ? feedings.reduce((sum, f) => sum + (f.amount || 0), 0) : 0;

        // Get recent harvests
        const { data: harvests, error: harvestsError } = await supabase
            .from('harvests')
            .select('quantity_kg')
            .order('harvest_date', { ascending: false })
            .limit(5);
        
        if (harvestsError) throw harvestsError;

        const recentHarvests = harvests ? harvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0) : 0;

        // Compose detailed status message
        const message = `System Status: ${binCount} active bins with ${totalWorms} worms. ` +
            `Average conditions: ${avgTemp.toFixed(1)}°C temperature, ${avgMoisture.toFixed(1)}% moisture, ` +
            `pH ${avgPH.toFixed(1)}. Today: ${todayFeedings} feedings (${totalFoodToday.toFixed(1)} kg), ` +
            `recent harvests: ${recentHarvests.toFixed(1)} kg.`;

        res.json({ message });
    } catch (error) {
        console.error('Voice API Error:', error);
        res.status(500).json({ 
            message: 'Unable to fetch system status.',
            error: error.message 
        });
    }
});

// Get environmental alerts
router.get('/alerts', async (req, res) => {
    try {
        const { data: bins, error } = await supabase
            .from('bins')
            .select('id, name, current_temperature, current_moisture_level, current_ph_level');
        
        if (error) throw error;

        const alerts = bins.reduce((acc, bin) => {
            const binAlerts = [];
            
            if (bin.current_temperature < 15 || bin.current_temperature > 30) {
                binAlerts.push(`Temperature ${bin.current_temperature}°C is outside optimal range (15-30°C)`);
            }
            if (bin.current_moisture_level < 60 || bin.current_moisture_level > 80) {
                binAlerts.push(`Moisture ${bin.current_moisture_level}% is outside optimal range (60-80%)`);
            }
            if (bin.current_ph_level < 6 || bin.current_ph_level > 8) {
                binAlerts.push(`pH ${bin.current_ph_level} is outside optimal range (6-8)`);
            }

            if (binAlerts.length > 0) {
                acc.push({
                    bin: bin.name,
                    alerts: binAlerts
                });
            }
            return acc;
        }, []);

        if (alerts.length === 0) {
            res.json({ message: 'No alerts at this time. All systems are operating within optimal ranges.' });
        } else {
            const message = alerts.map(a => 
                `Bin ${a.bin}: ${a.alerts.join(', ')}`
            ).join('. ');
            res.json({ message });
        }
    } catch (error) {
        console.error('Voice API Alerts Error:', error);
        res.status(500).json({ 
            message: 'Unable to fetch alerts.',
            error: error.message 
        });
    }
});

// Get feeding recommendations
router.get('/feeding-recommendations', async (req, res) => {
    try {
        const { data: bins, error } = await supabase
            .from('bins')
            .select('id, name, worm_population');
        
        if (error) throw error;

        const recommendations = bins.map(bin => {
            const recommendedAmount = (bin.worm_population || 0) * 0.5; // 0.5g per worm per day
            return {
                bin: bin.name,
                amount: recommendedAmount.toFixed(1),
                message: `Bin ${bin.name} needs ${recommendedAmount.toFixed(1)} grams of food today.`
            };
        });

        const message = recommendations.map(r => r.message).join(' ');
        res.json({ message });
    } catch (error) {
        console.error('Voice API Recommendations Error:', error);
        res.status(500).json({ 
            message: 'Unable to fetch feeding recommendations.',
            error: error.message 
        });
    }
});

module.exports = router;
