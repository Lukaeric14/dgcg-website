import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoIcon from '../assets/shortlogodgcgwhite.png';
import loginArt from '../assets/LoginArt.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-nav">
        <img src={logoIcon} alt="DGCG Logo" className="nav-logo" />
      </div>
      
      <div className="login-main-container">
        <div className="login-left-side">
          <div className="login-form-container">
            <div className="login-intro">
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Today is a new day. It's your day. You shape it.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}
              
              <div className="login-input-group">
                <label className="login-label">Email</label>
                <div className="login-input-container">
                  <input
                    type="email"
                    placeholder="Example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="login-input"
                  />
                </div>
              </div>
              
              <div className="login-input-group">
                <label className="login-label">Password</label>
                <div className="login-input-container">
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="login-input"
                  />
                </div>
              </div>
              
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
              
              <button type="submit" className="login-submit-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            
            <div className="login-signup-text">
              Don't you have an account? <Link to="/register" className="signup-link">Sign up</Link>
            </div>
            
            <div className="login-copyright">
              © 2025 DGCG ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
        
        <div className="login-right-side">
          <div className="login-art-container">
            <img src={loginArt} alt="Login Art" className="login-art-image" />
          </div>
        </div>
      </div>
    </div>
  );
}