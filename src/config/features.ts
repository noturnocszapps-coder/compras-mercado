// src/config/features.ts

/**
 * Professional Feature Flagging System.
 * Controlled by subscription status and/or environment variables.
 */

export const FEATURES = {
  // AI Features
  premiumScanner: true,
  invoiceIAExtraction: false, // Beta
  advancedInsights: true,
  
  // Billing & SaaS
  familyMode: true,
  priceHistory: true,
  economyScore: true,
  
  // Platform
  pwaMode: true,
  notifications: true,
} as const;

export type AppFeatures = typeof FEATURES;
