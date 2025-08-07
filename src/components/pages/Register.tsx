import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoIcon from '../../assets/shortlogodgcgwhite.png';
import loginArt from '../../assets/LoginArt.png';
import './Register.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setError(null);
    setLoading(true);
    
    try {
      await signUp(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="register-nav">
          <img src={logoIcon} alt="DGCG Logo" className="nav-logo" />
        </div>
        
        <div className="register-main-container">
          <div className="register-success-message">
            <h1 className="success-title">Account Created!</h1>
            <p className="success-subtitle">Please check your email to verify your account. You'll be redirected to login shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-nav">
        <img src={logoIcon} alt="DGCG Logo" className="nav-logo" />
      </div>
      
      <div className="register-main-container">
        <div className="register-left-side">
          <div className="register-art-container">
            <img src={loginArt} alt="Register Art" className="register-art-image" />
          </div>
        </div>
        
        <div className="register-right-side">
          <div className="register-form-container">
            <div className="register-intro">
              <h1 className="register-title">Create Account</h1>
              <p className="register-subtitle">Join us today. It's your journey. You shape it.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="register-form">
              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}
              
              <div className="register-input-group">
                <label className="register-label">Email</label>
                <div className="register-input-container">
                  <input
                    type="email"
                    placeholder="Example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="register-input"
                  />
                </div>
              </div>
              
              <div className="register-input-group">
                <label className="register-label">Password</label>
                <div className="register-input-container">
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="register-input"
                  />
                </div>
              </div>
              
              <div className="register-input-group">
                <label className="register-label">Confirm Password</label>
                <div className="register-input-container">
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="register-input"
                  />
                </div>
              </div>
              
              <button type="submit" className="register-submit-button" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            
            <div className="register-signin-text">
              Already have an account? <Link to="/login" className="signin-link">Sign in</Link>
            </div>
            
            <div className="register-copyright">
              © 2023 ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
