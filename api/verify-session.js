import stripe from 'stripe';

export default async (req, res) => {
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

    if (session.payment_status === 'paid') {
      // Here you can integrate with Supabase to update the user
      // Example: Update subscription status
      // const { data, error } = await supabase
      //   .from('subscriptions')
      //   .insert({ user_id: session.metadata.userId, stripe_session_id: sessionId, status: 'active' });
      // if (error) throw new Error(error.message);

      return res.status(200).json({ message: 'Subscription confirmed', session });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};