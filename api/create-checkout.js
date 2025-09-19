import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, plan } = req.body; // plan: 'monthly', 'yearly', or 'free'
  const priceId = plan === 'monthly' ? 'price_1S8trSL2j6866hU8vDxVPuto' 
             : plan === 'yearly' ? 'price_1RrLYrL2j6866hU8pgjEhWQV' 
             : plan === 'free' ? 'price_1S06oNL2j6866hU8ousfjouy' 
             : 'price_1RrLYrL2j6866hU8pgjEhWQV'; // Default to yearly if invalid
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://empathetic-position-886030.framer.app/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://empathetic-position-886030.framer.app/cancel',
    metadata: { userId },
  });
  res.status(200).json({ url: session.url });
}