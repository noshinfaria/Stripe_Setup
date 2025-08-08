const express = require('express');
const stripe = require('stripe')('sk_test_'); // Replace with your secret key
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use(cors());

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;

        console.log('Creating payment intent for amount:', amount);

        // Validate amount
        if (!amount || amount < 50) { // Minimum 50 cents
            return res.status(400).json({
                error: 'Amount must be at least 50 cents'
            });
        }

        if (amount > 99999999) { // Maximum amount check
            return res.status(400).json({
                error: 'Amount is too large'
            });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                timestamp: new Date().toISOString()
            }
        });

        console.log('Payment intent created:', paymentIntent.id);

        res.json({
            client_secret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            error: 'Failed to create payment intent: ' + error.message
        });
    }
});

// Get payment intent status (optional - for checking payment status)
app.get('/payment-intent/:id', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
        });
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        res.status(500).json({
            error: 'Failed to retrieve payment intent'
        });
    }
});

// Webhook endpoint to handle Stripe events (optional but recommended)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'whsec_your_webhook_secret_here'; // Replace with your webhook secret

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log('Webhook signature verification failed.', err.message);
        return res.status(400).send('Webhook signature verification failed.');
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Handle successful payment here (save to database, send email, etc.)
            break;
        
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            // Handle failed payment here
            break;

        case 'payment_intent.created':
            console.log('Payment intent created:', event.data.object.id);
            break;

        default:
            console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        stripe_connected: !!stripe
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure to update your Stripe keys before testing!');
});