import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import logoImage from '../../assets/shortlogodgcgwhite.png';
import './UnifiedNavBar.css';

interface UnifiedNavBarProps {
  onManifestoClick?: () => void;
  variant?: 'default' | 'article' | 'consulting';
  className?: string;
}

const UnifiedNavBar: React.FC<UnifiedNavBarProps> = ({ 
  onManifestoClick, 
  variant = 'default',
  className = ''
}) => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = (email: string) => {
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('users_profiles')
          .select('type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.type === 'admin');
        }
      } catch (error) {
        console.error('Error in checkAdminStatus:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const getNavClassName = () => {
    const baseClass = 'unified-navbar';
    const variantClass = `unified-navbar--${variant}`;
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  return (
    <nav className={getNavClassName()}>
      <div className="unified-navbar-content">
        {/* Logo */}
        <a href="/" className="unified-navbar-logo">
          <img
            src={logoImage}
            alt="DGCG Logo"
            className="unified-navbar-logo-img"
          />
        </a>
        
        {/* Navigation Links */}
        <div className="unified-navbar-links">
          <button 
            className="unified-navbar-link" 
            onClick={onManifestoClick}
          >
            Our Manifesto
          </button>
          <a
            className="unified-navbar-link"
            href="https://www.linkedin.com/company/dgcg/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Socials
          </a>
          
          {/* User Menu */}
          {user ? (
            <div className="unified-navbar-user-menu">
              <button 
                className="unified-navbar-user-button" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {getUserDisplayName(user.email || 'User')}
              </button>
              {showDropdown && (
                <div className="unified-navbar-dropdown">
                  {isAdmin && (
                    <a href="/admin" className="unified-navbar-dropdown-item">
                      Admin Panel
                    </a>
                  )}
                  <button 
                    onClick={handleSignOut} 
                    className="unified-navbar-dropdown-item unified-navbar-signout"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a 
              className="unified-navbar-link" 
              href="/login"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UnifiedNavBar; 