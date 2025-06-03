// src/components/CartPopup.jsx
import { useCart } from '../contexts/CartContext';
import './CartPopup.css';

const CartPopup = ({ isOpen, onClose, showLogin, setShowLogin }) => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const DELIVERY_FEE = 75; // R75 delivery fee

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + DELIVERY_FEE;
    };


    if (!isOpen) return null;

    return (
        <div className={`cart-popup-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className={`cart-popup ${isOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="cart-popup-header">
          <h2>YOUR CART</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{item.price.toFixed(2)}</p>
                </div>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="cart-total">
              <div className="total-row">
                <span>Subtotal</span>
                <span>R {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee</span>
                <span>R {DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Total</span>
                <span>R {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              className="checkout-btn"
              onClick={() => setShowLogin(true)}
            >
              CHECKOUT
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPopup;