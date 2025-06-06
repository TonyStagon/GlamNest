// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      setError('Error fetching products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        setError('Error deleting product');
        console.error('Error:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) return <div className="admin-dashboard">Loading...</div>;
  if (error) return <div className="admin-dashboard">{error}</div>;

  return (
    <>
      <div className="content">
        <h2>Product List</h2>
        <div className="product-table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Category</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>R{Number(product.price).toFixed(2)}</td>
                    <td>{product.quantity}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.imageBase64 && (
                        <img 
                          src={product.imageBase64} 
                          alt={product.name}
                          style={{
                            maxWidth: '50px',
                            maxHeight: '50px',
                            objectFit: 'contain'
                          }} 
                        />
                      )}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ViewProducts;