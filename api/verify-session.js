import stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const supabase = createClient(
  'https://nvfmajquddrlzuqmjaig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Zm1hanF1ZGRybHp1cW1qYWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5MDY1OCwiZXhwIjoyMDczNzY2NjU4fQ.8vQeL2p9kJ5mN4rX7oPqA1B2cD3eF4gH5iJ6kL7mN8o' // Service role key
);

const corsMiddleware = cors({
  origin: 'https://myinnertune-dtfoweg73-tobiaswedler-2383s-projects.vercel.app',
  methods: ['GET', 'OPTIONS'],
});

export default async (req, res) => {
  corsMiddleware(req, res, () => {});

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const sessionId = req.query.session_id;
    console.log('Received sessionId:', sessionId);
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY || '');
    console.log('Stripe key loaded:', process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No');
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session retrieved:', session);

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId || 'test_user_123'; // Default test user ID
      console.log('User ID:', userId);
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(
          { user_id: userId, session_id: sessionId, payment_status: session.payment_status },
          { onConflict: ['user_id', 'session_id'] }
        );

      if (error) {
        console.error('Supabase Error:', error.message);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Subscription confirmed', session });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'missing_required_param') {
      return res.status(400).json({ error: 'Invalid Stripe session ID' });
    }
    return res.status(500).json({ error: error.message });
  }
};