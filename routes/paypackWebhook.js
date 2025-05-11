const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Paypack webhook secret key
const PAYPACK_SECRET_KEY = '5022dc2a-2358-11f0-a1da-dead131a2dd9';

// Verify Paypack webhook signature
const verifyWebhook = (payload, signature) => {
    const hmac = crypto.createHmac('sha256', PAYPACK_SECRET_KEY);
    hmac.update(JSON.stringify(payload));
    const calculatedSignature = hmac.digest('hex');
    return calculatedSignature === signature;
};

// Webhook endpoint
router.post('/webhook', (req, res) => {
    try {
        const signature = req.headers['x-paypack-signature'];
        const payload = req.body;

        // Verify webhook signature
        if (!verifyWebhook(payload, signature)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Process the webhook payload
        console.log('Received Paypack webhook:', payload);

        // Handle different webhook events
        switch (payload.event) {
            case 'checkout.completed':
                // Handle successful payment
                console.log('Payment completed:', payload.data);
                break;
            case 'checkout.failed':
                // Handle failed payment
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