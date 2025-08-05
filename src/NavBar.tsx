import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import logoImage from './assets/shortlogodgcgwhite.png';
import './NavBar.css';

interface NavBarProps {
  onManifestoClick?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onManifestoClick }) => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = (email: string) => {
    return email.split('@')[0].replace(/[._]/g, ' ');
  };

  return (
    <nav className="navbar">
      <a href="/">
        <img
          className="navbar-logo"
          src={logoImage}
          alt="Logo"
          style={{ height: '40px', width: 'auto' }}
        />
      </a>
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
        {user ? (
          <div className="navbar-user-menu">
            <button 
              className="navbar-user-button" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {getUserDisplayName(user.email || 'User')}
            </button>
            {showDropdown && (
              <div className="navbar-dropdown">
                <a href="/admin" className="navbar-dropdown-item">Admin Panel</a>
                <button onClick={handleSignOut} className="navbar-dropdown-item navbar-signout">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <a className="navbar-link" href="/login" style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginRight: '3rem'}}>Login</a>
        )}
      </div>
    </nav>
  );
};

export default NavBar;