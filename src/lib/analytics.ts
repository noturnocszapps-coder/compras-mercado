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
  PRODUCT_SCAN = 'product_scan'
}

export const trackEvent = (event: AnalyticsEvent, data?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Here we would integrate with PostHog or Vercel Analytics
    // For now, we log to console in a structured way that Roxou Cloud can pick up
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
