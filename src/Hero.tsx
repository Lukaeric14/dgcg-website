import React from 'react';
import './Hero.css';

const Hero: React.FC = () => (
  <section className="hero">
    <div className="hero-content">
      <h1 className="hero-title">David / Goliath</h1>
      <p className="hero-subtitle">
        [Consulting Group]  -  /dəˈvid/ /ɡəˈla'.əθ/
      </p>
    </div>
    <img 
      src={process.env.PUBLIC_URL + '/david.png'} 
      alt="David" 
      className="david-image"
    />
  </section>
);

export default Hero; 