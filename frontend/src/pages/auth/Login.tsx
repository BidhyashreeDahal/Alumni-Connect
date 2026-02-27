import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img
                src="/Images/AC_logo.png"
                alt="Alumni Connect Logo"
                style={{ height: '60px', marginBottom: '10px', display: 'block', margin: '0 auto' }}
            />
            <h2>Alumni Connect</h2>
            <p>Student & Alumni Relationship Management System</p>
          </div>

          {error?.trim() && (
              <div className={`error-message ${error.trim() ? 'show' : ''}`} style={{ marginBottom: '10px' }}>
                {error}
              </div>
          )}


          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="input-wrapper">
              <div className="form-group">

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
                    type="password"
                    id="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                />
                <label htmlFor="password">Password</label>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              <span className="btn-text">{loading ? 'Signing In...' : 'Sign In'}</span>
              {loading && <span className="btn-loader"></span>}
            </button>
          </form>
        </div>
      </div>
  );
};

export default Login;