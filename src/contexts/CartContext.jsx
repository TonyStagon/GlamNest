// src/contexts/CartContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * @typedef {{
 *   id: string
 *   name: string
 *   price: number
 *   quantity: number
 *   imageBase64: string
 * }} CartItem
 */

/**
 * @typedef {{
 *   cartItems: CartItem[]
 *   cartCount: number
 *   deliveryFee: number
 *   addToCart: (product: CartItem, quantity?: number) => void
 *   removeFromCart: (productId: string) => void
 *   updateQuantity: (productId: string, newQuantity: number) => void
 *   calculateTotal: () => number
 *   setDeliveryFee: (fee: number) => void
 * }} CartContextValue
 */

/** @type {import('react').Context<CartContextValue>} */
const CartContext = createContext(
  /** @type {CartContextValue} */ ({
    cartItems: [],
    cartCount: 0,
    deliveryFee: 1,
    addToCart: () => {
      throw new Error('useCart must be used within CartProvider')
    },
    removeFromCart: () => {
      throw new Error('useCart must be used within CartProvider')
    },
    updateQuantity: () => {
      throw new Error('useCart must be used within CartProvider')
    },
    calculateTotal: () => 0,
    setDeliveryFee: () => {
      throw new Error('useCart must be used within CartProvider')
    }
  })
);

/**
 * @param {{
 *   children: import('react').ReactNode
 * }} props
 */
export const CartProvider = ({ children }) => {
  /** @type {[CartItem[], React.Dispatch<React.SetStateAction<CartItem[]>>]} */
  const [cartItems, setCartItems] = useState(/** @type {CartItem[]} */([]));
  /** @type {[number, React.Dispatch<React.SetStateAction<number>>]} */
  const [cartCount, setCartCount] = useState(0);
  /** @type {[number, React.Dispatch<React.SetStateAction<number>>]} */
  const [deliveryFee, setDeliveryFee] = useState(1); // Default R75 delivery

  // Load cart when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Load user's cart from Firestore
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          const { items, count, deliveryFee: storedFee } = cartSnap.data();
          setCartItems(items || []);
          setCartCount(count || 0);
          if (storedFee) setDeliveryFee(storedFee);
        }
      } else {
        // Reset cart for logged out users
        setCartItems([]);
        setCartCount(0);
      }
    });
    return unsubscribe;
  }, []);

  // Save cart to Firestore whenever it changes
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const saveCart = async () => {
        const cartRef = doc(db, 'carts', user.uid);
        await setDoc(cartRef, {
          items: cartItems,
          count: cartCount,
          deliveryFee
        });
      };
      saveCart();
    }
  }, [cartItems, cartCount, deliveryFee]);

  
  /**
   * @param {CartItem} product
   * @param {number} [quantity=1]
   */
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const currentItems = prevItems;
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });
    
    setCartCount(prevCount => prevCount + quantity);
  };

  /**
   * @param {string} productId
   */
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const currentItems = prevItems;
      const itemToRemove = currentItems.find(item => item.id === productId);
      if (itemToRemove) {
        setCartCount(prevCount => prevCount - itemToRemove.quantity);
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  /**
   * @param {string} productId
   * @param {number} newQuantity
   */
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems => {
      const currentItems = prevItems;
      const updatedItems = currentItems.map(item => {
        if (item.id === productId) {
          const quantityDifference = newQuantity - item.quantity;
          setCartCount(prevCount => prevCount + quantityDifference);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return updatedItems;
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        deliveryFee,
        setDeliveryFee
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};