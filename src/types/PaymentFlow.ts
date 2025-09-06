/**
 * Types for Payment Flow Management
 */

export interface PaymentSession {
  cartItems: Array<any>; // Can be more specific with CartItem type if available
  amount: number;
  shippingInfo: any; // Can be more specific with ShippingInfo type
  orderId: string;
  orderNumber?: string; // Display order number for user-facing display consistency
  yocoCheckoutId?: string;
  _timestamp: number;
  _expiresAt: number;
}
  
export interface PaymentFlowHookReturn {
  // State
  loading: boolean;
  error: string | null;
  paymentSession: PaymentSession | null;
  
  // Actions
  startPaymentSession: (paymentData: {
    amount: number;
    shippingInfo: any;
    orderId: string;
    orderNumber?: string; // Support orderNumber for consistent user/display
    yocoCheckoutId?: string;
  }) => boolean;
  
  completePayment: (finalOrderId?: string) => boolean;
  cancelPayment: () => void;
  restorePaymentData: () => PaymentSession | null;
  navigateToPaymentResult: (resultPath: string, additionalData?: object) => void;
  getSessionStatus: () => {
    hasSession: boolean;
    isExpired: boolean;
    timeRemaining: number;
    sessionData: PaymentSession | null;
  };
  
  // Derived state functions
  hasActivePayment: () => boolean;
  isSessionExpired: () => boolean;
}

export interface PaymentData {
  amount: number;
  shippingInfo: any;
  orderId: string;
  orderNumber?: string;
  yocoCheckoutId?: string;
}