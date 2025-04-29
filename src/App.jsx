// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Add Router
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductCarousel from './components/ProductCarousel';
import Contact from './components/Contact';
import Shop from './pages/Shop'; // Import the Shop page
import './App.css';

function App() {
  useEffect(() => {
    // Add/remove body class when menu is open/closed
    const handleBodyClass = () => {
      if (document.querySelector('.nav-links.open')) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
    };

    // Run initially
    handleBodyClass();

    // Set up mutation observer to watch for class changes
    const observer = new MutationObserver(handleBodyClass);
    const target = document.querySelector('.nav-links');
    if (target) {
      observer.observe(target, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <main>
              <section id="home">
                <HeroSection />
              </section>
              <section id="products">
                <ProductCarousel />
              </section>
              <section id="contact">
                <Contact />
              </section>
            </main>
          } />
          
          {/* Shop Page */}
          <Route path="/shop" element={<Shop />} />
          </Routes>
        </Router>
      </CartProvider>
    </div>
  );
}

export default App;
