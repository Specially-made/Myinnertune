export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

import stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { plan, userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let priceId, mode;
  switch (plan) {
    case 'monthly':
      priceId = 'price_1S8trSL2j6866hU8vDxVPuto'; // Live monthly
      mode = 'subscription';
      break;
    case 'yearly':
      priceId = 'price_1RrLYrL2j6866hU8pgjEhWQV'; // Live yearly
      mode = 'subscription';
      break;
    case 'free':
      priceId = 'price_1S06oNL2j6866hU8ousfjouy'; // Live free
      mode = 'payment';
      break;
    default:
      return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      success_url: 'https://empathetic-position-886030.framer.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://empathetic-position-886030.framer.app/',
      metadata: { userId },
    });

    // Update Supabase
    if (plan === 'free') {
      await supabase
        .from('profiles') // Changed from 'users' to 'profiles'
        .update({ free_trial_used: true })
        .eq('id', userId);
    } else {
      await supabase
        .from('subscription')
        .insert({ user_id: userId, session_id: session.id, status: 'pending', price_id: priceId });
    }

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error); // Log error for debugging
    res.status(500).json({ error: error.message });
  }
};