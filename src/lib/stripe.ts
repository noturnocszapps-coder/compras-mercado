import { loadStripe } from '@stripe/stripe-js';
import { ENV } from '../config/env';

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise && ENV.stripe.publicKey) {
    stripePromise = loadStripe(ENV.stripe.publicKey);
  }
  if (!ENV.stripe.publicKey) {
    console.warn('[Stripe] Public key is missing. Checkout will not work.');
  }
  return stripePromise;
};
