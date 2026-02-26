import { Capacitor } from '@capacitor/core';
import despia from 'despia-native';
import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionTier, SubscriptionInfo, TierLimits } from '@/types/subscription';
import { TIER_LIMITS, REVENUECAT_ENTITLEMENTS } from '@/types/subscription';
import { isDespia, launchDespiaPaywall } from './despiaService';

/** Founder/Super Admin emails with unlimited access - no feature limits */
const FOUNDER_EMAILS = ['ccamechi@gmail.com'];

// RevenueCat SDK - conditionally loaded for native platforms
let Purchases: typeof import('@revenuecat/purchases-capacitor').Purchases | null = null;

// Initialize RevenueCat on native platforms
export async function initializeRevenueCat(userId: string): Promise<void> {
  if (isDespia()) {
    console.log('RevenueCat: Skipping initialization on Despia platform (native handling)');
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Skipping initialization on web platform');
    return;
  }

  try {
    const { Purchases: RevenueCatPurchases } = await import('@revenuecat/purchases-capacitor');
    Purchases = RevenueCatPurchases;

    const apiKey = import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
    if (!apiKey) {
      console.warn('RevenueCat: API key not configured');
      return;
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    console.log('RevenueCat: Initialized for user', userId);
  } catch (error) {
    console.error('RevenueCat: Failed to initialize', error);
  }
}

// Identify user with RevenueCat
export async function identifyUser(userId: string): Promise<void> {
  if (!Purchases || !Capacitor.isNativePlatform()) return;

  try {
    await Purchases.logIn({ appUserID: userId });
    console.log('RevenueCat: User identified', userId);
  } catch (error) {
    console.error('RevenueCat: Failed to identify user', error);
  }
}

// Get current entitlements from RevenueCat
export async function getRevenueCatEntitlements(): Promise<SubscriptionTier> {
  if (!Purchases || !Capacitor.isNativePlatform()) {
    return 'free';
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const entitlements = customerInfo.entitlements.active;

    if (entitlements[REVENUECAT_ENTITLEMENTS.SERIES_Z]) {
      return 'series_z';
    }
    if (entitlements[REVENUECAT_ENTITLEMENTS.SEED]) {
      return 'seed';
    }
    return 'free';
  } catch (error) {
    console.error('RevenueCat: Failed to get entitlements', error);
    return 'free';
  }
}

// Get available packages from RevenueCat
export async function getRevenueCatOfferings() {
  if (!Purchases || !Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const result = await Purchases.getOfferings();
    return (result as any)?.current ?? null;
  } catch (error) {
    console.error('RevenueCat: Failed to get offerings', error);
    return null;
  }
}

// Purchase a package via RevenueCat
export async function purchasePackage(packageId: string): Promise<boolean> {
  if (window.navigator.userAgent.includes('Despia')) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Use Despia native bridge for purchase
      despia(`revenuecat://purchase?external_id=${user.id}&product=${packageId}`);
      return true; // The actual success will be handled by the iapSuccess callback
    } catch (error) {
      console.error('Despia purchase failed', error);
      return false;
    }
  }

  if (!Purchases || !Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await Purchases.getOfferings();
    const pkg = (result as any)?.current?.availablePackages?.find((p: any) => p.identifier === packageId);

    if (!pkg) {
      console.error('RevenueCat: Package not found', packageId);
      return false;
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });

    // Sync to Supabase
    const tier = getRevenueCatEntitlements();
    await syncSubscriptionToSupabase(await tier);

    return true;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('RevenueCat: User cancelled purchase');
    } else {
      console.error('RevenueCat: Purchase failed', error);
    }
    return false;
  }
}

// Restore purchases via RevenueCat
export async function restorePurchases(): Promise<SubscriptionTier> {
  if (!Purchases || !Capacitor.isNativePlatform()) {
    return 'free';
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const tier = await getRevenueCatEntitlements();
    await syncSubscriptionToSupabase(tier);
    return tier;
  } catch (error) {
    console.error('RevenueCat: Failed to restore purchases', error);
    return 'free';
  }
}

// Sync subscription status to Supabase
export async function syncSubscriptionToSupabase(tier: SubscriptionTier): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        tier,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Failed to sync subscription to Supabase', error);
    }
  } catch (error) {
    console.error('Error syncing subscription', error);
  }
}

