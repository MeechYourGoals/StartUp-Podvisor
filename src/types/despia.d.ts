export {};

declare global {
  interface Window {
    /** Despia Native: Called when a RevenueCat purchase completes successfully */
    onRevenueCatPurchase?: () => void;
    /** Despia Native: Called when an in-app purchase completes successfully */
    iapSuccess?: (transactionData: any) => void;
  }
}
