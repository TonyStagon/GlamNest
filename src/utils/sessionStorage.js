/**
 * Session storage utilities for payment state persistence
 * Encapsulates all session management logic with expiration and cleanup
 */

const SESSION_KEYS = {
    PAYMENT_SESSION: 'payment_session',
    PAYMENT_SESSION_EXPIRES: 'payment_session_expires',
    PAYMENT_AMOUNT: 'payment_amount',
    CART_ITEMS: 'cart_items',
    SHIPPING_INFO: 'shipping_info',
    ORDER_ID: 'order_id',
    YOCO_CHECKOUT_ID: 'yoco_checkout_id'
};

// Session expiration in minutes (30 minutes for payment sessions)
const SESSION_EXPIRATION_MINUTES = 30;

/**
 * Creates a new payment session with expiration
 * @param {Object} sessionData - Payment session data
 * @param {Array<any>} sessionData.cartItems - Cart items array
 * @param {number} sessionData.amount - Payment amount in ZAR
 * @param {Object} sessionData.shippingInfo - Shipping information
 * @param {string} sessionData.orderId - Order ID from Firestore
 * @param {string} [sessionData.yocoCheckoutId] - Yoco checkout ID
 */
export const createPaymentSession = (sessionData) => {
    try {
        const expirationTime = Date.now() + (SESSION_EXPIRATION_MINUTES * 60 * 1000);

        const paymentSession = {
            ...sessionData,
            _timestamp: Date.now(),
            _expiresAt: expirationTime
        };

        sessionStorage.setItem(SESSION_KEYS.PAYMENT_SESSION, JSON.stringify(paymentSession));
        sessionStorage.setItem(SESSION_KEYS.PAYMENT_SESSION_EXPIRES, expirationTime.toString());

        console.log('💰 Payment session created:', {
            orderId: sessionData.orderId,
            expiration: new Date(expirationTime).toLocaleString()
        });

        return true;
    } catch (error) {
        console.error('❌ Failed to create payment session:', error);
        return false;
    }
};

/**
 * Retrieves and validates the payment session
 * @returns {Object|null} Valid session data or null if expired/invalid
 */
export const getPaymentSession = () => {
    try {
        const sessionData = sessionStorage.getItem(SESSION_KEYS.PAYMENT_SESSION);
        const expiresAt = sessionStorage.getItem(SESSION_KEYS.PAYMENT_SESSION_EXPIRES);

        if (!sessionData || !expiresAt) {
            return null;
        }

        const expirationTime = parseInt(expiresAt, 10);
        if (Date.now() > expirationTime) {
            console.log('🕒 Payment session expired');
            clearPaymentSession();
            return null;
        }

        const parsedData = JSON.parse(sessionData);

        // Validate required fields (orderNumber is optional for display consistency)
        if (!parsedData.cartItems || !parsedData.amount || !parsedData.orderId) {
            console.warn('⚠️ Invalid payment session data');
            clearPaymentSession();
            return null;
        }

        return parsedData;
    } catch (error) {
        console.error('❌ Error retrieving payment session:', error);
        clearPaymentSession();
        return null;
    }
};

/**
 * Updates specific fields in the payment session
 * @param {Object} updates - Fields to update
 */
export const updatePaymentSession = (updates) => {
    try {
        const currentSession = getPaymentSession();
        if (!currentSession) {
            console.warn('⚠️ Cannot update - no active payment session');
            return false;
        }

        const updatedSession = {
            ...currentSession,
            ...updates,
            _timestamp: Date.now() // Refresh timestamp
        };

        sessionStorage.setItem(SESSION_KEYS.PAYMENT_SESSION, JSON.stringify(updatedSession));
        return true;
    } catch (error) {
        console.error('❌ Failed to update payment session:', error);
        return false;
    }
};

/**
 * Clears all payment session data
 */
export const clearPaymentSession = () => {
    try {
        Object.values(SESSION_KEYS).forEach(key => {
            sessionStorage.removeItem(key);
        });
        console.log('🧹 Payment session cleared');
    } catch (error) {
        console.error('❌ Failed to clear payment session:', error);
    }
};

/**
 * Gets the remaining session time in minutes
 * @returns {number} Minutes remaining or 0 if expired
 */
export const getSessionTimeRemaining = () => {
    try {
        const expiresAt = sessionStorage.getItem(SESSION_KEYS.PAYMENT_SESSION_EXPIRES);
        if (!expiresAt) return 0;

        const remaining = parseInt(expiresAt, 10) - Date.now();
        return Math.max(0, Math.ceil(remaining / 60000));
    } catch (error) {
        console.error('❌ Error calculating session time:', error);
        return 0;
    }
};

/**
 * Check if a valid payment session exists
 * @returns {boolean}
 */
export const hasValidPaymentSession = () => {
    return getPaymentSession() !== null;
};

// Deprecated individual keys (for backward compatibility during migration)
const migrationHelpers = {
    // These will be removed once all components use the centralized session
    setCartItemsRedirect: ( /** @type {Array<any>} */ items) => {
        console.warn('⚠️ Using deprecated setCartItemsRedirect - migrate to createPaymentSession');
        sessionStorage.setItem('cartItemsRedirect', JSON.stringify(items));
    },

    setPaymentAmount: ( /** @type {number} */ amount) => {
        console.warn('⚠️ Using deprecated setPaymentAmount - migrate to createPaymentSession');
        sessionStorage.setItem('paymentAmount', amount.toString());
    },

    setShippingInfo: ( /** @type {Object} */ info) => {
        console.warn('⚠️ Using deprecated setShippingInfo - migrate to createPaymentSession');
        sessionStorage.setItem('shippingInfo', JSON.stringify(info));
    }
};

export default {
    SESSION_KEYS,
    createPaymentSession,
    getPaymentSession,
    updatePaymentSession,
    clearPaymentSession,
    getSessionTimeRemaining,
    hasValidPaymentSession,
    ...migrationHelpers
};