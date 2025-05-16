// src/pages/Shop.jsx
import './Shop.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsData);
        
        // Initialize quantities
        const initialQuantities = {};
        productsData.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="shop-page">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="shop-page">No products available</div>;
  }

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, newQuantity)
    }));
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>GlamNest Perfume Boutique</h1>
        <p>Elevate your senses with our exquisite fragrance collection.</p>
      </div>

      {products.map((product, index) => (
        <div
          key={product.id}
          className="shop-content"
          style={index > 0 ? { marginTop: '4rem' } : {}}
        >
          <div className="shop-image">
            {product.imageBase64 && (
              <img src={product.imageBase64} alt={product.name} />
            )}
          </div>

          <div className="shop-details">
            <h2 className="product-title">{product.name}</h2>
            <p className="product-price">R{product.price.toFixed(2)}</p>
            <p className="product-description">
              {product.description || 'No description available'}
            </p>

            <div className="quantity-selector">
              <span>Quantity</span>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(product.id, quantities[product.id] - 1)}
                >-</button>
                <span>{quantities[product.id]}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(product.id, quantities[product.id] + 1)}
                >+</button>
              </div>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={() => addToCart({
                ...product,
                quantity: quantities[product.id]
              })}
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Shop;