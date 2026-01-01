export type SubscriptionTier = 'free' | 'seed' | 'series_z';

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

export const TIER_PRICING: Record<SubscriptionTier, {
  name: string;
  displayName: string;
  price: number;
  priceDisplay: string;
  features: string[];
  recommended?: boolean;
}> = {
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

export const REVENUECAT_ENTITLEMENTS = {
  SEED: 'seed_subscription',
  SERIES_Z: 'series_z_subscription',
} as const;

export const STRIPE_PRICE_IDS = {
  SEED_MONTHLY: import.meta.env.VITE_STRIPE_SEED_PRICE_ID || 'price_seed_monthly',
  SERIES_Z_MONTHLY: import.meta.env.VITE_STRIPE_SERIES_Z_PRICE_ID || 'price_series_z_monthly',
} as const;
