import 'dotenv/config';
import process from 'node:process';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse incoming JSON

// Should come from .env file
let YocoSecretKey = '';
try {
    // 🛡️ Validate required payment config
    YocoSecretKey = process.env.VITE_YOCO_SECRET_KEY || '';

    if (!YocoSecretKey.length) throw new Error('ENV validation failed');
    if (YocoSecretKey.startsWith('sk_test_')) console.warn('⚠️ WARNING: Using TEST key in production');

    // Add peace-of-mind startup checks
    process.env.NODE_ENV === 'production' && !YocoSecretKey.startsWith('sk_live_') &&
        console.error('🔴 CRITICAL: Production server using non-live key');

} catch (error) {
    console.error('💀 FATAL: Payment config validation failed');
    console.error('- Detail:', error.message);
    console.error('- Verify:');
    console.error('  • .env exists');
    console.error(`  • Entry: VITE_YOCO_SECRET_KEY=${process.env.VITE_YOCO_SECRET_KEY ? '[HIDDEN]' : '[MISSING]'}`);
    process.exit(1);
}

// Security logging shows only snippet
console.log('🔐 Payment Gateway Active');
console.log('• Yoco Live Mode:', YocoSecretKey.startsWith('sk_live_'));
if (YocoSecretKey.length > 12) {
    console.log('• Yoco Key:', `${YocoSecretKey.substring(0, 2)}...${YocoSecretKey.substring(-4)}`);
}

// Encapsulated checkout creation logic
async function checkoutCreateHandler(req, res) {
    const { amount, currency = 'ZAR' } = req.body;

    console.log('📝 Received checkout request:', { amount, currency, type: typeof amount });

    // 🛡️ Validate request data
    if (!amount || amount < 2) { // Now checks cents (minimum R2.00)
        return res.status(400).json({
            success: false,
            error: 'Amount is required and must be at least R2'
        });
    }

    // Amount should already be in cents from frontend
    const amountInCents = Math.round(amount);

    console.log('💰 Amount conversion:', {
        originalAmount: amount,
        amountInCents: amountInCents,
        currency: currency
    });

    // Create checkout payload with FIXED URL logic
    const isProduction = process.env.NODE_ENV === 'production';
    const isLiveKey = YocoSecretKey.startsWith('sk_live_');
    const isSecure = req.socket && req.socket.encrypted ||
        req.headers['x-forwarded-proto'] === 'https' ||
        req.headers['x-forwarded-ssl'] === 'on';

    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

    // Use HTTPS for production/live keys, otherwise use request protocol or force from env
    // For live keys, always use HTTPS
    const protocol = isLiveKey ? 'https' :
        (isProduction ? 'https' :
            (process.env.FORCE_HTTPS === 'true' ? 'https' :
                (req.headers['x-forwarded-proto'] || (isLocalhost ? 'http' : 'https'))));

    const host = req.headers['x-forwarded-host'] || req.hostname || (isProduction ? 'your-production-domain.com' : 'localhost:5173');
    const defaultBaseUrl = `${protocol}://${host}`;

    let baseUrl = defaultBaseUrl;

    // Priority order for determining base URL:
    // 1. Environment variable (most reliable)
    // 2. Origin header (second most reliable)
    // 3. Constructed URL (fallback)
    if (process.env.FRONTEND_URL) {
        // For live keys, enforce HTTPS regardless of FRONTEND_URL
        if (YocoSecretKey.startsWith('sk_live_') && !process.env.FRONTEND_URL.startsWith('https://')) {
            baseUrl = `https://${process.env.FRONTEND_URL.replace(/^https?:\/\//, '')}`;
        } else {
            baseUrl = process.env.FRONTEND_URL.includes('://') ?
                process.env.FRONTEND_URL :
                `${protocol}://${process.env.FRONTEND_URL}`;
        }
    } else if (req.headers.origin) {
        baseUrl = req.headers.origin;
    }

    console.log('🌐 Configured redirect URLs:', {
        protocol,
        isProduction,
        isSecure,
        isLocalhost,
        host,
        origin: req.headers.origin,
        frontendUrl: process.env.FRONTEND_URL,
        finalBaseUrl: baseUrl,
        warning: isProduction && protocol === 'http' ? '⚠️ Using HTTP in production' : null
    });

    const payload = {
        amount: amountInCents,
        currency: currency,
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-cancelled`,
        failureUrl: `${baseUrl}/payment-failed`
    };

    console.log('🚀 Creating Yoco checkout:', payload);
    console.log('🔑 Authorization header:', `Bearer ${YocoSecretKey.substring(0, 10)}...`);

    try {
        console.log('\n🔵 STARTING YOCO CHECKOUT CREATION');
        console.log(`🔗 Endpoint: https://payments.yoco.com/api/checkouts`);
        console.log(`📦 Request payload: ${JSON.stringify(payload)}`);

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

        console.log('✅ Checkout created successfully:');
        console.log(`✉️ Response status: ${response.status}`);
        console.log(`📜 Response data: ${JSON.stringify(response.data, null, 2)}`);

        res.status(200).json({
            success: true,
            checkoutId: response.data.id,
            redirectUrl: response.data.redirectUrl,
            data: response.data
        });

    } catch (error) {
        console.log('\n🔴 CHECKOUT CREATION FAILED');
        console.error('❌ Checkout creation failed - Full error details:');
        console.error('Request payload:', payload);
        console.error('Error status:', error.response && error.response.status);
        console.error('Error data:', error.response && JSON.stringify(error.response.data, null, 2));

        let errorMessage = 'Checkout creation failed';
        let statusCode = 500;

        if (error.response) {
            const errorData = error.response.data;
            statusCode = error.response.status;

            if (errorData && errorData.error && errorData.error.message) {
                errorMessage = errorData.error.message;
            } else if (errorData && errorData.message) {
                errorMessage = errorData.message;
            } else if (error.response.status === 400) {
                errorMessage = 'Invalid checkout details - check amount and currency';
            } else if (error.response.status === 401) {
                errorMessage = 'Invalid API key - check your Yoco secret key';
            } else if (error.response.status === 403) {
                errorMessage = 'Forbidden - check API key permissions';
            }
        } else if (error.request) {
            errorMessage = 'Network error - unable to reach Yoco servers';
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.response && error.response.data || error.message,
            statusCode: statusCode
        });
    }
}

