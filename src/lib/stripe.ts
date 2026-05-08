import { loadStripe } from '@stripe/stripe-js';
import { ENV } from '../config/env';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.warn('[STRIPE] VITE_STRIPE_PUBLISHABLE_KEY ausente. Stripe desativado neste ambiente.');
}

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripeKey) {
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};
