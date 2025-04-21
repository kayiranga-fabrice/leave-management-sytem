const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const router = express.Router();

// Use express-ejs-layouts middleware
router.use(expressLayouts);
router.use((req, res, next) => {
    res.locals.title = '';
    res.locals.stylesheets = '';
    res.locals.scripts = '';
    next();
});

// Page Routes
router.get('/dashboard', (req, res) => {
    res.locals.title = 'Dashboard';
    res.render('dashboard');
});

router.get('/bins', (req, res) => {
    res.locals.title = 'Bins';
    res.render('bins');
});

router.get('/feeding', (req, res) => {
    res.locals.title = 'Feeding Records';
    res.render('feeding');
});

router.get('/harvests', (req, res) => {
    res.locals.title = 'Harvests';
    res.render('harvests');
});

router.get('/analytics', (req, res) => {
    res.locals.title = 'Analytics';
    res.render('analytics');
});
const VermicompostingModel = require('../models/vermicompostingModel');

// Dashboard Route
router.get('/dashboard', async (req, res) => {
  try {
    // Get all required data for the dashboard
    const [bins, environmentalData, tasks, soilData, analytics] = await Promise.all([
      VermicompostingModel.getBins(),
      VermicompostingModel.getLatestEnvironmentalData(),
      VermicompostingModel.getTasks(),
      VermicompostingModel.getSoilData(),
      VermicompostingModel.getAnalytics()
    ]);

    // Calculate total area and other metrics
    const totalArea = bins.reduce((sum, bin) => sum + bin.area, 0);
    const totalYield = analytics.totalHarvest || 0;
    const revenue = totalYield * analytics.pricePerKg || 0;

    // Format response
    const dashboardData = {
      totalArea,
      totalBeds: bins.length,
      totalYield,
      totalRevenue: revenue.toFixed(2),

      // Environmental alerts
      environmentalAlerts: environmentalData.alerts || [],

      // Tasks and reminders
      tasks: tasks.map(task => ({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate
      })),

      // Environmental conditions
      environmental: {
        temperature: environmentalData.temperature,
        humidity: environmentalData.humidity,
        moisture: environmentalData.moisture
      },

      // Soil analysis
      soil: {
        ph: soilData.ph,
        organicMatter: soilData.organicMatter,
        cnRatio: soilData.cnRatio,
        moistureContent: soilData.moistureContent
      },

      // Production data for charts
      production: analytics.monthlyProduction,
      yieldPerBed: bins.map(bin => ({
        name: bin.name,
        yield: bin.totalYield
      }))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bin Management Routes
router.post('/bins', async (req, res) => {
  try {
    const binData = req.body;
    const result = await VermicompostingModel.createBin(binData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bins', async (req, res) => {
  try {
    const bins = await VermicompostingModel.getBins();
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Worm Population Routes
router.put('/bins/:id/population', async (req, res) => {
  try {
    const { id } = req.params;
    const { population } = req.body;
    const result = await VermicompostingModel.updateWormPopulation(id, population);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feeding Record Routes
router.post('/feeding-records', async (req, res) => {
  try {
    const feedingData = req.body;
    const result = await VermicompostingModel.addFeedingRecord(feedingData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Harvest Routes
router.post('/harvests', async (req, res) => {
  try {
    const harvestData = req.body;
    const result = await VermicompostingModel.recordHarvest(harvestData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Environmental Monitoring Routes
router.post('/environmental-data', async (req, res) => {
  try {
    const envData = req.body;
    const result = await VermicompostingModel.recordEnvironmentalData(envData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Routes
router.get('/analytics/harvests', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await VermicompostingModel.getHarvestAnalytics(startDate, endDate);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
