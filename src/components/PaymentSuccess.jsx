import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { useCart } from '../contexts/CartContext';
import usePaymentFlow from '../hooks/usePaymentFlow';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * @typedef {Object} OrderItem
 * @property {string} name
 * @property {number} price
 * @property {number} [quantity]
 */
const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { clearCart } = useCart();
  const paymentFlow = usePaymentFlow();
  const paymentSession = /** @type {any} */ (paymentFlow).paymentSession;
  const restorePaymentData = /** @type {any} */ (paymentFlow).restorePaymentData;
  const paymentError = /** @type {any} */ (paymentFlow).error;
  const paymentLoading = /** @type {any} */ (paymentFlow).loading;
  const completePayment = /** @type {any} */ (paymentFlow).completePayment;
  const cancelPayment = /** @type {any} */ (paymentFlow).cancelPayment;
  
  // Additional auth state tracking specifically for PaymentSuccess
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor auth state continuously
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const userAuthenticated = !!user;
      setIsAuthenticated(userAuthenticated);
      setAuthLoading(false);
      
      console.log('🔄 PaymentSuccess Auth State:', {
        authenticated: userAuthenticated,
        time: new Date().toISOString(),
        path: window.location.pathname
      });
    });

    return () => unsubscribe();
  }, []);

  // Handle payment completion after ensuring we have authentication stabilized
  useEffect(() => {
    // Only proceed if we've checked auth and user is still authenticated
    if (!authLoading) {
      let hasProcessed = false;
      
      const processPaymentCompletion = async () => {
        if (hasProcessed) return;
        hasProcessed = true;
        
        if (!isAuthenticated) {
          console.log('⚠️ Payment completion delayed - user not authenticated during payment success load');
          // Store that we have a pending payment to complete after login
          sessionStorage.setItem('pendingPaymentCompletion', 'true');
          sessionStorage.setItem('pendingPaymentPage', window.location.pathname);
          return;
        }
        
        // Don't clear cart here - wait until user clicks "Continue Shopping"
        // This allows us to show the purchased items and amount on the success page
        console.log('🎉 Payment completed - cart preserved for display');

        // Complete the payment session (creates the central cleanup mechanism)
        await completePayment(paymentSession?.orderId);
      };

      processPaymentCompletion();
    }
  }, [completePayment, paymentSession?.orderId, authLoading, isAuthenticated]);

  // Handle session restoration on component mount
  useEffect(() => {
    if (!state || _sessionRestoredFlag) {
      return; // Don't restore if already restored or we have fresh state
    }

    if (!state._sessionRestored) {
      // If no session restore flag, try to restore from session storage
      console.log('🔄 Attempting to restore payment session data...');
      restorePaymentData();
    }

    // Set flag to prevent repeated restoration attempts
    try {
      // Using a simple flag in memory to prevent multiple restorations
      sessionStorage.setItem('_sessionRestoredFlag', 'true');
    } catch {
      console.warn('Could not set session restore flag');
    }
  }, [state, restorePaymentData]);

  const _sessionRestoredFlag = sessionStorage.getItem('_sessionRestoredFlag') === 'true';

  // Use session data or fall back to location state

  // Debug logging to see what data is available
  console.log('🔍 PaymentSuccess Debug Data:', {
    paymentSession,
    state,
    paymentSessionAmount: paymentSession?.amount,
    stateAmount: state?.amount,
    paymentSessionCartItems: paymentSession?.cartItems,
    stateCartItems: state?.cartItems,
    stateItems: state?.items
  });

  // Use the actual order number from the payment session or state to ensure consistency with admin view
  const finalOrderDisplayId = useMemo(() => {
    // First priority: paymentSession orderNumber (actual database order number used in ViewOrders)
    // Second priority: orderNumber from navigation state (for direct navigation recovery)
    // Third priority: paymentSession orderId (Firestore document ID)
    // Fourth priority: state-related order data
    // Fallback while preserving consistency with admin display format
    return paymentSession?.orderNumber ||
           (state?.orderNumber) ||
           paymentSession?.orderId ||
           (state && (state.orderId || state.orderDetails?.orderId)) ||
           'ORD-' + Date.now().toString(); // Maintain same format as Checkout component
  }, [paymentSession?.orderNumber, paymentSession?.orderId, state?.orderNumber, state?.orderId, state?.orderDetails?.orderId]);

  // Access current cart for fallback (in case payment session is missing)
  const { cartItems: currentCartItems, calculateTotal } = useCart();
  
  // Additional check for authentication in middle of page
  useEffect(() => {
    // If auth state changes and we become authenticated, check for pending payments
    if (isAuthenticated) {
      const hasPendingPayment = sessionStorage.getItem('pendingPaymentCompletion') === 'true';
      if (hasPendingPayment) {
        console.log('✅ User authenticated after payment, completing payment flow');
        sessionStorage.removeItem('pendingPaymentCompletion');
        setTimeout(() => {
          completePayment(paymentSession?.orderId);
        }, 500);
      }
      
      // Clear any old values
      sessionStorage.removeItem('postLoginRedirect');
    }
  }, [isAuthenticated, completePayment, paymentSession?.orderId]);
  
  // Calculate current total as fallback
  const currentTotal = calculateTotal() + 1; // Add delivery fee

  const orderDetails = {
    orderId: finalOrderDisplayId,
    amount: paymentSession?.amount || state?.amount || currentTotal || 0,
    items: paymentSession?.cartItems || state?.cartItems || state?.items || currentCartItems || [],
    shipping: paymentSession?.shippingInfo || state?.shippingInfo || state?.shipping || null
  };

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="checkmark">✓</div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        {paymentLoading && (
          <div className="loading-indicator">
            ⏳ Finalizing payment details...
          </div>
        )}

        {paymentError && (
          <div className="payment-alert">
            ⚠️ Note: Some payment details could not be fully restored. Contact support with order # for assistance.
          </div>
        )}
        
        <div className="order-details">
          <h2>Order Details</h2>
          <p>Order ID: <strong>{orderDetails.orderId}</strong></p>
          <p>Amount Paid: <strong>R{orderDetails.amount.toFixed(2)}</strong></p>
          
          {orderDetails.items.length > 0 && (
            <div className="items-list">
              <h3>Items Purchased:</h3>
              {orderDetails.items.map((
                /** @type {OrderItem} */ item,
                /** @type {number} */ index
              ) => (
                <div key={index} className="item">
                  <p>{item.name} - R{item.price.toFixed(2)} × {item.quantity || 1}</p>
                  {(item.quantity || 1) > 1 && (
                    <span className="item-total">
                      (R{(item.price * (item.quantity || 1)).toFixed(2)})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {orderDetails.shipping && (
            <div className="shipping-details">
              <h3>Delivery Information:</h3>
              <p>Name: {orderDetails.shipping.firstName} {orderDetails.shipping.lastName}</p>
              <p>Address: {orderDetails.shipping.address}</p>
              {orderDetails.shipping.city && <p>City: {orderDetails.shipping.city}</p>}
              {orderDetails.shipping.state && <p>State/Province: {orderDetails.shipping.state}</p>}
              {orderDetails.shipping.zip && <p>Postal Code: {orderDetails.shipping.zip}</p>}
              <p>Country: {orderDetails.shipping.country || 'South Africa'}</p>
            </div>
          )}
        </div>

        <div className="note-section">
          <p className="help-text">
            📧 A confirmation email will be sent to your account.<br />
            💾 Save this order ID for support: <strong>{orderDetails.orderId}</strong>
          </p>
        </div>

        <button
          className="continue-button"
          onClick={() => {
            // Clear cart and payment session when user is ready to continue shopping
            clearCart();
            console.log('🛒 Cart cleared after user clicked Continue Shopping');
            
            // Clear payment session
            if (cancelPayment) {
              cancelPayment();
              console.log('🧹 Payment session cleared after user clicked Continue Shopping');
            }
            
            // Clear any session flags before navigating away
            try {
              sessionStorage.removeItem('_sessionRestoredFlag');
            } catch {
              // Ignore errors clearing session flag
            }
            navigate('/');
          }}
          disabled={paymentLoading}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;