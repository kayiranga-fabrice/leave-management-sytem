const express = require('express');
const app = express();
const port = 3000;
// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Import routes
const authRoutes = require('./routes/authRoutes');

// Middleware to parse incoming form data
app.use(express.urlencoded({ extended: true }));

// Use the auth routes
app.use('/', authRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

