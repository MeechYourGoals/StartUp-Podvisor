import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/hooks/useAuth';
import { useDespia } from '@/hooks/use-despia';
import {
  initializeRevenueCat,
  identifyUser,
  getRevenueCatEntitlements,
  getSubscriptionInfo,
  canPerformAction,
  incrementAnalysisCount,
  getStripeCheckoutUrl,
  getStripePortalUrl,
  purchasePackage,
  restorePurchases,
  launchDespiaPaywall,
  getDespiaEntitlements,
  syncSubscriptionToSupabase,
} from '@/services/subscriptionService';
import type { SubscriptionInfo, SubscriptionTier, TierLimits } from '@/types/subscription';
import { TIER_PRICING, STRIPE_PRICE_IDS } from '@/types/subscription';

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canCreateProfile: () => { allowed: boolean; message?: string };
  canCreateBookmark: () => { allowed: boolean; message?: string };
  canAnalyzeVideo: () => { allowed: boolean; message?: string };
  trackAnalysis: () => Promise<void>;
  upgradeTo: (tier: SubscriptionTier) => Promise<void>;
  manageSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  isNative: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDespia } = useDespia();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Treat Despia as native for UI purposes
  const isNative = Capacitor.isNativePlatform() || isDespia;

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // On native platforms, also check RevenueCat entitlements
      if (Capacitor.isNativePlatform()) {
        await getRevenueCatEntitlements();
      } else if (isDespia) {
        const tier = await getDespiaEntitlements();
        await syncSubscriptionToSupabase(tier);
      }

      const info = await getSubscriptionInfo();
      setSubscription(info);
    } catch (err) {
      console.error('Failed to fetch subscription', err);
      setError('Failed to load subscription info');
      // Default to free tier on error
      setSubscription({
        tier: 'free',
        limits: {
          profiles: { max: 1, used: 0 },
          bookmarks: { max: 5, used: 0 },
          analyses: { max: 4, used: 0 },
        },
        isActive: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user, isDespia]);

  // Handle global Despia purchase callback
  useEffect(() => {
    if (isDespia) {
      window.onRevenueCatPurchase = async () => {
        console.log('Despia: Purchase completed, refreshing entitlements...');
        // Wait a moment for webhook to process potentially, but primarily rely on client entitlement check
        setTimeout(async () => {
          await refreshSubscription();
        }, 1000);
      };
    }
    return () => {
      if (isDespia) {
        window.onRevenueCatPurchase = undefined;
      }
    };
  }, [isDespia, refreshSubscription]);

  // Initialize RevenueCat and load subscription on mount
  useEffect(() => {
    async function init() {
      if (user && Capacitor.isNativePlatform()) {
        await initializeRevenueCat(user.id);
        await identifyUser(user.id);
      }
      await refreshSubscription();
    }
    init();
  }, [user, refreshSubscription]);

  const canCreateProfile = useCallback(() => {
    if (!subscription?.limits) {
      return { allowed: false, message: 'Loading subscription...' };
    }
    return canPerformAction(subscription.limits, 'profile');
  }, [subscription]);

  const canCreateBookmark = useCallback(() => {
    if (!subscription?.limits) {
      return { allowed: false, message: 'Loading subscription...' };
    }
    return canPerformAction(subscription.limits, 'bookmark');
  }, [subscription]);

  const canAnalyzeVideo = useCallback(() => {
    if (!subscription?.limits) {
      return { allowed: false, message: 'Loading subscription...' };
    }
    return canPerformAction(subscription.limits, 'analysis');
  }, [subscription]);

  const trackAnalysis = useCallback(async () => {
    await incrementAnalysisCount();
    await refreshSubscription();
  }, [refreshSubscription]);

  const upgradeTo = useCallback(async (tier: SubscriptionTier) => {
    if (tier === 'free') return;
    if (!user) return;

    if (isDespia) {
      // Use Despia native paywall
      // Mapping tier to offering if needed, but using 'default' for now as per plan
      await launchDespiaPaywall(user.id, 'default');
      // The global callback will handle the refresh
    } else if (Capacitor.isNativePlatform()) {
      // Use RevenueCat for native purchases (Capacitor)
      const packageId = tier === 'seed' ? 'seed_monthly' : 'series_z_monthly';
      const success = await purchasePackage(packageId);
      if (success) {
        await refreshSubscription();
      }
    } else {
      // Use Stripe for web purchases
      const priceId = tier === 'seed'
        ? STRIPE_PRICE_IDS.SEED_MONTHLY
        : STRIPE_PRICE_IDS.SERIES_Z_MONTHLY;

      const checkoutUrl = await getStripeCheckoutUrl(priceId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    }
  }, [isDespia, user, refreshSubscription]);

  const manageSubscription = useCallback(async () => {
    if (isDespia) {
      // Despia: launch paywall or just restore?
      // Usually management is done via app store settings, but restore is a good action here too
      await handleRestorePurchases();
    } else if (Capacitor.isNativePlatform()) {
      // RevenueCat handles subscription management through the app store
      // Just refresh to get latest status
      await restorePurchases();
      await refreshSubscription();
    } else {
      // Redirect to Stripe Customer Portal
      const portalUrl = await getStripePortalUrl();
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    }
  }, [isDespia, refreshSubscription]);

  const handleRestorePurchases = useCallback(async () => {
    if (isDespia) {
       const tier = await getDespiaEntitlements();
       await syncSubscriptionToSupabase(tier);
       await refreshSubscription();
    } else {
       await restorePurchases();
       await refreshSubscription();
    }
  }, [isDespia, refreshSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        refreshSubscription,
        canCreateProfile,
        canCreateBookmark,
        canAnalyzeVideo,
        trackAnalysis,
        upgradeTo,
        manageSubscription,
        restorePurchases: handleRestorePurchases,
        isNative,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