// New endpoint with extracted handler
app.post('/checkout/create', checkoutCreateHandler);

// Legacy endpoint (deprecated)
app.post('/create-checkout', (req, res) => {
    console.warn('⚠️ Deprecated API route called - migrate to /checkout/create');
    checkoutCreateHandler(req, res);
});

// 🔄 NEW: Webhook endpoint to verify payment success
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    console.log('\n🔔 WEBHOOK RECEIVED');

    try {
        const event = JSON.parse(req.body);
        console.log('📨 Webhook event:', {
            type: event.type,
            id: event.id,
            created: event.created
        });

        // Verify webhook signature (recommended for production)
        // const signature = req.headers['x-yoco-signature'];
        // if (!verifyWebhookSignature(req.body, signature)) {
        //     return res.status(401).json({ error: 'Invalid signature' });
        // }

        // Handle different event types
        switch (event.type) {
            case 'payment.succeeded':
                console.log('✅ Payment succeeded:', {
                    paymentId: event.payload.id,
                    amount: event.payload.amount,
                    currency: event.payload.currency,
                    status: event.payload.status
                });

                // TODO: Update your database, send confirmation email, etc.
                handleSuccessfulPayment(event.payload);
                break;

            case 'payment.failed':
                console.log('❌ Payment failed:', {
                    paymentId: event.payload.id,
                    failureReason: event.payload.failureReason
                });

                // TODO: Handle failed payment
                handleFailedPayment(event.payload);
                break;

            case 'checkout.completed':
                console.log('🏁 Checkout completed:', {
                    checkoutId: event.payload.id,
                    status: event.payload.status
                });
                break;

            default:
                console.log('ℹ️ Unhandled event type:', event.type);
        }

        // Always respond with 200 to acknowledge receipt
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        res.status(400).json({ error: 'Invalid webhook payload' });
    }
});

/** Webhook Security Requirements (TODO before production) **/
//
// 1. Set WEBHOOK_SECRET in .env from Yoco dashboard
// 2. Implement signature verification:
/*
const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

if (!require('tsscmp').tsscmp(req.headers['x-yoco-signature'], expectedSignature)) {
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
}
*/

