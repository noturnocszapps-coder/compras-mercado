import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-11-preview' as any,
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, userEmail, plan } = req.body;

  if (!userId || !plan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Secure mapping of plans to price IDs (completely server-side)
  let priceId = '';
  switch (plan) {
    case 'premium_monthly': priceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY || ''; break;
    case 'premium_yearly': priceId = process.env.STRIPE_PRICE_PREMIUM_YEARLY || ''; break;
    case 'family': priceId = process.env.STRIPE_PRICE_FAMILY_MONTHLY || ''; break;
  }

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan or price not configured' });
  }

  try {
    // Check for existing customer
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    const session = await stripe.checkout.sessions.create({
      customer: sub?.stripe_customer_id || undefined,
      customer_email: sub?.stripe_customer_id ? undefined : userEmail,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/premium`,
      metadata: { user_id: userId, plan },
      subscription_data: {
        metadata: { user_id: userId, plan }
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ error: error.message });
  }
}
