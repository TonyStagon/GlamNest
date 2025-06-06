/**
 * @file Checkout form component with JSDoc type annotations
 */

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

import React, { useState } from 'react';

/**
 * Checkout form component
 * @return {React.JSX.Element} Checkout form
 */
const Checkout = () => {
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

  /**
   * Handles input changes
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e
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

  // ... Rest of component JSX remains unchanged ...

  return (
    // Previous JSX structure
    <div className="checkout-container">
      {/* Previous form structure */}
    </div>
  );
};

export default Checkout;