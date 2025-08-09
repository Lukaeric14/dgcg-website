import * as React from 'react';
import giftIcon from '../../assets/icons8-gift-48.png';
import './FreeBadge.css';

const FreeBadge: React.FC = () => {
  return (
    <div className="free-badge">
      <div className="free-badge-icon">
        <img src={giftIcon} alt="Free" className="free-badge-image" />
      </div>
      <div className="free-badge-text text-cormorant-body">
        Free
      </div>
    </div>
  );
};

export default FreeBadge;