// Get subscription info from Supabase (direct queries, no RPC)
export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Founder/Super Admin: unlimited access, no feature limits
    const isFounder = user.email && FOUNDER_EMAILS.includes(user.email.toLowerCase());
    if (isFounder) {
      const profilesUsed = (await supabase
        .from('user_startup_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)).count ?? 0;
      const bookmarksUsed = (await supabase
        .from('bookmarked_episodes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)).count ?? 0;
      const { data: usage } = await supabase
        .from('user_monthly_usage' as any)
        .select('analyses_count')
        .eq('user_id', user.id)
        .eq('month_year', new Date().toISOString().slice(0, 7))
        .single();
      return {
        tier: 'series_z',
        limits: {
          profiles: { max: 9999, used: profilesUsed || 0 },
          bookmarks: { max: 9999, used: bookmarksUsed || 0 },
          analyses: { max: 9999, used: (usage as any)?.analyses_count || 0 },
        },
        isActive: true,
      };
    }

    // Get subscription tier
    const { data: subscription } = await supabase
      .from('user_subscriptions' as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    const tier: SubscriptionTier = (subscription as any)?.tier || 'free';
    const tierLimits = TIER_LIMITS[tier];

    // Get profiles count
    const { count: profilesUsed } = await supabase
      .from('user_startup_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get bookmarks count
    const { count: bookmarksUsed } = await supabase
      .from('bookmarked_episodes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get monthly analyses count
    const monthYear = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const { data: usage } = await supabase
      .from('user_monthly_usage' as any)
      .select('analyses_count')
      .eq('user_id', user.id)
      .eq('month_year', monthYear)
      .single();

    return {
      tier,
      limits: {
        profiles: { max: tierLimits.profiles.max, used: profilesUsed || 0 },
        bookmarks: { max: tierLimits.bookmarks.max, used: bookmarksUsed || 0 },
        analyses: { max: tierLimits.analyses.max, used: (usage as any)?.analyses_count || 0 },
      },
      isActive: true,
      currentPeriodEnd: (subscription as any)?.current_period_end,
      cancelAtPeriodEnd: (subscription as any)?.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Error getting subscription info', error);
    return null;
  }
}

// Check if user can perform an action based on limits
export function canPerformAction(
  limits: TierLimits,
  action: 'profile' | 'bookmark' | 'analysis'
): { allowed: boolean; message?: string } {
  switch (action) {
    case 'profile':
      if (limits.profiles.used >= limits.profiles.max) {
        return {
          allowed: false,
          message: `You've reached your limit of ${limits.profiles.max} profile${limits.profiles.max > 1 ? 's' : ''}. Upgrade to add more.`,
        };
      }
      break;
    case 'bookmark':
      if (limits.bookmarks.used >= limits.bookmarks.max) {
        return {
          allowed: false,
          message: `You've reached your limit of ${limits.bookmarks.max} bookmarks. Upgrade for more.`,
        };
      }
      break;
    case 'analysis':
      if (limits.analyses.used >= limits.analyses.max) {
        return {
          allowed: false,
          message: `You've used your ${limits.analyses.max} free analyses this month. Upgrade to analyze more videos.`,
        };
      }
      break;
  }
  return { allowed: true };
}

// Increment analysis count (direct upsert)
export async function incrementAnalysisCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const monthYear = new Date().toISOString().slice(0, 7);

    // Try to get existing record
    const { data: existing } = await supabase
      .from('user_monthly_usage' as any)
      .select('analyses_count')
      .eq('user_id', user.id)
      .eq('month_year', monthYear)
      .single();

    const newCount = ((existing as any)?.analyses_count || 0) + 1;

    const { error } = await supabase
      .from('user_monthly_usage' as any)
      .upsert({
        user_id: user.id,
        month_year: monthYear,
        analyses_count: newCount,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id,month_year',
      });

    if (error) {
      console.error('Failed to increment analysis count', error);
      return 0;
    }

    return newCount;
  } catch (error) {
    console.error('Error incrementing analysis count', error);
    return 0;
  }
}

// Get Stripe checkout URL (for web payments)
export async function getStripeCheckoutUrl(priceId: string): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId, userId: user.id },
    });

    if (error) {
      console.error('Failed to create checkout session', error);
      return null;
    }

    return data?.url || null;
  } catch (error) {
    console.error('Error creating checkout session', error);
    return null;
  }
}

// Get Stripe customer portal URL
export async function getStripePortalUrl(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { userId: user.id },
    });

    if (error) {
      console.error('Failed to create portal session', error);
      return null;
    }

    return data?.url || null;
  } catch (error) {
    console.error('Error creating portal session', error);
    return null;
  }
}
