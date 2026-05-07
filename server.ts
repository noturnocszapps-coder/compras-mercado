import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import handlers
import stripeWebhookHandler from './api/stripe/webhook.ts';
import stripeCheckoutHandler from './api/stripe/checkout.ts';
import stripePortalHandler from './api/stripe/portal.ts';
import aiScanHandler from './api/ai/scan.ts';
import aiProcessHandler from './api/ai/process.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. STRIPE WEBHOOK (Must be before general json middleware for raw body handling)
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      await stripeWebhookHandler(req, res);
    } catch (error) {
      console.error('Webhook Bridge Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // 2. STANDARD JSON MIDDLEWARE
  app.use(express.json());

  // 3. API ROUTES BRIDGE
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    await stripeCheckoutHandler(req, res);
  });

  app.post('/api/stripe/create-portal-session', async (req, res) => {
    await stripePortalHandler(req, res);
  });

  app.post('/api/ai/scan', async (req, res) => {
    await aiScanHandler(req, res);
  });

  app.post('/api/ai/process', async (req, res) => {
    await aiProcessHandler(req, res);
  });

  // 4. VITE / STATIC MIDDLEWARE
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Compra Fácil by Roxou running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server] Startup Error:', err);
});
