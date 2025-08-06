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

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/admin');

  return (
    <>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
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
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
