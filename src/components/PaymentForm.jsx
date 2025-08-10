/**
 * Yoco payment form component using the new Checkout API
 * @param {Object} props - Component properties
 * @param {number} props.amount - Payment amount in ZAR (South African Rand)
 */
// @ts-check
"use strict";
import { useState } from 'react';

import './PaymentForm.css';

/**
 * @param {Object} props
 * @param {number} props.amount
 */
export const PaymentForm = ({ amount }) => {
  /** @type {[boolean, (value: boolean) => void]} */
  const [isProcessing, setIsProcessing] = useState(false);
  
  /** @type {[string|null, (error: string|null) => void]} */
  const [error, setError] = useState(/** @type {string|null} */ (null));
  
  /** @type {[string|null, (id: string|null) => void]} */
  const [checkoutId, setCheckoutId] = useState(/** @type {string|null} */ (null));

  const handleYocoCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    console.log('🎯 Starting Yoco checkout:', {
      amount: amount,
      formattedAmount: amount.toLocaleString('en-ZA', {style: 'currency', currency: 'ZAR'}),
      currency: 'ZAR'
    });

    try {
      // 1. Create checkout session
      // Note the full backend URL (must match your server base URL)
      // Use Vite proxy path (/api gets rewritten to localhost:5000)
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert Rands to cents
          currency: 'ZAR'
        })
      });

      const data = await response.json();
      console.log('📡 Checkout response:', { status: response.status, data });
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success && data.redirectUrl) {
        console.log('✅ Checkout created successfully:', {
          checkoutId: data.checkoutId,
          redirectUrl: data.redirectUrl
        });
        
        setCheckoutId(data.checkoutId);
        
        // 2. Redirect to Yoco checkout page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }

    } catch (error) {
      console.error('❌ Checkout error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!checkoutId) return;
    
    try {
      const response = await fetch(`/api/checkout/status/${checkoutId}`);
      const data = await response.json();
      
      console.log('📊 Payment status:', data);
      
      if (data.success) {
        alert(`Payment Status: ${data.status}`);
      } else {
        alert('Failed to check payment status');
      }
    } catch (error) {
      console.error('❌ Status check error:', error);
      alert('Error checking payment status');
    }
  };

  return (
    <div>
      <div className="order-summary">
        <h3>Order Details</h3>
        <div className="breakdown">
          <div className="total-line">
            <span>Items Subtotal</span>
            <span>{(amount - 1).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
          </div>
          <div className="total-line">
            <span>Delivery Fee</span>
            <span>R1.00</span>
          </div>
          <div className="total-line">
            <span className="total-label">Total Amount</span>
            <span className="total-amount">
              {amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          border: '1px solid red', 
          borderRadius: '4px',
          marginBottom: '10px',
          backgroundColor: '#ffebee'
        }}>
          ❌ Error: {error}
        </div>
      )}

      <button 
        onClick={handleYocoCheckout}
        disabled={isProcessing}
        style={{
          backgroundColor: isProcessing ? '#ccc' : '#007bff',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginRight: '10px'
        }}
      >
        {isProcessing ? '⏳ Processing...' : '💳 Pay with Yoco'}
      </button>

      {checkoutId && (
        <button 
          onClick={checkPaymentStatus}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📊 Check Status
        </button>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>💡 <strong>How it works:</strong></p>
        <ol>
          <li>Click "Pay with Yoco" to start checkout</li>
          <li>You'll be redirected to Yoco's secure payment page</li>
          <li>Complete payment with your card or bank</li>
          <li>You'll be redirected back after payment</li>
        </ol>
      </div>

      {/* Development/Testing Notes */}
      {import.meta.env.DEV && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>🔧 Development Info:</strong><br />
          Checkout ID: {checkoutId || 'Not created yet'}<br />
          Amount: R{amount} ({amount * 100} cents)<br />
          Status: {isProcessing ? 'Processing' : 'Ready'}
        </div>
      )}
    </div>
  );
};