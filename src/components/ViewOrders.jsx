import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import './ViewOrders.css';

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber
 * @property {number} totalAmount
 * @property {number} subtotal
 * @property {number} deliveryFee
 * @property {string} status
 * @property {Object} contact
 * @property {string} contact.email
 * @property {string} contact.phone
 * @property {string} contact.note
 * @property {Object} shipping
 * @property {string} shipping.firstName
 * @property {string} shipping.lastName
 * @property {string} shipping.address
 * @property {string} shipping.city
 * @property {string} shipping.state
 * @property {string} shipping.zip
 * @property {string} shipping.country
 * @property {Array<any>} items
 * @property {Object} createdAt
 * @property {string} paymentMethod
 */

const ViewOrders = () => {
  /** @type {[Order[], React.Dispatch<React.SetStateAction<Order[]>>]} */
  const [orders, setOrders] = useState(/** @type {Order[]} */([]));
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [loading, setLoading] = useState(true);
  /** @type {[string|null, React.Dispatch<React.SetStateAction<string|null>>]} */
  const [error, setError] = useState(/** @type {string|null} */(null));
  /** @type {[string|null, React.Dispatch<React.SetStateAction<string|null>>]} */
  const [selectedOrderId, setSelectedOrderId] = useState(/** @type {string|null} */(null));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query orders collection, ordered by creation date (newest first)
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = /** @type {Order[]} */(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      console.log('📦 Fetched orders:', ordersData.length);
      setOrders(ordersData);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (/** @type {any} */ timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const getStatusBadge = (/** @type {any} */ status) => {
    const statusColors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      shipped: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: statusColors[/** @type {keyof typeof statusColors} */(status)] || '#6c757d',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const toggleOrderDetails = (/** @type {string} */ orderId) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="view-orders">
        <h2>📦 Orders Management</h2>
        <div className="loading">⏳ Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-orders">
        <h2>📦 Orders Management</h2>
        <div className="error">❌ {error}</div>
        <button onClick={fetchOrders} className="retry-btn">
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="view-orders">
      <div className="orders-header">
        <h2>📦 Orders Management</h2>
        <div className="orders-stats">
          <span>Total Orders: {orders.length}</span>
          <button onClick={fetchOrders} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>📭 No orders found</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => toggleOrderDetails(order.id)}>
                <div className="order-main-info">
                  <h3>Order #{order.orderNumber || order.id.substring(0, 8)}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-summary">
                  <div className="order-amount">R{order.totalAmount?.toFixed(2) || '0.00'}</div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="expand-icon">
                  {selectedOrderId === order.id ? '▼' : '▶'}
                </div>
              </div>

              {selectedOrderId === order.id && (
                <div className="order-details">
                  {/* Customer Information */}
                  <div className="details-section">
                    <h4>👤 Customer Information</h4>
                    <div className="customer-info">
                      <p><strong>Name:</strong> {order.shipping?.firstName} {order.shipping?.lastName}</p>
                      <p><strong>Email:</strong> {order.contact?.email}</p>
                      <p><strong>Phone:</strong> {order.contact?.phone || 'Not provided'}</p>
                      {order.contact?.note && (
                        <p><strong>Note:</strong> {order.contact.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="details-section">
                    <h4>🏠 Delivery Address</h4>
                    <div className="shipping-info">
                      <p>{order.shipping?.address}</p>
                      <p>
                        {order.shipping?.city}
                        {order.shipping?.state && `, ${order.shipping.state}`}
                        {order.shipping?.zip && ` ${order.shipping.zip}`}
                      </p>
                      <p>{order.shipping?.country || 'South Africa'}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="details-section">
                    <h4>🛍️ Order Items</h4>
                    <div className="order-items">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-details">
                              <span className="item-name">{item.name}</span>
                              <span className="item-price">R{item.price?.toFixed(2)} × {item.quantity || 1}</span>
                            </div>
                            <div className="item-total">
                              R{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No items found</p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="details-section">
                    <h4>💰 Order Summary</h4>
                    <div className="order-totals">
                      <div className="total-line">
                        <span>Subtotal:</span>
                        <span>R{order.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="total-line">
                        <span>Delivery Fee:</span>
                        <span>R{order.deliveryFee?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="total-line total-final">
                        <span><strong>Total:</strong></span>
                        <span><strong>R{order.totalAmount?.toFixed(2) || '0.00'}</strong></span>
                      </div>
                      <div className="payment-method">
                        <span>Payment Method: {order.paymentMethod || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewOrders;