import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    address: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleProfileEdit = () => {
    setIsEditing(true);
  };

  const handleProfileSave = async () => {
    try {
      setError('');
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditing(false);
    } catch {
      setError('Failed to update profile');
    }
  };

  const handleProfileCancel = () => {
    setIsEditing(false);
    setProfileData({
      displayName: '',
      phone: '',
      address: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch {
      setError('Failed to log out');
    }
  };

  const handleDeleteAccount = () => {
    alert('Account deletion feature coming soon!');
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>My Account</h1>
        <p>Welcome, {user.email}</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="account-tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Orders
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="tab-content">
            <h2>Profile Information</h2>
            <div className="profile-card">
              <div className="profile-field">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="profile-field">
                <strong>Last Login:</strong> {new Date().toLocaleDateString()}
              </div>
              <div className="profile-field">
                <strong>Account Created:</strong> Coming soon
              </div>
              
              {isEditing ? (
                <>
                  <div className="profile-edit-field">
                    <label>Display Name:</label>
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      placeholder="Enter display name"
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label>Phone:</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label>Address:</label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      rows={3}
                    />
                  </div>
                  <div className="profile-actions">
                    <button className="btn-primary" onClick={handleProfileSave}>
                      Save
                    </button>
                    <button className="btn-secondary" onClick={handleProfileCancel}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {profileData.displayName && (
                    <div className="profile-field">
                      <strong>Display Name:</strong> {profileData.displayName}
                    </div>
                  )}
                  {profileData.phone && (
                    <div className="profile-field">
                      <strong>Phone:</strong> {profileData.phone}
                    </div>
                  )}
                  {profileData.address && (
                    <div className="profile-field">
                      <strong>Address:</strong> {profileData.address}
                    </div>
                  )}
                  <button className="btn-primary" onClick={handleProfileEdit}>
                    Edit Profile
                  </button>
                  <div className="danger-zone">
                    <h3>Account Controls</h3>
                    <button className="btn-danger" onClick={handleDeleteAccount}>
                      Delete Account
                    </button>
                    <p className="danger-note">Permanently delete your account and data</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="tab-content">
            <h2>Order History</h2>
            <div className="orders-card">
              <p>User order history is coming soon!</p>
              <p>The system will show your completed purchases with details like:</p>
              <ul>
                <li>Order status and tracking information</li>
                <li>Purchase history and receipts</li>
                <li>Delivery updates and notifications</li>
                <li>Easy returns and customer support</li>
              </ul>
              <button className="btn-primary" onClick={() => navigate('/shop')}>
                Start Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
