import { ENV } from '../config/env';

/**
 * Compra Fácil Analytics Helper
 * Lightweight event tracking for Roxou Ecosystem
 */

export enum AnalyticsEvent {
  APP_INSTALL = 'app_install',
  LOGIN = 'login',
  LIST_CREATED = 'list_created',
  LIST_FINISHED = 'list_finished',
  SCANNER_USED = 'scanner_used',
  VOICE_USED = 'voice_used',
  ECONOMY_SCORE_CHECK = 'economy_score_check',
  INVENTORY_UPDATE = 'inventory_update',
  PRODUCT_SCAN = 'product_scan',
  PREMIUM_PAGE_VIEW = 'premium_page_view',
  CHECKOUT_STARTED = 'checkout_started',
  CHECKOUT_COMPLETED = 'checkout_completed',
  CHECKOUT_CANCELED = 'checkout_canceled',
  SUBSCRIPTION_ACTIVE = 'subscription_active',
  SUBSCRIPTION_FAILED = 'subscription_failed',
  PREMIUM_GATE_VIEWED = 'premium_gate_viewed'
}

export const trackEvent = (event: AnalyticsEvent, data?: Record<string, any>) => {
  if (ENV.isProd) {
    // Here we would integrate with PostHog or Vercel Analytics using ENV.analytics
    console.log(`[ROXOU_ANALYTICS] ${event}`, data);
  } else {
    console.debug(`[DEBUG_ANALYTICS] ${event}`, data);
  }
};

export const initAnalytics = () => {
  // Check if it's a PWA install
  if (window.matchMedia('(display-mode: standalone)').matches) {
    trackEvent(AnalyticsEvent.APP_INSTALL, { platform: 'standalone' });
  }
};
