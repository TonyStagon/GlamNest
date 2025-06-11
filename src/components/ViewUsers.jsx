// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched users:', usersList);
      setUsers(usersList);
      
      if (usersList.length === 0) {
        console.warn('No users found in collection');
      }
    } catch (error) {
      setError(`Error fetching users: ${error.message}`);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
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
    fetchUsers();
  }, []);

  if (loading) return <div className="admin-dashboard">Loading...</div>;
  if (error) return <div className="admin-dashboard">{error}</div>;

  return (
    <div className="content">
      <h2>Registered Users</h2>
      <div className="user-table-container">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>UID</th>
              <th>Signup Date</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.id}</td>
                  <td>
                    {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
};

export default ViewUsers;