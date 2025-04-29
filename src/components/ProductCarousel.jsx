import { useRef, useState, useEffect } from 'react';
import './ProductCarousel.css';

const ProductCarousel = () => {
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample product data with "UNVEIL UNIQUE FRAGRANCES" moved to the second position
  const products = [
    {
      id: 1,
      title: "INDULE IN LUXURY",
      subtitle: "CANDLES",
      description: "TRANSFORM YOUR SPACE WITH OUR LUXURIOUS CANDLES, DESIGNED TO CREATE AN INVITING ATMOSPHERE. EXPERIENCE A BLEND OF CAPTIVATING SCENTS THAT SOOTHE THE SENSES.",
      cta: "Browse Candles",
      image: "/public/images/shaped3.png" // Update with your actual image path
    },
    {
      id: 3, // Keeping original ID
      title: "UNVEIL UNIQUE FRAGRANCES",
      subtitle: "",
      description: "EXPLORE OUR EXCLUSIVE COLLECTION OF UNIQUE PERFUMES THAT EMBODY SOPHISTICATION AND STYLE. EACH SCENT IS CAREFULLY CRAFTED TO LEAVE A LASTING IMPRESSION.",
      cta: "Discover More",
      image: "/public/images/Perfume3.png" // Update with your actual image path
    },
    {
      id: 2, // Keeping original ID
      title: "ENHANCE YOUR BEAUTY ROUTINE",
      subtitle: "",
      description: "DISCOVER OUR RANGE OF BEAUTY PRODUCTS, INCLUDING WEIGHT GAINING SOLUTIONS THAT COMPLEMENT YOUR LIFESTYLE. ELEVATE YOUR SELF-CARE REGIMEN WITH GLAMNEST.",
      cta: "View Products",
      image: "/public/images/weight.jpg" // Update with your actual image path
    }
  ];

  // Function to navigate to previous slide
  const goToPrevSlide = () => {
    if (carouselRef.current) {
      const newSlide = currentSlide > 0 ? currentSlide - 1 : products.length - 1;
      carouselRef.current.scrollTo({
        left: newSlide * carouselRef.current.clientWidth,
        behavior: 'smooth'
      });
      setCurrentSlide(newSlide);
    }
  };

  // Function to navigate to next slide
  const goToNextSlide = () => {
    if (carouselRef.current) {
      const newSlide = currentSlide < products.length - 1 ? currentSlide + 1 : 0;
      carouselRef.current.scrollTo({
        left: newSlide * carouselRef.current.clientWidth,
        behavior: 'smooth'
      });
      setCurrentSlide(newSlide);
    }
  };

  // Handle scroll events to update current slide
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const scrollPosition = carouselRef.current.scrollLeft;
        const slideWidth = carouselRef.current.clientWidth;
        const newSlideIndex = Math.round(scrollPosition / slideWidth);
        
        if (newSlideIndex !== currentSlide) {
          setCurrentSlide(newSlideIndex);
        }
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [currentSlide]);

  return (
    <section className="product-carousel" id="products">
      <div className="carousel-container" ref={carouselRef}>
        {products.map((product, index) => (
          <div key={product.id} className="carousel-slide">
            <div className="slide-content">
              <h2>{product.title}</h2>
              {product.subtitle && <h3>{product.subtitle}</h3>}
              <p>{product.description}</p>
              <button className="carousel-btn">{product.cta}</button>
            </div>
            <div className="slide-image" style={{ backgroundImage: `url(${product.image})` }}></div>
          </div>
        ))}
      </div>
      
      {/* Angular Navigation arrows that match the image */}
      <button className="angular-nav-btn prev" onClick={goToPrevSlide}>
        <div className="arrow-icon prev-icon"></div>
      </button>
      <button className="angular-nav-btn next" onClick={goToNextSlide}>
        <div className="arrow-icon next-icon"></div>
      </button>
    </section>
  );
};

export default ProductCarousel;