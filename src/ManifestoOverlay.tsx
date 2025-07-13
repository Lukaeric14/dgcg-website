import React, { useEffect, useState, useRef } from 'react';
import './ManifestoOverlay.css';

interface ManifestoOverlayProps {
  open: boolean;
  onClose?: () => void;
}

const title = 'Manifesto:';
const manifesto = `Our mission is to back those who dare to build something better. We support driven founders who see gaps in the system, who refuse to settle for the way things are, and who are ready to take on entrenched giants with sharper ideas, stronger purpose, and relentless execution.

Because the future doesn’t belong to the biggest—it belongs to the bravest.`;

const TYPE_SPEED = 45; // ms per character (slower)

const ManifestoOverlay: React.FC<ManifestoOverlayProps> = ({ open, onClose }) => {
  const [animIndex, setAnimIndex] = useState(0);
  const [showText, setShowText] = useState(false);
  const timeouts = useRef<number[]>([]);
  const fullText = title + '\n' + manifesto;
  const indexRef = useRef(0);

  useEffect(() => {
    if (open) {
      setAnimIndex(0);
      setShowText(false);
      indexRef.current = 0;
      const animate = () => {
        if (indexRef.current < fullText.length) {
          setAnimIndex(indexRef.current + 1);
          indexRef.current++;
          timeouts.current.push(window.setTimeout(animate, TYPE_SPEED));
        } else {
          setShowText(true);
        }
      };
      animate();
    }
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;

  // Split title and manifesto for styling
  const current = fullText.slice(0, animIndex);
  const [currentTitle, ...currentTextArr] = current.split('\n');
  const currentText = currentTextArr.join('\n');

  return (
    <div className="manifesto-overlay" onClick={onClose}>
      <div className="manifesto-content" onClick={e => e.stopPropagation()}>
        <div className="manifesto-title">
          {currentTitle}
          {!showText && <span className="typewriter-cursor">|</span>}
        </div>
        <div className="manifesto-text">
          {currentText}
        </div>
      </div>
    </div>
  );
};

export default ManifestoOverlay; 