import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import sessionStorage from '../utils/sessionStorage';
import { useCart } from '../contexts/CartContext';

/**
 * @typedef {Object} PaymentData
 * @property {number} amount
 * @property {Object} shippingInfo
 * @property {string} orderId
 * @property {string} [yocoCheckoutId]
 */

/**
 * @typedef {Object} PaymentSession
 * @property {Array<any>} cartItems
 * @property {number} amount
 * @property {Object} shippingInfo
 * @property {string} orderId
 * @property {string} [yocoCheckoutId]
 * @property {number} _timestamp
 * @property {number} _expiresAt
 */

/**
 * Custom hook for managing payment flow state, loading, and session recovery
 * @returns {Object} Payment flow utilities and state
 */
/**
 * @returns {Object} Payment flow utilities and state
 */
export const usePaymentFlow = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState( /** @type {string|null} */ (null));
    const [paymentSession, setPaymentSession] = useState( /** @type {PaymentSession|null} */ (null));

    // Check for existing payment session on component mount
    useEffect(() => {
        const checkSession = () => {
            try {
                const session = /** @type {PaymentSession|null} */ (sessionStorage.getPaymentSession());
                if (session) {
                    console.log('💼 Found existing payment session:', {
                        orderId: session.orderId,
                        itemsCount: session.cartItems.length || 0
                    });
                    setPaymentSession(session);
                }
            } catch (err) {
                console.error('❌ Error checking payment session:', err);
            }
        };

        checkSession();
    }, []);

    /**
     * Start payment flow and create session
     * @param {PaymentData} paymentData
     * @returns {boolean} Success status
     */
    const startPaymentSession = useCallback(( /** @type {PaymentData} */ paymentData) => {
        try {
            setLoading(true);
            setError(null);

            const sessionCreated = sessionStorage.createPaymentSession({
                cartItems: cartItems,
                amount: paymentData.amount,
                shippingInfo: paymentData.shippingInfo,
                orderId: paymentData.orderId,
                yocoCheckoutId: paymentData.yocoCheckoutId
            });

            if (!sessionCreated) {
                throw new Error('Failed to create payment session');
            }

            console.log('🚀 Payment session started:', {
                orderId: paymentData.orderId,
                amount: paymentData.amount
            });

            setLoading(false);
            return true;

        } catch (err) {
            console.error('❌ Payment session start failed:', err);
            const error = /** @type {Error} */ (err);
            setError(error.message || 'Failed to start payment session');
            setLoading(false);
            return false;
        }
    }, [cartItems]);

    /**
     * Complete payment and clean up session
     * @param {string} [finalOrderId] - Optional final order ID from backend
     * @returns {boolean} Success status
     */
    const completePayment = useCallback((finalOrderId = null) => {
        try {
            setLoading(true);

            // Update session with final order ID if provided
            if (finalOrderId && paymentSession) {
                const updated = sessionStorage.updatePaymentSession({ orderId: finalOrderId });
                if (updated) {
                    console.log('✅ Final order ID updated:', finalOrderId);
                }
            }

            // Don't clear the session immediately - keep it for PaymentSuccess page
            // sessionStorage.clearPaymentSession();
            // setPaymentSession(null);

            // The session will be cleared when user clicks "Continue Shopping" in PaymentSuccess

            console.log('🎉 Payment completed successfully - session preserved for display');
            setLoading(false);
            return true;

        } catch (err) {
            console.error('❌ Payment completion failed:', err);
            const error = /** @type {Error} */ (err);
            setError(error.message || 'Failed to complete payment');
            setLoading(false);
            return false;
        }
    }, [paymentSession]);

    /**
     * Cancel payment flow and clean up
     */
    const cancelPayment = useCallback(() => {
        try {
            console.log('❌ Payment cancelled');
            sessionStorage.clearPaymentSession();
            setPaymentSession(null);
            setError(null);
        } catch (err) {
            console.error('❌ Error cancelling payment:', err);
        }
    }, []);

    /**
     * Restore payment session data for recovery
     */
    const restorePaymentData = useCallback(() => {
        try {
            const session = /** @type {PaymentSession|null} */ (sessionStorage.getPaymentSession());
            if (!session) {
                throw new Error('No valid payment session found');
            }

            console.log('🔄 Restoring payment data:', {
                orderId: session.orderId,
                itemsCount: session.cartItems.length || 0
            });

            setPaymentSession(session);
            return session;

        } catch (err) {
            console.error('❌ Payment data restoration failed:', err);
            const error = /** @type {Error} */ (err);
            setError(error.message || 'Failed to restore payment data');
            return null;
        }
    }, []);

    /**
     * Navigate to payment result page with session data
     * @param {string} resultPath - '/payment-success' or '/payment-failed'
     * @param {Object} [additionalData] - Additional data to pass
     */
    const navigateToPaymentResult = useCallback(( /** @type {string} */ resultPath, /** @type {Object} */ additionalData = {}) => {
        try {
            const session = sessionStorage.getPaymentSession();

            navigate(resultPath, {
                state: {
                    ...session,
                    ...additionalData,
                    _sessionRestored: true
                }
            });

            console.log('📍 Navigating to:', resultPath);

        } catch (err) {
            console.error('❌ Navigation error:', err);
            // Fallback to home if navigation fails
            navigate('/');
        }
    }, [navigate]);

    /**
     * Get session expiration status
     */
    const getSessionStatus = useCallback(() => {
        try {
            const session = sessionStorage.getPaymentSession();
            const timeRemaining = sessionStorage.getSessionTimeRemaining();

            return {
                hasSession: !!session,
                isExpired: timeRemaining === 0,
                timeRemaining,
                sessionData: session
            };
        } catch (err) {
            console.error('❌ Session status check failed:', err);
            return {
                hasSession: false,
                isExpired: true,
                timeRemaining: 0,
                sessionData: null
            };
        }
    }, []);

    return {
        // State
        loading,
        error,
        paymentSession,

        // Actions
        startPaymentSession,
        completePayment,
        cancelPayment,
        restorePaymentData,
        navigateToPaymentResult,
        getSessionStatus,

        // Derived state
        hasActivePayment: () => !!paymentSession || sessionStorage.hasValidPaymentSession(),
        isSessionExpired: () => getSessionStatus().isExpired
    };
};

export default usePaymentFlow;