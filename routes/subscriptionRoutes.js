const express = require('express');
const router = express.Router();
const axios = require('axios');

// Paypack configuration
const PAYPACK_CONFIG = {
    apiUrl: 'https://paypack.rw/api/v1',
    clientId: 'kayiranga',
    clientSecret: '5022dc2a-2358-11f0-a1da-dead131a2dd9',
    webhookSecret: '5022dc2a-2358-11f0-a1da-dead131a2dd9'
};

// Payment plans
const PLANS = {
    monthly: {
        amount: 1500,
        period: 'monthly',
        description: 'Monthly Tree Planting Donation'
    },
    yearly: {
        amount: 15000,
        period: 'yearly',
        description: 'Yearly Tree Planting Donation'
    }
};

// Simple test route
router.get('/test-subscription', (req, res) => res.send('Subscription route works!'));

// Simple subscription endpoint
router.post('/subscribe', async (req, res) => {
    try {
        // Calculate end date (1 month from now)
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        // Return success response
        res.json({ 
            success: true,
            message: `Subscription successful! Access granted until ${endDate.toLocaleDateString()}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dummy subscription status endpoint
router.get('/subscription-status/:user_id', async (req, res) => {
    try {
        // Always return active for testing
        res.json({ active: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize payment
router.post('/initiate-payment', async (req, res) => {
    try {
        const { phone, plan = 'monthly' } = req.body;
        
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const paymentPlan = PLANS[plan];
        if (!paymentPlan) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment plan'
            });
        }

        // First, get the access token
        const tokenResponse = await axios.post(`${PAYPACK_CONFIG.apiUrl}/auth/agents/authorize`, {
            client_id: PAYPACK_CONFIG.clientId,
            client_secret: PAYPACK_CONFIG.clientSecret
        });

        if (!tokenResponse.data || !tokenResponse.data.access) {
            throw new Error('Failed to get access token from Paypack');
        }

        const accessToken = tokenResponse.data.access;

        // Then make the payment request
        const response = await axios.post(`${PAYPACK_CONFIG.apiUrl}/transactions/cashin`, {
            amount: paymentPlan.amount,
            number: phone,
            provider: 'mtn',
            description: paymentPlan.description
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data || !response.data.id) {
            throw new Error('Invalid response from Paypack');
        }

        // Calculate subscription end date
        const endDate = new Date();
        if (plan === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        // Format date as MM/DD/YYYY
        const formattedDate = `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;

        res.json({
            success: true,
            message: `Support Our Mission\n\nYour donation helps us plant more trees, educate more people, and build a greener world.\n\n${phone}\n\nMTN\n\nMonthly (1500 RWF)\n\nSubscription successful! Access granted until ${formattedDate}`,
            data: {
                amount: paymentPlan.amount,
                phone: phone,
                provider: 'mtn',
                plan: plan,
                endDate: formattedDate,
                transactionId: response.data.id,
                status: response.data.status || 'pending'
            }
        });
    } catch (error) {
        console.error('Payment error:', error.response?.data || error.message);
        
        // Handle specific error cases
        let errorMessage = 'Payment failed. Please try again.';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.response?.data || error.message
        });
    }
});

// Verify payment status
router.get('/payment-status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        const response = await axios.get(`${PAYPACK_CONFIG.apiUrl}/payments/${transactionId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                client_id: PAYPACK_CONFIG.clientId,
                client_secret: PAYPACK_CONFIG.clientSecret
            }
        });

        res.json({
            success: true,
            status: response.data.status,
            data: response.data
        });
    } catch (error) {
        console.error('Status check error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to check payment status',
            details: error.response?.data || error.message
        });
    }
});

// Paypack webhook handler
router.post('/webhook', (req, res) => {
    try {
        const signature = req.headers['x-paypack-signature'];
        const payload = req.body;

        // Verify webhook signature
        if (signature !== PAYPACK_CONFIG.webhookSecret) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Process the webhook payload
        console.log('Received Paypack webhook:', payload);

        // Handle different webhook events
        switch (payload.event) {
            case 'checkout.completed':
                console.log('Payment completed:', payload.data);
                break;
            case 'checkout.failed':
                console.log('Payment failed:', payload.data);
                break;
            default:
                console.log('Unknown event type:', payload.event);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
