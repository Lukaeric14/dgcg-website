import * as React from 'react';
import jewelIcon from '../../assets/icons8-jewel-48.png';
import './PremiumBadge.css';

const PremiumBadge: React.FC = () => {
  return (
    <div className="premium-badge">
      <div className="premium-badge-icon">
        <img src={jewelIcon} alt="Premium" className="premium-badge-image" />
      </div>
      <div className="premium-badge-text text-cormorant-body">
        Premium
      </div>
    </div>
  );
};

export default PremiumBadge;