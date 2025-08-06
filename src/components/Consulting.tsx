import React, { useState, useEffect } from 'react';
import davidImage from '../assets/david.png';
import logoImage from '../assets/iconlong.png';

function Consulting() {
  const [showManifesto, setShowManifesto] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const manifestoText = "Our mission is to back those who dare to build something better. We support driven founders who see gaps in the system, who refuse to settle for the way things are, and who are ready to take on entrenched giants with sharper ideas, stronger purpose, and relentless execution.\n\nBecause the future doesn't belong to the biggest—it belongs to the bravest.";
  
  const handleManifestoClick = () => {
    if (!showManifesto) {
      setShowManifesto(true);
      setDisplayText('');
      setIsTyping(true);
    } else {
      setShowManifesto(false);
    }
  };
  
  useEffect(() => {
    if (!isTyping || !showManifesto) return;
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= manifestoText.length) {
        setDisplayText(manifestoText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 20);
    
    return () => clearInterval(typingInterval);
  }, [showManifesto, isTyping]);

  return (
    <div className="app-container">
      {/* David Image */}
      <img 
        className="david-image" 
        src={davidImage} 
        alt="David"
      />
      
      {/* Navigation */}
      <nav className="main-nav">
        <div className="logo-container">
          <img 
            src={logoImage} 
            alt="DGCG Logo" 
            style={{ height: '40px', width: 'auto' }}
          />
        </div>
        
        <div className="nav-links">
          <button className="nav-link" onClick={handleManifestoClick}>
            Our Manifesto
          </button>
          <a 
            href="https://www.linkedin.com/company/dgcg/about/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
          >
            Socials
          </a>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="content-container">
        <div className="hero-section">
          <h1 className="hero-title">David / Goliath</h1>
          <p className="hero-subtitle">
            [ Consulting Group ] - /de'v'd/ /ɡəˈla'.əθ/
          </p>
          
          <div className="manifesto-section">
            <button 
              className="manifesto-toggle" 
              onClick={handleManifestoClick}
            >
              Manifesto:
            </button>
            {showManifesto && (
              <p>
                {displayText}
                {isTyping && <span className="cursor">|</span>}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="copyright">© 2025 DGCG. All rights reserved.</div>
          <div className="contact">info@dgcgroup.co</div>
        </div>
      </footer>
    </div>
  );
}

export default Consulting;