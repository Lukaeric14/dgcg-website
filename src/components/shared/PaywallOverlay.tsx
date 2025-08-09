import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaywallOverlay.css';

const PaywallOverlay: React.FC = () => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/pricing');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="paywall-overlay">
      <div className="paywall-container">
        <div className="paywall-content">
          <h2 className="paywall-title text-cormorant-h2 text-white-full">
            Continue reading your article with a DGCG subscription.
          </h2>
          
          <div className="paywall-actions">
            <button 
              className="paywall-subscribe-button text-palatino-body"
              onClick={handleSubscribe}
            >
              Subscribe for only $5/mo
            </button>
            <p className="paywall-login-text text-palatino-body">
              already a subscriber? <span className="paywall-login-link" onClick={handleLogin}>Login</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallOverlay;