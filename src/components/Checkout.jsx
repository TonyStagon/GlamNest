/**
 * @file Checkout form component with cart sidebar
 */

import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { PaymentForm } from './PaymentForm';
import './Checkout.css';

/**
 * @typedef {Object} ContactInfo
 * @property {string} email
 * @property {string} phone
 * @property {string} note
 */

/**
 * @typedef {Object} ShippingInfo
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} address
 * @property {string} country
 * @property {string} state
 * @property {string} city 
 * @property {string} zip
 */

/**
 * @typedef {Object} FormData
 * @property {ContactInfo} contact
 * @property {ShippingInfo} shipping
 * @property {string} paymentMethod
 */

/**
 * @typedef {Object} FormErrors
 * @property {boolean} email
 * @property {boolean} firstName
 * @property {boolean} lastName
 * @property {boolean} address
 * @property {boolean} city
 * @property {boolean} zip
 */

/**
 * Checkout form component with cart sidebar
 * @return {React.JSX.Element} Checkout form
 */
const Checkout = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const DELIVERY_FEE = 1; // R75 delivery fee

  /** @type {FormData} */
  const initialFormData = {
    contact: {
      email: '',
      phone: '',
      note: ''
    },
    shipping: {
      firstName: '',
      lastName: '',
      address: '',
      country: 'South Africa',
      state: '',
      city: '',
      zip: ''
    },
    paymentMethod: ''
  };

  /** @type {FormErrors} */
  const initialErrors = {
    email: false,
    firstName: false,
    lastName: false,
    address: false,
    city: false,
    zip: false
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [showPayment, setShowPayment] = useState(false);

  /**
   * Calculate cart subtotal
   */
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  /**
   * Calculate total with delivery
   */
  const calculateTotal = () => {
    return calculateSubtotal() + DELIVERY_FEE;
  };

  /**
   * Handle order submission
   * @param {object} orderData
   */
  const handleOrderSubmission = (orderData) => {
    console.log('Order submitted:', orderData);
    // TODO: Implement order submission logic
  };

  /**
   * Handles input changes
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Safely handle field names with or without sections
    const parts = name.split('.');
    const section = parts.length > 1 ? parts[0] : null;
    const field = parts.length > 1 ? parts[1] : parts[0];

    setFormData(prev => {
      // Handle nested form fields
      if (section && (section === 'contact' || section === 'shipping')) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      // Handle top-level fields
      return {
        ...prev,
        [field]: value
      };
    });

    // Clear error when typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  /**
   * Validates form inputs
   * @return {boolean} True if form is valid
   */
  const validateForm = () => {
    const newErrors = {
      email: !formData.contact.email.includes('@'),
      firstName: !formData.shipping.firstName.trim(),
      lastName: !formData.shipping.lastName.trim(),
      address: !formData.shipping.address.trim(),
      city: !formData.shipping.city.trim(),
      zip: !formData.shipping.zip.trim()
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  return (
    <div className="checkout-layout">
      {/* Left side - Form */}
      <div className="checkout-form-container">
        <h1 className="checkout-title">Checkout</h1>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (validateForm()) {
            console.log('Form submitted:', formData);
            // Handle submission logic here
          }
        }}>
          {/* Additional Info Section */}
          <div className="checkout-section">
            <h3>Additional Info</h3>
            <div className="form-group">
              <label htmlFor="contact.note">Send us a note</label>
              <textarea
                id="contact.note"
                name="contact.note"
                value={formData.contact.note}
                onChange={handleInputChange}
                placeholder="Special instructions or notes..."
              />
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="checkout-section">
            <h3>Contact Info</h3>
            <div className="form-group">
              <label htmlFor="contact.email">Email for order confirmation</label>
              <input
                type="email"
                id="contact.email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="your@email.com"
                required
              />
              {errors.email && <span className="error-message">Valid email required</span>}
            </div>
            <div className="form-group">
              <label htmlFor="contact.phone">Phone Number</label>
              <input
                type="tel"
                id="contact.phone"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
              />
            </div>
          </div>

          {/* Shipping Info Section */}
          <div className="checkout-section">
            <h3>Shipping Info</h3>
            <div className="name-fields">
              <div className="form-group">
                <label htmlFor="shipping.firstName">First Name</label>
                <input
                  type="text"
                  id="shipping.firstName"
                  name="shipping.firstName"
                  value={formData.shipping.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="First Name"
                  required
                />
                {errors.firstName && <span className="error-message">First name required</span>}
              </div>
              <div className="form-group">
                <label htmlFor="shipping.lastName">Last Name</label>
                <input
                  type="text"
                  id="shipping.lastName"
                  name="shipping.lastName"
                  value={formData.shipping.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Last Name"
                  required
                />
                {errors.lastName && <span className="error-message">Last name required</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="shipping.address">Address</label>
              <input
                type="text"
                id="shipping.address"
                name="shipping.address"
                value={formData.shipping.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
                placeholder="Street address"
                required
              />
              {errors.address && <span className="error-message">Address required</span>}
            </div>

            <div className="address-fields">
              <div className="form-group">
                <label htmlFor="shipping.city">City</label>
                <input
                  type="text"
                  id="shipping.city"
                  name="shipping.city"
                  value={formData.shipping.city}
                  onChange={handleInputChange}
                  className={errors.city ? 'error' : ''}
                  placeholder="City"
                  required
                />
                {errors.city && <span className="error-message">City required</span>}
              </div>
              <div className="form-group">
                <label htmlFor="shipping.state">State/Province</label>
                <input
                  type="text"
                  id="shipping.state"
                  name="shipping.state"
                  value={formData.shipping.state}
                  onChange={handleInputChange}
                  placeholder="State/Province"
                />
              </div>
              <div className="form-group">
                <label htmlFor="shipping.zip">Postal Code</label>
                <input
                  type="text"
                  id="shipping.zip"
                  name="shipping.zip"
                  value={formData.shipping.zip}
                  onChange={handleInputChange}
                  className={errors.zip ? 'error' : ''}
                  placeholder="Postal Code"
                  required
                />
                {errors.zip && <span className="error-message">Postal code required</span>}
              </div>
            </div>
          </div>

          {!showPayment ? (
            <button
              type="button"
              className="continue-btn"
              onClick={() => validateForm() && setShowPayment(true)}
            >
              CONTINUE
            </button>
          ) : (
            <div className="payment-section">
              <h3>Payment Method</h3>
              <div className="payment-form-wrapper">
                <PaymentForm
                  amount={parseFloat(calculateTotal().toFixed(2))} // Ensure numeric value with 2 decimals
                  onSuccess={(paymentMethod) => {
                    handleOrderSubmission({
                      ...formData,
                      paymentMethod,
                      items: cartItems
                    });
                  }}
                />
              </div>
              <button
                type="button"
                className="back-btn"
                onClick={() => setShowPayment(false)}
              >
                Back to Shipping
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Right side - Cart Overview */}
      <div className="cart-overview">
        <div className="overview-header">
          <h2>OVERVIEW</h2>
        </div>
        
        <div className="cart-items-overview">
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item-overview">
                <div className="item-image-container">
                  {item.imageBase64 && (
                    <img
                      src={item.imageBase64}
                      alt={item.name}
                      className="product-image"
                      style={{
                        maxWidth: '80px',
                        height: 'auto'
                      }}
                    />
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">R{item.price.toFixed(2)}</p>
                  <div className="quantity-display">x {item.quantity}</div>
                </div>
                <div className="item-actions">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="cart-totals">
              <div className="total-line">
                <span>Subtotal</span>
                <span>R{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Shipping</span>
                <span>R{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="total-line total-final">
                <span>TOTAL</span>
                <span className="currency">ZAR</span>
                <span className="amount">R{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;