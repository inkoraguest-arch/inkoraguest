import Stripe from 'stripe';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim());

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items, connectedAccountId, platformFeePercentage = 0.15 } = req.body;

        if (!items || !connectedAccountId) {
            return res.status(400).json({ error: 'Items and connectedAccountId are required' });
        }

        // Calculate total amount in cents
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0);
        
        // Calculate the platform fee
        const applicationFeeAmount = Math.round(totalAmount * platformFeePercentage);

        const origin = req.headers.origin || 'https://inkoraguest.com';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // PIX and Boleto can be added here if enabled in Stripe
            line_items: items.map(item => ({
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: item.title,
                        images: item.image_url ? [item.image_url] : [],
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity || 1,
            })),
            mode: 'payment',
            payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: connectedAccountId,
                },
            },
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/store`,
        });

        return res.status(200).json({ url: session.url });

    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
