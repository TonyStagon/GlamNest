import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async(req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    try {
        const { paymentMethodId, amount, currency } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'zar', // Force ZAR currency for all transactions
            payment_method: paymentMethodId,
            confirm: true,
            return_url: `${req.headers.origin}/order-complete`
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}