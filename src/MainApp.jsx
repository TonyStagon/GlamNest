import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import EditProduct from './components/EditProduct';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Checkout from './components/Checkout';
import HeroSection from './components/HeroSection';
import ProductCarousel from './components/ProductCarousel';
import Contact from './components/Contact';
import Shop from './pages/Shop';
import Login from './components/Login';
import PaymentCancelled from './components/PaymentCancelled';
import PaymentFailed from './components/PaymentFailed';
import PaymentSuccess from './components/PaymentSuccess'; // Import the payment success component

function MainApp() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleBodyClass = () => {
      if (document.querySelector('.nav-links.open')) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
    };

    handleBodyClass();

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
        {!isAdminRoute && <Navbar showLogin={showLogin} setShowLogin={setShowLogin} />}
        {showLogin && <Login setShowLogin={setShowLogin} />}
        <Routes>
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
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login setShowLogin={setShowLogin} />} />
          
          {/* Payment result routes - ADD THESE */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit-product/:id" element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          } />
          <Route path="/admin/view-users" element={
            <ProtectedRoute>
              <AdminDashboard initialTab="users" />
            </ProtectedRoute>
          } />
          <Route path="/admin/view-products" element={
            <ProtectedRoute>
              <AdminDashboard initialTab="products" />
            </ProtectedRoute>
          } />
       </Routes>
     </CartProvider>
   </div>
  );
}

export default MainApp;