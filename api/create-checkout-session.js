import stripe from 'stripe';

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  // For now, use a hardcoded userId (replace with real auth later)
  const userId = 'test_user_id_123'; // Placeholder

  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: 'price_1SCbZtLlHldEmgmJabc123', quantity: 1 }], // Replace with your price ID
      mode: 'subscription',
      success_url: 'https://empathetic-position-886030.framer.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://empathetic-position-886030.framer.app/',
      metadata: { userId }, // Add userId to metadata
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};