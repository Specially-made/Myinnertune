import stripe from 'stripe';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { userId, plan } = req.body;
      let priceId = 'price_12345'; // Replace with your test Price ID
      if (plan === 'yearly') priceId = 'price_67890'; // Add yearly Price ID if needed
      const session = await stripe(process.env.STRIPE_SECRET_KEY).checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: 'https://empathetic-position-886030.framer.app/?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://empathetic-position-886030.framer.app/',
        mode: 'subscription',
        metadata: { userId },
      });
      res.status(200).json({ url: session.url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};