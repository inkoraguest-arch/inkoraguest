import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, existingAccountId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        let accountId = existingAccountId;

        // Create a new connected account if one doesn't exist
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    userId: userId
                }
            });
            accountId = account.id;
        }

        // Create the onboarding link
        const origin = req.headers.origin || 'https://inkoraguest.com';
        
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/profile?stripe=refresh`,
            return_url: `${origin}/profile?stripe=success`,
            type: 'account_onboarding',
        });

        return res.status(200).json({ 
            url: accountLink.url, 
            accountId: accountId 
        });

    } catch (error) {
        console.error('Stripe Onboarding Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
