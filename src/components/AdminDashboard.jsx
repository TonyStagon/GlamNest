import { useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import AddProduct from './AddProduct';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('add');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <button 
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Add Product
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        {activeTab === 'add' && <AddProduct />}
      </div>
    </div>
  );
};

export default AdminDashboard;