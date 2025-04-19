const express = require('express');
const router = express.Router();
const path = require('path');  // Import path module

// Simple user credentials (hardcoded for demonstration)
const users = {
  user: { password: 'password', role: 'user' },
  admin: { password: 'adminpass', role: 'admin' }
};

// Simple in-memory leave requests for demonstration
let leaveRequests = [
  { username: 'user', startDate: '2024-10-01', endDate: '2024-10-05', reason: 'Personal' }
];

// Home route - Serving the login form
router.get('/', (req, res) => {
  const loginPagePath = path.join(__dirname, '..', 'views', 'login.html');
  res.sendFile(loginPagePath); // Serve the login HTML file
});

// Register page route
router.get('/register', (req, res) => {
  const registerPagePath = path.join(__dirname, '..', 'views', 'register.html');
  res.sendFile(registerPagePath);
});

// About page route
router.get('/about', (req, res) => {
  const aboutPagePath = path.join(__dirname, '..', 'views', 'about.html');
  res.sendFile(aboutPagePath); // Serve the about HTML file
});

// Admin route - View all leave requests
router.get('/admin/leave-requests', (req, res) => {
  const isAdmin = req.body.username === 'admin'; // For now, we are just using this to check if username is admin.
  
  if (!isAdmin) {
    return res.send('Access denied. You must be an admin to view this page.');
  }

  res.render('admin/leave-requests', { leaveRequests });  // Render the leave requests page
});

// Admin route - Approve leave request
router.post('/admin/leave-requests/approve', (req, res) => {
  const { requestId } = req.body;
  
  // Ensure the requestId is valid
  if (requestId >= 0 && requestId < leaveRequests.length) {
    leaveRequests[requestId].status = 'Approved';
    res.send('Leave request approved successfully! <br><a href="/admin/leave-requests">Go back to requests</a>');
  } else {
    res.send('Invalid request ID.');
  }
});

// Admin route - Reject leave request
router.post('/admin/leave-requests/reject', (req, res) => {
  const { requestId } = req.body;
  
  // Ensure the requestId is valid
  if (requestId >= 0 && requestId < leaveRequests.length) {
    leaveRequests[requestId].status = 'Rejected';
    res.send('Leave request rejected successfully! <br><a href="/admin/leave-requests">Go back to requests</a>');
  } else {
    res.send('Invalid request ID.');
  }
});

// User route - View their own leave history
router.get('/user/leave-history', (req, res) => {
  const username = 'user';  // For demo purposes, we're using a hardcoded username.
  
  // Filter leave requests for the logged-in user
  const userLeaveRequests = leaveRequests.filter(request => request.username === username);
  
  res.render('user/leave-history', { leaveRequests: userLeaveRequests });  // Render user-specific leave history
});

// User Dashboard route - after login
router.get('/dashboard', (req, res) => {
  const username = 'user'; // Here, we'll assume 'user' is logged in for demo purposes.
  
  // Render the dashboard view and pass the leave requests data
  res.render('user/dashboard', { leaveRequests });
});

// Handle login POST request
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple authentication logic
  if (users[username] && users[username].password === password) {
    const role = users[username].role;

    if (role === 'admin') {
      res.send('Admin login successful! <br><a href="/admin/leave-requests">View Leave Requests</a>');
    } else {
      res.send('User login successful! <br><a href="/dashboard">Go to Dashboard</a>');
    }
  } else {
    res.send('Invalid credentials. Please try again.');
  }
});

// Handle register POST request (optional)
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send('Please provide both username and password.');
  }

  if (users[username]) {
    return res.send('User already exists.');
  }

  users[username] = { password, role: 'user' };  // Default role is 'user'
  res.send('User registered successfully! <br><a href="/">Go to Login</a>');
});

// Handle leave request submission
router.post('/leave-request', (req, res) => {
  const { startDate, endDate, reason } = req.body;
  const username = 'user'; // For demo, we assume 'user' is applying for leave

  if (!startDate || !endDate || !reason) {
    return res.send('All fields are required!');
  }

  // Save the leave request (here we are pushing it to the in-memory array)
  leaveRequests.push({ username, startDate, endDate, reason });

  res.send('Leave request submitted successfully! <br><a href="/dashboard">Go to Dashboard</a>');
});

module.exports = router;

