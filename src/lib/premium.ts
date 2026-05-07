import { Plan, SubscriptionStatus, Subscription as BillingSubscription } from '../types/billing';

export type PlanType = Plan;
export type Subscription = BillingSubscription;

export const isPremium = (subscription: Subscription | null) => {
  if (!subscription) return false;
  return subscription.status === SubscriptionStatus.ACTIVE || 
         subscription.status === SubscriptionStatus.TRIALING;
};

export const isFamilyPlan = (subscription: Subscription | null) => {
  if (!subscription) return false;
  return isPremium(subscription) && subscription.plan === Plan.FAMILY;
};

export const getPlanLabel = (plan: Plan | string) => {
  switch (plan) {
    case Plan.PREMIUM_MONTHLY: return 'Premium Mensal';
    case Plan.PREMIUM_YEARLY: return 'Premium Anual';
    case Plan.FAMILY: return 'Plano Família';
    default: return 'Free';
  }
};

// Usage check helpers
export const canUseScanner = (usageCount: number, subscription: Subscription | null) => {
  if (isPremium(subscription)) return true;
  return usageCount < 5; // Limit for free users
};

export const canAccessAdvancedReports = (subscription: Subscription | null) => {
  return isPremium(subscription);
};

export const canUseFamilyMode = (subscription: Subscription | null) => {
  return isFamilyPlan(subscription);
};

export const FREE_LIMITS = {
  max_active_lists: 3,
  max_items_per_list: 20,
  scanner_uses: 5
};
