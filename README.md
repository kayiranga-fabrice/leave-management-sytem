# Vermicomposting Management System

A web application for managing vermicomposting operations, built with Node.js, Express, and Supabase.

## Features

- User Authentication (Login/Register)
- Bin Management
- Worm Population Tracking
- Environmental Monitoring
- Harvest Records
- Admin Dashboard

## Environment Variables

Create a `.env` file with the following variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!
