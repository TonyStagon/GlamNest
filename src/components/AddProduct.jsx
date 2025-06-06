import { useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import './AddProduct.css';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(/** @type {File | null} */ null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const categories = [
    'Makeup',
    'Skincare',
    'Haircare',
    'Fragrance',
    'Accessories'
  ];

  const handleImageChange = (/** @type {React.ChangeEvent<HTMLInputElement>} */ e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (/** @type {React.FormEvent} */ e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      let imageBase64 = '';
      
      if (image) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (!reader.result) return;
            resolve(typeof reader.result === 'string' ? reader.result : '');
          };
          reader.readAsDataURL(image);
        });
      }

      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description,
        category,
        imageBase64,
        createdAt: new Date()
      });

      setMessage('Product added successfully!');
      setName('');
      setPrice('');
      setQuantity('');
      setDescription('');
      setCategory('');
      setImage(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage(`Error adding product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Price (ZAR)</label>
          <input 
            type="number" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label>Quantity Available</label>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default AddProduct;