// 📋 Handle successful payment
function handleSuccessfulPayment(paymentData) {
    console.log('🎉 Processing successful payment:', paymentData);

    // TODO: Add your business logic here:
    // - Update order status in database
    // - Send confirmation email
    // - Update inventory
    // - Generate invoice
    // - Trigger fulfillment process
}

// 📋 Handle failed payment
function handleFailedPayment(paymentData) {
    console.log('💥 Processing failed payment:', paymentData);

    // TODO: Add your business logic here:
    // - Update order status
    // - Send failure notification
    // - Log for analysis
}

// 🔍 NEW: Check payment status endpoint
// New API with validation and better error handling
app.get('/checkout/status/:checkoutId', async(req, res) => {
    if (!req.params.checkoutId) {
        return res.status(400).json({ error: 'Missing checkout ID parameter' });
    }

    const { checkoutId } = req.params;

    try {
        const response = await axios.get(
            `https://payments.yoco.com/api/checkouts/${checkoutId}`, {
                headers: {
                    Authorization: `Bearer ${YocoSecretKey}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log('📊 Checkout status:', response.data);

        res.json({
            success: true,
            status: response.data.status,
            paymentId: response.data.paymentId,
            data: response.data
        });

    } catch (error) {
        console.error('❌ Status check failed:', error.response && error.response.data);
        res.status(500).json({
            success: false,
            error: 'Failed to check payment status'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Yoco Checkout API Server',
        environment: process.env.NODE_ENV || 'development',
        isLiveMode: YocoSecretKey.startsWith('sk_live_')
    });
});

// 🎯 Payment success/failure/cancel pages (optional - for redirect URLs)
app.get('/payment-success', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Payment Successful</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
                    .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #28a745; margin-bottom: 20px; }
                    button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
                    button:hover { background: #0056b3; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Payment Successful!</h1>
                    <p>Your payment has been processed successfully.</p>
                    <p>You will be redirected shortly or click the button below.</p>
                    <button onclick="window.location.href='${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success'">Continue</button>
                </div>
                <script>
                    setTimeout(() => {
                        window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success';
                    }, 3000);
                </script>
            </body>
        </html>
    `);
});

app.get('/payment-cancelled', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Payment Cancelled</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
                    .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #ff9800; margin-bottom: 20px; }
                    button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px; }
                    button:hover { background: #0056b3; }
                    .cancel-btn { background: #6c757d; } .cancel-btn:hover { background: #545b62; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>⚠️ Payment Cancelled</h1>
                    <p>You cancelled the payment process.</p>
                    <p>You will be redirected shortly or click a button below.</p>
                    <button onclick="window.location.href='${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancelled'">View Details</button>
                    <button class="cancel-btn" onclick="window.location.href='${process.env.FRONTEND_URL || 'http://localhost:5173'}'">Home</button>
                </div>
                <script>
                    setTimeout(() => {
                        window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancelled';
                    }, 3000);
                </script>
            </body>
        </html>
    `);
});

app.get('/payment-failed', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Payment Failed</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
                    .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #dc3545; margin-bottom: 20px; }
                    button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px; }
                    button:hover { background: #0056b3; }
                    .retry-btn { background: #dc3545; } .retry-btn:hover { background: #c82333; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>❌ Payment Failed</h1>
                    <p>Your payment could not be processed.</p>
                    <p>You will be redirected shortly or click a button below.</p>
                    <button class="retry-btn" onclick="window.location.href='${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed'">View Details</button>
                    <button onclick="window.location.href='${process.env.FRONTEND_URL || 'http://localhost:5173'}'">Home</button>
                </div>
                <script>
                    setTimeout(() => {
                        window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed';
                    }, 3000);
                </script>
            </body>
        </html>
    `);
});

const PORT = process.env.PORT || 5000;
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

app.listen(PORT, () => {
    console.log(`🚀 Payment API running on ${protocol}://localhost:${PORT}`);
    console.log(`• Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`• Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📡 Webhook endpoint: ${protocol}://localhost:${PORT}/webhook`);
    console.log(`🏥 Health check: ${protocol}://localhost:${PORT}/health`);
    console.log(`💡 Tip: Set FRONTEND_URL in .env for custom frontend URL`);
});