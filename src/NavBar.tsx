import React from 'react';
import './NavBar.css';

interface NavBarProps {
  onManifestoClick?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onManifestoClick }) => {
  return (
    <nav className="navbar">
      <img
        className="navbar-logo"
        src={process.env.PUBLIC_URL + '/iconlong.png'}
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