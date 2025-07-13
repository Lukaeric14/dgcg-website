import React from 'react';
import logoImage from './assets/iconlong.png';
import './NavBar.css';

interface NavBarProps {
  onManifestoClick?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onManifestoClick }) => {
  return (
    <nav className="navbar">
      <img
        className="navbar-logo"
        src={logoImage}
        alt="Logo"
        style={{ height: '40px', width: 'auto' }}
      />
      <div className="navbar-links">
        <button className="navbar-link" style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}} onClick={onManifestoClick}>Our Manifesto</button>
        <a
          className="navbar-link"
          href="https://www.linkedin.com/company/dgcg/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Socials
        </a>
      </div>
    </nav>
  );
};

export default NavBar; 