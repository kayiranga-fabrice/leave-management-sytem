const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/dashboard', async (req, res) => {
    try {
        // Get active bins count
        const { data: bins } = await supabase
            .from('bins')
            .select('id, worm_population')
            .eq('status', 'active');

        // Get today's feedings
        const today = new Date().toISOString().split('T')[0];
        const { data: feedings } = await supabase
            .from('feeding_records')
            .select('*')
            .gte('feeding_date', today);

        // Get total harvest
        const { data: harvests } = await supabase
            .from('harvests')
            .select('quantity_kg');

        // Get recent activity
        const { data: recentActivity } = await supabase
            .from('feeding_records')
            .select('*')
            .order('feeding_date', { ascending: false })
            .limit(5);

        // Get environmental alerts
        const { data: environmentalData } = await supabase
            .from('environmental_data')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(5);

        // Calculate dashboard data
        const dashboardData = {
            activeBins: bins.length,
            totalWorms: bins.reduce((sum, bin) => sum + (bin.worm_population || 0), 0),
            todayFeedings: feedings.length,
            totalHarvest: harvests.reduce((sum, harvest) => sum + harvest.quantity_kg, 0),
            recentActivity: recentActivity.map(activity => ({
                title: 'Feeding Record',
                time: new Date(activity.feeding_date).toLocaleString(),
                description: `Fed ${activity.quantity_kg}kg of ${activity.feed_type}`
            })),
            environmentalAlerts: environmentalData
                .filter(data => {
                    // Add alert conditions
                    const tempAlert = data.temperature < 15 || data.temperature > 30;
                    const moistureAlert = data.moisture_level < 60 || data.moisture_level > 80;
                    const phAlert = data.ph_level < 6 || data.ph_level > 8;
                    return tempAlert || moistureAlert || phAlert;
                })
                .map(data => ({
                    type: 'warning',
                    title: 'Environmental Alert',
                    time: new Date(data.recorded_at).toLocaleString(),
                    message: `Bin ${data.bin_id}: ${
                        data.temperature < 15 ? 'Temperature too low' :
                        data.temperature > 30 ? 'Temperature too high' :
                        data.moisture_level < 60 ? 'Moisture too low' :
                        data.moisture_level > 80 ? 'Moisture too high' :
                        data.ph_level < 6 ? 'pH too acidic' :
                        'pH too alkaline'
                    }`
                }))
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
