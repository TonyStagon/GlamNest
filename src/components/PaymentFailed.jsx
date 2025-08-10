import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentSuccess.css'; // Reuse the same styles

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract any error details from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const errorMessage = urlParams.get('error') || 'Payment could not be processed';

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="checkmark" style={{ backgroundColor: '#dc3545', color: 'white' }}>
          ❌
        </div>
        <h1>Payment Failed</h1>
        <p className="success-message">
          Unfortunately, your payment could not be processed. Please try again.
        </p>
        
        <div className="order-details">
          <h2>What went wrong?</h2>
          <p>{errorMessage}</p>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <p><strong>Common reasons for payment failure:</strong></p>
            <ul style={{ textAlign: 'left', marginTop: '10px' }}>
              <li>Insufficient funds</li>
              <li>Incorrect card details</li>
              <li>Card expired or blocked</li>
              <li>Bank security restrictions</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="continue-button"
            onClick={() => navigate('/checkout')}
            style={{ backgroundColor: '#dc3545' }}
          >
            Try Again
          </button>
          <button 
            className="continue-button"
            onClick={() => navigate('/contact')}
            style={{ backgroundColor: '#6c757d' }}
          >
            Contact Support
          </button>
          <button 
            className="continue-button"
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#28a745' }}
          >
            Continue Shopping
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>Need help? Contact our support team with any payment issues.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;