export {};

declare global {
  interface Window {
    iapSuccess?: (transactionData: any) => void;
  }
}
