// Paypack payment and subscription logic for vermicomposting system
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Utility: get Paypack token (with caching)
let paypackToken = null;
let paypackTokenExpiry = null;

async function getPaypackToken() {
    const now = Date.now();
    if (paypackToken && paypackTokenExpiry && now < paypackTokenExpiry) {
        return paypackToken;
    }
    // Request a new token using API Key and Secret
    // Support both legacy and new env variable names
    const apiKey = process.env.PAYPACK_API_KEY || process.env.PAYPACK_APP_KEY;
    const apiSecret = process.env.PAYPACK_API_SECRET || process.env.PAYPACK_SECRET_KEY;
    if (!apiKey || !apiSecret) throw new Error('Paypack API Key/Secret missing in .env (tried PAYPACK_API_KEY/PAYPACK_API_SECRET and PAYPACK_APP_KEY/PAYPACK_SECRET_KEY)');
    const response = await axios.post('https://api.paypack.rw/v1/auth/agents/authorize', {
        api_key: apiKey,
        api_secret: apiSecret
    });
    paypackToken = response.data.access_token;
    // Paypack tokens are valid for 1 hour (3600s)
    paypackTokenExpiry = now + (response.data.expires_in ? response.data.expires_in * 1000 : 3500 * 1000);
    return paypackToken;
}

// 1. Collect payment
async function collectPayment({ amount, number, provider, description }) {
    const token = await getPaypackToken();
    const response = await axios.post('https://api.paypack.rw/v1/transactions', {
        amount,
        number,
        provider,
        description
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// 2. Store/Update subscription in Supabase
async function saveSubscription({ user_id, start_date, end_date, payment_status }) {
    const { data, error } = await supabase
        .from('subscriptions')
        .upsert([{ user_id, start_date, end_date, payment_status }], { onConflict: ['user_id'] });
    if (error) throw error;
    return data;
}

// 3. Check subscription status
async function isSubscriptionActive(user_id) {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('end_date')
        .eq('user_id', user_id)
        .single();
    if (error) throw error;
    if (!data) return false;
    return new Date(data.end_date) > new Date();
}

module.exports = { collectPayment, saveSubscription, isSubscriptionActive };
