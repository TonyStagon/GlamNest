import 'dotenv/config';
import process from 'node:process';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Load Yoco configuration
let YocoSecretKey = '';
try {
    YocoSecretKey = process.env.VITE_YOCO_SECRET_KEY || '';
    if (!YocoSecretKey.length) throw new Error('ENV validation failed');
    if (YocoSecretKey.startsWith('sk_test_')) console.warn('⚠️ WARNING: Using TEST key in production');
    process.env.NODE_ENV === 'production' && !YocoSecretKey.startsWith('sk_live_') &&
        console.error('🔴 CRITICAL: Production server using non-live key');
} catch (error) {
    console.error('💀 FATAL: Payment config validation failed');
    process.exit(1);
}

console.log('🔐 Payment Gateway Active');
console.log('• Yoco Live Mode:', YocoSecretKey.startsWith('sk_live_'));

// Checkout creation handler
async function checkoutCreateHandler(req, res) {
    const { amount, currency = 'ZAR' } = req.body;
    console.log('📝 Received checkout request:', { amount, currency });

    if (!amount || amount < 2) {
        return res.status(400).json({
            success: false,
            error: 'Amount is required and must be at least R2'
        });
    }

    const amountInCents = Math.round(amount);
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://localhost:5173`;

    const payload = {
        amount: amountInCents,
        currency: currency,
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-cancelled`,
        failureUrl: `${baseUrl}/payment-failed`
    };

    try {
        const response = await axios.post(
            'https://payments.yoco.com/api/checkouts',
            payload, {
                headers: {
                    Authorization: `Bearer ${YocoSecretKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        res.status(200).json({
            success: true,
            checkoutId: response.data.id,
            redirectUrl: response.data.redirectUrl,
        });

    } catch (error) {
        console.error('❌ Checkout creation failed:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create checkout session'
        });
    }
}

// API endpoints
app.post('/checkout/create', checkoutCreateHandler);
app.post('/create-checkout', checkoutCreateHandler); // Legacy endpoint

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Yoco Checkout API',
        environment: process.env.NODE_ENV || 'development'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Payment API running on http://localhost:${PORT}`);
    console.log(`• Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`• Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});