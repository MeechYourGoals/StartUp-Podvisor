import despia from 'despia-native';

export const isDespia = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.userAgent.includes('Despia');
};

export const launchDespiaPaywall = (userId: string, offering: string): void => {
  if (isDespia()) {
    console.log(`Despia: Launching paywall for user ${userId} with offering ${offering}`);
    despia(`revenuecat://launchPaywall?external_id=${userId}&offering=${offering}`);
  } else {
    console.warn('Despia: Attempted to launch paywall in non-Despia environment');
  }
};
