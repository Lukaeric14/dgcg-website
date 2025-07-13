import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import NavBar from './NavBar';
import Hero from './Hero';
import Footer from './Footer';
import ManifestoOverlay from './ManifestoOverlay';

function App() {
  const [manifestoOpen, setManifestoOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Promise that resolves when the video can play through
    const canPlayPromise = new Promise<void>((resolve) => {
      video.oncanplaythrough = () => resolve();
    });

    // Promise that resolves after a timeout (e.g., 5 seconds) as a fallback
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 5000);
    });

    // Wait for either the video to be ready or the timeout, whichever comes first
    const videoPromise = Promise.race([canPlayPromise, timeoutPromise]);

    const fontPromise = document.fonts.ready;

    Promise.all([videoPromise, fontPromise]).then(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <div className={`App ${isLoading ? 'loading' : 'loaded'}`}>
      <NavBar onManifestoClick={() => setManifestoOpen(true)} />
      <Hero />
            {videoError ? (
        <img src={process.env.PUBLIC_URL + '/fallbackimage.png'} className="App-bg-video" alt="background" />
      ) : (
        <video
          ref={videoRef}
          className="App-bg-video"
          onError={() => setVideoError(true)}
        src={process.env.PUBLIC_URL + '/Move-In-Precise-Speed.mp4'}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="Background video of precise movement"
        />
      )}
      <ManifestoOverlay open={manifestoOpen} onClose={() => setManifestoOpen(false)} />
      <Footer />
    </div>
  );
}

export default App;
