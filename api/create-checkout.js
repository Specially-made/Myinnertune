import stripe from 'stripe';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      // Read and parse the body
      let body = {};
      if (req.body) {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } else {
        const rawBody = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', chunk => data += chunk);
          req.on('end', () => resolve(data));
          req.on('error', reject);
        });
        body = JSON.parse(rawBody || '{}');
      }
      const { userId, plan } = body;
      let priceId = 'price_1SCPV3LlHldEmgmJQ0GPau5p'; // Your monthly test Price ID
      if (plan === 'yearly') priceId = 'price_1RrIIYL2j6866hU9...'; // Replace with yearly Price ID if available
      const session = await stripe(process.env.STRIPE_SECRET_KEY).checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: 'https://empathetic-position-886030.framer.app/success?session_id={CHECKOUT_SESSION_ID}', // Confirm this
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