import { useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import AddProduct from './AddProduct';
import ViewProducts from './ViewProducts';
import ViewUsers from './ViewUsers';
import './AdminDashboard.css';

const AdminDashboard = ({ initialTab = 'add' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
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
        <button
          className={activeTab === 'view' ? 'active' : ''}
          onClick={() => setActiveTab('view')}
        >
          View Products
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          View Users
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        {activeTab === 'add' && <AddProduct />}
        {activeTab === 'view' && <ViewProducts />}
        {activeTab === 'users' && <ViewUsers />}
      </div>
    </div>
  );
};

export default AdminDashboard;