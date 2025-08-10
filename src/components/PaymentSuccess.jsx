import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

/**
 * @typedef {Object} OrderItem
 * @property {string} name
 * @property {number} price
 */

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  const orderDetails = state?.orderDetails || {
    orderId: new Date().getTime(),
    amount: state?.amount || 0,
    items: state?.items || []
  };

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="checkmark">✓</div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        <div className="order-details">
          <h2>Order Details</h2>
          <p>Order #: {orderDetails.orderId}</p>
          <p>Amount: R{(orderDetails.amount / 100).toFixed(2)}</p>
          
          {orderDetails.items.length > 0 && (
            <div className="items-list">
              <h3>Items Purchased:</h3>
              {orderDetails.items.map((
                /** @type {OrderItem} */ item,
                /** @type {number} */ index
              ) => (
                <div key={index} className="item">
                  <p>{item.name} - R{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className="continue-button"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;