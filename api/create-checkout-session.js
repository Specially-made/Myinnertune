import stripe from 'stripe';

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const userId = 'test_user_id_123'; // Hardcoded for testing

  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: 'price_1SCPV3LlHldEmgmJQ0GPau5p', quantity: 1 }], // Update with your Price ID
      mode: 'subscription',
      success_url: 'https://empathetic-position-886030.framer.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://empathetic-position-886030.framer.app/',
      metadata: { userId }, // Ensure this is included
    });

    res.status(200).json({ id: session.id, url: session.url }); // Return url for testing
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};