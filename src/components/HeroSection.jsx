import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowVideo(prev => !prev);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-container">
      <video
        autoPlay
        loop
        muted
        className={`hero-video ${showVideo ? 'visible' : 'hidden'}`}
      >
        <source src="/public/video/fragrance.mp4" type="video/mp4" />
      </video>
      <div className={`hero-image ${!showVideo ? 'visible' : 'hidden'}`}></div>
      <div className="overlay">
        <p className="tagline">
          Your premier destination for exquisite perfumes and beauty essentials that elevate your everyday experience.
        </p>
        <h1 className="headline">Welcome to GlamNest</h1>
        <button className="shop-btn" onClick={() => navigate('/shop')}>Shop Now</button>
      </div>
    </div>
  );
};

export default HeroSection;
