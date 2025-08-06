import React from 'react';

const TestComponent = () => {
  console.log('TestComponent rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      color: 'black',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>DGCG Website Test</h1>
      <p>If you can see this, the React app is working!</p>
      <p>Environment variables status:</p>
      <ul>
        <li>REACT_APP_SUPABASE_URL: {process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'MISSING'}</li>
        <li>REACT_APP_SUPABASE_ANON_KEY: {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}</li>
        <li>NODE_ENV: {process.env.NODE_ENV}</li>
      </ul>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
};

export default TestComponent; 