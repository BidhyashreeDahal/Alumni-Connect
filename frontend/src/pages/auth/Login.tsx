import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<'admin' | 'faculty' | 'student' | 'alumni'>('faculty');

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      console.log('Login success:', data);
      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data?.message || `Error: ${err.response.status}`);
      } else if (err.request) {
        setError('Cannot connect to server. Is the backend running on port 5000?');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div className="login-shell">
        {/* Left: branding & purpose */}
        <div className="login-left">
          <div className="login-left-image" />
          <div className="login-left-inner">
            <div className="login-left-top">
              <img
                src="/Images/AC_logo.png"
                alt="Alumni Connect logo"
                className="login-left-logo"
              />
              <h1 className="login-left-title">Welcome to Alumni Connect</h1>
              <p className="login-left-subtitle">
                Your academic relationship management platform.
              </p>
            </div>

            <div className="login-left-body">
              <p className="login-left-description">
                A secure institutional system for managing long‑term academic
                relationships between students, alumni, faculty, and administrators.
              </p>
              <ul className="login-left-highlights">
                <li>Track alumni outcomes</li>
                <li>Preserve institutional memory</li>
                <li>Support long‑term engagement</li>
              </ul>
            </div>

            <div className="login-left-footer">
              <p>Secure access for authorized institutional users only.</p>
            </div>
          </div>
        </div>

        {/* Right: login form card */}
        <div className="login-right">
          <div className="login-container">
            <div className="login-card">
              <div className="login-header">
                <h2>Sign in</h2>
                <p>Access your secure Alumni Connect workspace.</p>
              </div>

              <div className="role-toggle">
                <span className="role-label">Role</span>
                <div className="role-pill-row">
                  {['admin', 'faculty', 'student', 'alumni'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`role-pill ${role === r ? 'role-pill--active' : ''}`}
                      onClick={() => setRole(r as typeof role)}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {error?.trim() && (
                <div
                  className={`error-message ${error.trim() ? 'show' : ''}`}
                  style={{ marginBottom: '10px' }}
                >
                  {error}
                </div>
              )}

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                    />
                    <label htmlFor="email">Email</label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                    />
                    <label htmlFor="password">Password</label>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      <span
                        className={`toggle-icon ${
                          showPassword ? 'show-password' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-wrapper">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-label">
                      <span className="checkmark" />
                      Remember me on this device
                    </span>
                  </label>

                  <a href="#" className="forgot-password">
                    Forgot password?
                  </a>
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  <span className="btn-text">
                    {loading ? 'Signing in…' : 'Sign In'}
                  </span>
                  {loading && <span className="btn-loader"></span>}
                </button>

                <p className="login-help">
                  Need help accessing your account?{' '}
                  <span className="login-help-link">Contact administrator</span>
                </p>
                <p className="login-security">
                  Protected access for authorized users only.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;