import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Consulting from './components/sections/Consulting';
import Home from './components/pages/Home';
import PricingPage from './components/pages/PricingPage';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import ArticlePage from './components/pages/ArticlePage';
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import Unsubscribe from './components/pages/Unsubscribe';
import UnifiedNavBar from './components/shared/UnifiedNavBar';

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
        <div className="error-boundary">
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
  const isAdminRoute = location.pathname.startsWith('/admin');

  console.log('AppContent rendering, location:', location.pathname);

  // Conditionally import admin CSS
  useEffect(() => {
    if (isAdminRoute) {
      import('./admin.css');
    }
  }, [isAdminRoute]);

  const handleManifestoClick = () => {
    // Navigate to consulting page which has the manifesto functionality
    window.location.href = '/consulting';
  };

  return (
    <>
      {!hideNav && <UnifiedNavBar onManifestoClick={handleManifestoClick} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/article" element={<ArticlePage />} />
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
