import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Consulting from './components/Consulting';
import Home from './components/Home';
import PricingPage from './components/PricingPage';
import Login from './components/Login';
import Register from './components/Register';
import ArticlePage from './components/ArticlePage';
import AdminDashboard from './components/AdminDashboard';
import Unsubscribe from './components/Unsubscribe';
import NavBar from './NavBar';
import TestComponent from './components/TestComponent';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>Please check the console for more details.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/admin');

  console.log('AppContent rendering, location:', location.pathname);

  return (
    <>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestComponent />} />
        <Route path="/home" element={<Home />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/blog/pricing" element={<PricingPage />} />
        <Route path="/consulting" element={<Consulting />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/articles" element={<AdminDashboard />} />
        <Route path="/admin/newsletter" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminDashboard />} />
        <Route path="/admin/subscribers" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
      </Routes>
    </>
  );
}

function App() {
  console.log('App component rendering');
  
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
