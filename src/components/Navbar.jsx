// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartPopup from './CartPopup';
import './Navbar.css';

const Navbar = ({ showLogin, setShowLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleProfileClick = () => {
    // Navigate to login page when clicked
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleNavigation = (sectionId) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        <Link to="/" className="nav-logo">GLAMNEST</Link>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Profile Container with Login Text and Icon */}
          <div className="profile-container" onClick={handleProfileClick}>
            <span className="login-text">LOGIN</span>
            <div className="profile-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>

          {/* Cart Icon */}
          <div className="cart-icon" onClick={toggleCart}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>

          {/* Hamburger Menu */}
          <div className="hamburger" onClick={toggleMenu}>
            <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => handleNavigation('home')}>HOME</Link>
          <Link to="/shop" className="nav-link" onClick={() => setIsMenuOpen(false)}>SHOP</Link>
          <Link to="/" className="nav-link" onClick={() => handleNavigation('products')}>EXPLORE PRODUCTS</Link>
          <Link to="/" className="nav-link" onClick={() => handleNavigation('contact')}>CONTACT</Link>
        </div>

        {/* Cart Popup */}
        <CartPopup
          isOpen={isCartOpen}
          onClose={toggleCart}
          showLogin={showLogin}
          setShowLogin={setShowLogin}
        />
      </div>
    </nav>
  );
};

export default Navbar;