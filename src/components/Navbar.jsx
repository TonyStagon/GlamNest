import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
/**
 * @type {import('../contexts/CartContext').useCart}
 */
import { useCart } from '../contexts/CartContext';
import { auth } from '../firebase';
import CartPopup from './CartPopup';
import './Navbar.css';

// @ts-check
/**
 * @typedef {Object} Props
 * @property {boolean} showLogin
 * @property {(value: boolean) => void} setShowLogin
 */

/** @type {React.FC<Props>} */
const Navbar = ({ showLogin, setShowLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const dropdownRef = useRef(/** @type {NodeJS.Timeout|null} */ (null));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        clearDropdownTimeout();
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  const clearDropdownTimeout = () => {
    if (dropdownRef.current) {
      clearTimeout(dropdownRef.current);
      dropdownRef.current = null;
    }
  };

  const setDropdownDelay = (/** @type {number} */ delay) => {
    clearDropdownTimeout();
    dropdownRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, delay);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = (/** @type {React.MouseEvent} */ e) => {
    e?.stopPropagation();
    setIsCartOpen(!isCartOpen);
  };
  const toggleDropdown = (/** @type {React.MouseEvent} */ e) => {
    e?.stopPropagation();
    if (showDropdown) {
      setShowDropdown(false);
    } else {
      clearDropdownTimeout();
      setShowDropdown(true);
    }
  };

  const handleMouseEnterDropdown = () => {
    clearDropdownTimeout();
  };

  const handleMouseLeaveDropdown = () => {
    setDropdownDelay(500); // Increased from 300ms to 500ms for better user experience
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/');
      setShowDropdown(false);
    });
  };

  const handleNavigation = (/** @type {string} */ sectionId) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        <Link to="/" className="nav-logo">GLAMNEST</Link>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Profile Dropdown Container */}
          <div className="profile-dropdown-container">
            <div className="profile-container"
                 onClick={toggleDropdown}
                 onMouseEnter={handleMouseEnterDropdown}
                 onMouseLeave={handleMouseLeaveDropdown}>
              <div className="profile-icon-clickable">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {isLoggedIn && <div className="profile-dot"></div>}
              </div>
              {!isLoggedIn && <span className="login-text">Login</span>}
            </div>

            {showDropdown && (
              <div className="profile-dropdown"
                   onMouseEnter={handleMouseEnterDropdown}
                   onMouseLeave={handleMouseLeaveDropdown}>
                {isLoggedIn ? (
                  <>
                    <div className="dropdown-item"
                         onClick={() => { setShowDropdown(false); navigate('/account'); }}>
                      Account
                    </div>
                    <div className="dropdown-item"
                         onClick={() => { setShowDropdown(false); handleLogout(); }}>
                      Logout
                    </div>
                  </>
                ) : (
                  <div className="dropdown-item"
                       onClick={() => { setShowDropdown(false); navigate('/login'); }}>
                    Login
                  </div>
                )}
              </div>
            )}
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
          <Link to="/shop" className="nav-link" onClick={() => setIsMenuOpen(false)}>SHOP</ Link>
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