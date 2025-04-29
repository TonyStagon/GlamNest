import { useState, useEffect } from 'react';
import './Contact.css';

const Contact = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <h2>Get in Touch with Us</h2>
        <p className="subtitle">We are here to assist you with any inquiries or feedback.</p>
        
        <div className="contact-content">
          {/* Contact Form (always visible) */}
          <form className="contact-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows="4" required></textarea>
            </div>
            <button type="submit" className="submit-btn">SEND MESSAGE</button>
          </form>

          {/* Location Info (hidden on mobile) */}
          {!isMobile && (
            <div className="locations-container">
              <div className="map-container">
                <iframe
                  title="GlamNest Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.123456789012!2d28.1585!3d-25.8604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e9561c1e45dfb3d%3A0x123456789abcdeff!2s11%20Bernini%20Cres%2C%20Die%20Hoewes%2C%20Centurion%2C%200163!5e0!3m2!1sen!2sza!4v1620000000000!5m2!1sen!2sza"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="locations-list">
                <div className="location-item">
                  <h3>11 Bernini Cres, Die Hoewes</h3>
                  <p>Centurion, 0163</p>
                  <p>Mon-Fri 9am-5pm, Sat 9am-1pm</p>
                  <p>012-345-6789</p>
                </div>
                {/* Other location items... */}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;