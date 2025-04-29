// src/pages/Shop.jsx
import './Shop.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const Shop = () => {
  const [oceanicQuantity, setOceanicQuantity] = useState(1);
  const [celestialQuantity, setCelestialQuantity] = useState(1);

  const { addToCart } = useCart();

  const products = [
    {
      id: 1,
      name: 'Oceanic Breeze',
      price: 65.00,
      image: '/images/Perfume.png',
    },
    {
      id: 2,
      name: 'Celestial Bloom',
      price: 220.00,
      image: '/images/perfume2.png',
    },
  ];

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>GlamNest Perfume Boutique</h1>
        <p>Elevate your senses with our exquisite fragrance collection.</p>
      </div>

      {/* Oceanic Breeze Product */}
      <div className="shop-content">
        <div className="shop-image">
          <img src={products[0].image} alt="Oceanic Breeze Perfume" />
        </div>

        <div className="shop-details">
          <h2 className="product-title">{products[0].name}</h2>
          <p className="product-price">${products[0].price.toFixed(2)}</p>
          <p className="product-description">
            Oceanic Breeze captures the refreshing spirit of the sea with its invigorating notes of citrus and marine accords.
            This unisex fragrance is perfect for those who crave a light, airy scent that is both uplifting and soothing.
            Ideal for everyday wear, it keeps you feeling fresh and rejuvenated.
          </p>

          <div className="quantity-selector">
            <span>Quantity</span>
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => setOceanicQuantity(prev => Math.max(1, prev - 1))}
              >-</button>
              <span>{oceanicQuantity}</span>
              <button
                className="quantity-btn"
                onClick={() => setOceanicQuantity(prev => prev + 1)}
              >+</button>
            </div>
          </div>

          <button 
            className="add-to-cart-btn" 
            onClick={() => addToCart({
              ...products[0],
              quantity: oceanicQuantity
            })}
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>

      {/* Celestial Bloom Product */}
      <div className="shop-content" style={{ marginTop: '4rem' }}>
        <div className="shop-image">
          <img src={products[1].image} alt="Celestial Bloom Perfume" />
        </div>

        <div className="shop-details">
          <h2 className="product-title">{products[1].name}</h2>
          <p className="product-price">${products[1].price.toFixed(2)}</p>
          <p className="product-description">
            Celestial Bloom is a delicate yet powerful fragrance that intertwines floral and fruity notes.
            With its refreshing blend of peony and ripe pear, it leaves a trail of elegance and sophistication,
            ideal for any occasion.
          </p>

          <div className="quantity-selector">
            <span>Quantity</span>
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => setCelestialQuantity(prev => Math.max(1, prev - 1))}
              >-</button>
              <span>{celestialQuantity}</span>
              <button
                className="quantity-btn"
                onClick={() => setCelestialQuantity(prev => prev + 1)}
              >+</button>
            </div>
          </div>

          <button 
            className="add-to-cart-btn" 
            onClick={() => addToCart({
              ...products[1],
              quantity: celestialQuantity
            })}
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shop;