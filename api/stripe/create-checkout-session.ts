import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured.' });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: 'price_1UAUqaLeVTia4S5FoMwGT16Q', quantity: 1 }],
      success_url: (process.env.APP_URL || 'https://www.vstudyhub.com') + '/?payment=success',
      cancel_url: (process.env.APP_URL || 'https://www.vstudyhub.com') + '/?payment=cancelled'
    });
    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unable to create checkout session.' });
  }
}
