import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css'; // Reuse the same styles

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="checkmark" style={{ backgroundColor: '#ff9800', color: 'white' }}>
          ⚠️
        </div>
        <h1>Payment Cancelled</h1>
        <p className="success-message">
          You cancelled the payment process. No charges were made to your account.
        </p>
        
        <div className="order-details">
          <h2>What happened?</h2>
          <p>You chose to cancel the payment before it was completed.</p>
          <p>Your cart items are still saved and ready for checkout when you're ready.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            className="continue-button"
            onClick={() => navigate('/checkout')}
            style={{ backgroundColor: '#ff9800' }}
          >
            Return to Checkout
          </button>
          <button 
            className="continue-button"
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#6c757d' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;