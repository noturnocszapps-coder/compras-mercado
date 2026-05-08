// src/config/env.ts

/**
 * Centralized environment variable management.
 * Only VITE_ prefixed variables are exposed to the client.
 * Using static access for Vite compatibility.
 */

export const ENV = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appUrl: import.meta.env.VITE_APP_URL || '',
  env: import.meta.env.VITE_ENV || 'development',
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
  
  analytics: {
    posthogKey: import.meta.env.VITE_POSTHOG_KEY || '',
    posthogHost: import.meta.env.VITE_POSTHOG_HOST || '',
  }
} as const;

// Validation for critical variables
const requiredEnvs = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

requiredEnvs.forEach(key => {
  // Use static check for validation too
  const val = key === 'VITE_SUPABASE_URL' ? import.meta.env.VITE_SUPABASE_URL :
              key === 'VITE_SUPABASE_ANON_KEY' ? import.meta.env.VITE_SUPABASE_ANON_KEY :
              key === 'VITE_STRIPE_PUBLISHABLE_KEY' ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY : '';
              
  if (!val) {
    console.error(`[Config] Missing critical environment variable: ${key}`);
  }
});

console.log("[BOOT] Environment configuration loaded.");
