// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminDashboard.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    quantity: 0,
    category: '',
    description: '',
    imageBase64: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [newImage, setNewImage] = useState(null);
  const fileInputRef = useRef(null);
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
            quantity: data.quantity || 0,
            category: data.category || '',
            description: data.description || '',
            imageBase64: data.imageBase64 || ''
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

  const handleChange = (e) => {
    if (!e || !e.target) return;
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    if (!e || !e.target || !e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!id) {
        setError('Missing product ID');
        return;
      }

      let uploadProduct = {...product};

      if (newImage) {
        uploadProduct.imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) resolve(reader.result.toString());
          };
          reader.readAsDataURL(newImage);
        });
      }

      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, uploadProduct);
      navigate('/admin/view-products');
    } catch (err) {
      setError('Error updating product');
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

  useEffect(() => {
    if (product.imageBase64) {
      setImagePreview(product.imageBase64);
    }
  }, [product.imageBase64]);

  if (!id) return <div>Product ID missing</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <button onClick={() => navigate('/admin')}>
          Dashboard
        </button>
        <button onClick={() => navigate('/admin/view-products')}>
          View Products
        </button>
        <button onClick={() => navigate('/admin/view-users')}>
          View Users
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="content" style={{ padding: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: '600' }}>Description:</label>
              <textarea
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                name="description"
                value={product.description}
                onChange={(e) => handleChange(e)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: '600' }}>Product Image:</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
              />
              {imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: '600' }}>Quantity:</label>
              <input
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                type="number"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                min="0"
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
            {error && <div style={{ color: '#dc3545', marginTop: '10px' }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;