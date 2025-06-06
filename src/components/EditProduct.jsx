/**
 * @typedef {Object} Product
 * @property {string} name
 * @property {number} price
 * @property {string} category
 */

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          setError('Product ID is missing');
          return;
        }
        
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            name: data.name || '',
            price: data.price || 0,
            category: data.category || ''
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Error fetching product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!id) {
        setError('Missing product ID');
        return;
      }
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, product);
      navigate('/admin/view-products');
    } catch (err) {
      setError('Error updating product');
    }
  };

  if (!id) return <div>Product ID missing</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Product</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: '600' }}>Name:</label>
          <input
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: '600' }}>Price (R):</label>
          <input
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: '600' }}>Category:</label>
          <input
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Update Product
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default EditProduct;