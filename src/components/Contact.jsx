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
          <form className="contact-form" action="https://formsubmit.co/tutarthurs@gmail.com" method="POST">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows="4" name="message" required></textarea>
            </div>
            <button type="submit" className="submit-btn">SEND MESSAGE</button>
          </form>

          {/* Location Info (hidden on mobile) */}
          {!isMobile && (
            <div className="locations-container">
              <div className="map-container">
                <iframe
                  title="GlamNest Location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=28.2290%2C-25.7465%2C28.2300%2C-25.7455&layer=mapnik&marker=-25.7460%2C28.2295"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="locations-list">
                <div className="location-item">
                  <h3>110 Bernini Cres, Die Hoewes</h3>
                  <p>Pretoria, 0081</p>
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