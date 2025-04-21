const supabase = require('../config/supabase');

const VermicompostingModel = {
  // Bin management
  async createBin(binData) {
    const { data, error } = await supabase
      .from('bins')
      .insert([binData]);
    if (error) throw error;
    return data;
  },

  async getBins() {
    const { data, error } = await supabase
      .from('bins')
      .select('*');
    if (error) throw error;
    return data;
  },

  // Worm population tracking
  async updateWormPopulation(binId, population) {
    const { data, error } = await supabase
      .from('bins')
      .update({ worm_population: population })
      .eq('id', binId);
    if (error) throw error;
    return data;
  },

  // Feeding records
  async addFeedingRecord(feedingData) {
    const { data, error } = await supabase
      .from('feeding_records')
      .insert([feedingData]);
    if (error) throw error;
    return data;
  },

  // Harvest tracking
  async recordHarvest(harvestData) {
    const { data, error } = await supabase
      .from('harvests')
      .insert([harvestData]);
    if (error) throw error;
    return data;
  },

  // Environmental monitoring
  async recordEnvironmentalData(envData) {
    const { data, error } = await supabase
      .from('environmental_data')
      .insert([envData]);
    if (error) throw error;
    return data;
  },

  // Analytics
  async getHarvestAnalytics(startDate, endDate) {
    const { data, error } = await supabase
      .from('harvests')
      .select('*')
      .gte('harvest_date', startDate)
      .lte('harvest_date', endDate);
    if (error) throw error;
    return data;
  },

  // Dashboard specific methods
  async getLatestEnvironmentalData() {
    const { data, error } = await supabase
      .from('environmental_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);
    if (error) throw error;

    // Get alerts based on environmental conditions
    const alerts = [];
    if (data[0]) {
      const { temperature, humidity, moisture } = data[0];
      if (temperature > 30) alerts.push({
        type: 'warning',
        title: 'High Temperature',
        message: 'Temperature is above optimal range'
      });
      if (humidity < 60) alerts.push({
        type: 'warning',
        title: 'Low Humidity',
        message: 'Humidity is below optimal range'
      });
      if (moisture < 40) alerts.push({
        type: 'danger',
        title: 'Low Moisture',
        message: 'Bedding moisture is critically low'
      });
    }

    return { ...data[0], alerts };
  },

  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })
      .limit(5);
    if (error) throw error;
    return data;
  },

  async getSoilData() {
    const { data, error } = await supabase
      .from('soil_analysis')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data[0] || {
      ph: 0,
      organicMatter: 0,
      cnRatio: 0,
      moistureContent: 0
    };
  },

  async getAnalytics() {
    // Get total harvest and monthly production data
    const { data: harvests, error: harvestError } = await supabase
      .from('harvests')
      .select('amount, harvest_date');
    if (harvestError) throw harvestError;

    const totalHarvest = harvests.reduce((sum, h) => sum + h.amount, 0);
    
    // Calculate monthly production
    const monthlyProduction = {};
    harvests.forEach(h => {
      const month = new Date(h.harvest_date).toLocaleString('default', { month: 'short' });
      monthlyProduction[month] = (monthlyProduction[month] || 0) + h.amount;
    });

    return {
      totalHarvest,
      monthlyProduction,
      pricePerKg: 10 // Default price, should be configurable
    };
  }
};

module.exports = VermicompostingModel;
