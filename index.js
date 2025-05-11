const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5001;
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.set('view engine', 'ejs');

// Serve static files from public directory
app.use(express.static('public'));

// Import routes
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const testRoutes = require('./routes/testRoutes');
const adminRoutes = require('./routes/createAdmin');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const testApiRoutes = require('./routes/testApi');
const paypackWebhook = require('./routes/paypackWebhook');

// Authentication routes
app.use('/auth', authRoutes);

// Dashboard routes (protected routes)
app.use('/dashboard', dashboardRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// Public routes should come last
app.use('/', publicRoutes);

// Test routes
app.use('/test', testRoutes);
app.use('/test-api', testApiRoutes);

// Subscription routes
app.use('/api/subscription', subscriptionRoutes);

// Paypack webhook route
app.use('/api/paypack', paypackWebhook);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
