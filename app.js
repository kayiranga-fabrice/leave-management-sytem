const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const vermicompostingRoutes = require('./routes/vermicompostingRoutes');
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const voiceApi = require('./routes/voiceApi');
const piRoutes = require('./routes/piRoutes');

// Landing page route
app.get('/', (req, res) => {
    res.render('landing', { title: 'Welcome to VermiTech' });
});

app.use('/', vermicompostingRoutes);
app.use('/auth', authRoutes);
app.use('/', subscriptionRoutes);
app.use('/api/voice', voiceApi);
app.use('/', piRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
