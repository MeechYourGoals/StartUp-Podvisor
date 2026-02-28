export type SubscriptionTier = 'free' | 'seed' | 'series_z';

export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';

export interface TierLimits {
  profiles: { max: number; used: number };
  bookmarks: { max: number; used: number };
  analyses: { max: number; used: number };
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  limits: TierLimits;
  isActive: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  revenuecat_app_user_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMonthlyUsage {
  id: string;
  user_id: string;
  month_year: string;
  analyses_count: number;
  created_at: string;
  updated_at: string;
}

export const TIER_LIMITS: Record<SubscriptionTier, Omit<TierLimits, 'profiles' | 'bookmarks' | 'analyses'> & {
  profiles: { max: number };
  bookmarks: { max: number };
  bookmarksPerProfile: number;
  analyses: { max: number };
}> = {
  free: {
    profiles: { max: 1 },
    bookmarks: { max: 5 },
    bookmarksPerProfile: 5,
    analyses: { max: 4 },
  },
  seed: {
    profiles: { max: 3 },
    bookmarks: { max: 30 },
    bookmarksPerProfile: 10,
    analyses: { max: 10 },
  },
  series_z: {
    profiles: { max: 10 },
    bookmarks: { max: 100 },
    bookmarksPerProfile: 10,
    analyses: { max: 25 },
  },
};

export interface TierPricing {
  name: string;
  displayName: string;
  price: number;
  priceDisplay: string;
  yearlyPrice?: number;
  yearlyPriceDisplay?: string;
  lifetimePrice?: number;
  lifetimePriceDisplay?: string;
  features: string[];
  recommended?: boolean;
}

export const TIER_PRICING: Record<SubscriptionTier, TierPricing> = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    priceDisplay: 'Free',
    features: [
      '1 startup profile',
      '5 bookmarks total',
      '4 video analyses per month',
      'Basic insights',
    ],
  },
  seed: {
    name: 'seed',
    displayName: 'Seed',
    price: 4.99,
    priceDisplay: '$4.99/month',
    yearlyPrice: 39.99,
    yearlyPriceDisplay: '$39.99/year',
    lifetimePrice: 79.99,
    lifetimePriceDisplay: '$79.99 once',
    features: [
      '3 startup profiles',
      '10 bookmarks per profile',
      '10 video analyses per month',
      'Personalized insights',
      'Export to CSV/JSON',
    ],
    recommended: true,
  },
  series_z: {
    name: 'series_z',
    displayName: 'Series Z',
    price: 14.99,
    priceDisplay: '$14.99/month',
    yearlyPrice: 119.99,
    yearlyPriceDisplay: '$119.99/year',
    lifetimePrice: 249.99,
    lifetimePriceDisplay: '$249.99 once',
    features: [
      '10 startup profiles',
      '10 bookmarks per profile',
      '25 video analyses per month',
      'Advanced personalized insights',
      'Priority support',
      'API access (coming soon)',
    ],
  },
};

/** RevenueCat entitlement identifiers — must match your RevenueCat dashboard */
export const REVENUECAT_ENTITLEMENTS = {
  /** Primary entitlement for the app — unlocks all Pro features */
  PRO: 'Founder Mode Advisor Pro',
  /** Legacy: maps to Seed tier */
  SEED: 'seed_subscription',
  /** Legacy: maps to Series Z tier */
  SERIES_Z: 'series_z_subscription',
} as const;

/**
 * RevenueCat product identifiers — must match App Store Connect / Google Play Console.
 * These map to your RevenueCat Offerings > Packages configuration.
 */
export const REVENUECAT_PRODUCTS = {
  SEED_MONTHLY: 'seed_monthly',
  SEED_YEARLY: 'seed_yearly',
  SEED_LIFETIME: 'seed_lifetime',
  SERIES_Z_MONTHLY: 'series_z_monthly',
  SERIES_Z_YEARLY: 'series_z_yearly',
  SERIES_Z_LIFETIME: 'series_z_lifetime',
} as const;

/** RevenueCat offering identifiers */
export const REVENUECAT_OFFERINGS = {
  DEFAULT: 'default',
} as const;

export const STRIPE_PRICE_IDS = {
  SEED_MONTHLY: import.meta.env.VITE_STRIPE_SEED_PRICE_ID || 'price_seed_monthly',
  SERIES_Z_MONTHLY: import.meta.env.VITE_STRIPE_SERIES_Z_PRICE_ID || 'price_series_z_monthly',
} as const;
