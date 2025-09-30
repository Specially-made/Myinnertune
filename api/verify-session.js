import stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const supabase = createClient(
  'https://nvfmajquddrlzuqmjaig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Zm1hanF1ZGRybHp1cW1qYWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTA2NTgsImV4cCI6MjA3Mzc2NjY1OH0.0bfaCXQirMVg6BEy4Ib0UG1EQB8yhwBlkzcJmBe2DWA'
);

const corsMiddleware = cors({
  origin: 'https://empathetic-position-886030.framer.app',
  methods: ['GET'],
});

export default async (req, res) => {
  corsMiddleware(req, res, () => {});

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    console.log('Session Data:', session);

    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId; // May be undefined
      if (!userId) {
        return res.status(400).json({ error: 'userId is missing in session metadata' });
      }

      const { data, error } = await supabase.from('subscriptions').insert({
        user_id: userId,
        session_id: sessionId,
        payment_status: session.payment_status,
      });

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      return res.status(200).json({ message: 'Subscription confirmed', session });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};