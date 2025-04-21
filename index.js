const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Import routes
const publicRoutes = require('./routes/publicRoutes');
const vermicompostingRoutes = require('./routes/vermicompostingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const adminRoutes = require('./routes/createAdmin');

const testApiRoutes = require('./routes/testApi');

// Public routes must come first
app.use('/', publicRoutes);

// Authentication routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Protected routes (auth required)
app.use('/api/vermicomposting', vermicompostingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/test', testRoutes);

app.use('/test-api', testApiRoutes);

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Start the server
const host = '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Vermicomposting Management System running at http://${host}:${port}`);
  console.log('Local access: http://localhost:' + port);
  const networkInterfaces = require('os').networkInterfaces();
  for (const iface of Object.values(networkInterfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        console.log(`Network access: http://${alias.address}:${port}`);
      }
    }
  }
});
