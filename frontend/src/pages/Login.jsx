import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import './Auth.css';

/* ── Forgot Password Modal ── */
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setSent(true); // Don't reveal if email exists
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        {/* Close */}
        <button onClick={onClose} className="auth-modal-close">×</button>

        <div className="auth-modal-header">
          <div className="auth-modal-icon">🔑</div>
          <h2 className="auth-modal-title">Reset your password</h2>
          <p className="auth-modal-desc">
            Enter your email and we'll send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="auth-modal-success">
            ✅ &nbsp;If that email exists, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-modal-form">
            <div>
              <label className="auth-label">Email address</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
              />
            </div>
            <div className="auth-modal-actions">
              <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                {loading ? 'Sending…' : 'Send Reset'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Main Login Component ── */
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/google', { token: credentialResponse.credential });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Google login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setToast({ message: 'Google authentication failed', type: 'error' });
  };

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="auth-wrap">
        {/* Ambient orbs */}
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />
        <div className="auth-glow-3" />

        {/* Decorative ring */}
        <div className="auth-glow-ring" />

        {/* Card */}
        <div className="auth-card-glow" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(32px)',
        }}>

          {/* Logo */}
          <div className="auth-logo-header" style={{
            animation: mounted ? 'fade-up 0.5s ease both' : 'none'
          }}>
            <Link to="/" className="auth-logo-brand">
              <div className="auth-logo-icon">⚡</div>
              <span className="auth-logo-text">
                snip<span>.ly</span>
              </span>
            </Link>
            <p className="auth-logo-sub">
              Sign in to manage your links
            </p>
          </div>

          {/* Form card */}
          <div className="auth-card">
            {/* Subtle scan line effect */}
            <div className="auth-scan-line" />

            {/* Corner accent */}
            <div className="auth-corner-glow" />

            <form onSubmit={handleSubmit} className="auth-form">
              <div style={{ animation: mounted ? 'fade-up-delayed 0.6s 0.1s ease both' : 'none' }}>
                <label className="auth-label">Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>

              <div style={{ animation: mounted ? 'fade-up-delayed 0.6s 0.2s ease both' : 'none' }}>
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="auth-forgot-link"
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="auth-input auth-input-has-btn"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-pw-btn"
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div style={{ animation: mounted ? 'fade-up-delayed 0.6s 0.3s ease both' : 'none' }}>
                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="skeleton" style={{
                        width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff', borderRadius: '50%',
                        animation: 'spin-slow 0.7s linear infinite', display: 'inline-block',
                      }} />
                      Signing in…
                    </span>
                  ) : '→ Sign In'}
                </button>
              </div>
            </form>

            <div className="google-login-wrapper" style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '1.2rem 0 0.5rem 0',
              animation: mounted ? 'fade-up-delayed 0.6s 0.32s ease both' : 'none'
            }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="rectangular"
                width="280px"
              />
            </div>

            {/* Divider */}
            <div className="auth-divider" style={{
              animation: mounted ? 'fade-up-delayed 0.6s 0.35s ease both' : 'none',
            }}>
              <div className="auth-divider-line" />
              <span className="auth-divider-text">OR</span>
              <div className="auth-divider-line" />
            </div>

            <p className="auth-switch-prompt" style={{
              animation: mounted ? 'fade-up-delayed 0.6s 0.4s ease both' : 'none',
            }}>
              No account?{' '}
              <Link to="/register" className="auth-switch-link">
                Create one →
              </Link>
            </p>
          </div>

          {/* Bottom hint */}
          <p className="auth-terms-hint" style={{
            animation: mounted ? 'fade-up-delayed 0.6s 0.5s ease both' : 'none',
          }}>
            Protected by snip.ly security
          </p>
        </div>
      </div>
    </>
  );
}
