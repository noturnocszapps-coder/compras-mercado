// src/types/billing.ts

export enum Plan {
  FREE = 'free',
  PREMIUM_MONTHLY = 'premium_monthly',
  PREMIUM_YEARLY = 'premium_yearly',
  FAMILY = 'family'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INACTIVE = 'inactive',
  UNPAID = 'unpaid'
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageLimit {
  id: string;
  user_id: string;
  feature: string;
  usage_count: number;
  usage_period: 'monthly' | 'daily';
  period_start: string;
}

export const PLAN_DETAILS = {
  [Plan.FREE]: {
    label: 'Free',
    limits: {
      activeLists: 3,
      itemsPerList: 20,
      scannerUses: 5
    }
  },
  [Plan.PREMIUM_MONTHLY]: {
    label: 'Premium Mensal',
    limits: {
      activeLists: Infinity,
      itemsPerList: Infinity,
      scannerUses: Infinity
    }
  },
  [Plan.PREMIUM_YEARLY]: {
    label: 'Premium Anual',
    limits: {
      activeLists: Infinity,
      itemsPerList: Infinity,
      scannerUses: Infinity
    }
  },
  [Plan.FAMILY]: {
    label: 'Plano Família',
    limits: {
      activeLists: Infinity,
      itemsPerList: Infinity,
      maxFamilyMembers: 5
    }
  }
};
