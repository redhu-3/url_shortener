import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Toast from '../components/Toast';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
      setToast({ message: 'Reset link sent successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to send reset link', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

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
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>

          {/* Logo */}
          <div className="auth-logo-header">
            <Link to="/" className="auth-logo-brand">
              <div className="auth-logo-icon">⚡</div>
              <span className="auth-logo-text">
                snip<span>.ly</span>
              </span>
            </Link>
            <p className="auth-logo-sub">
              Recover your snip.ly account
            </p>
          </div>

          {/* Form card */}
          <div className="auth-card">
            {/* Subtle scan line effect */}
            <div className="auth-scan-line" />

            {/* Corner accent */}
            <div className="auth-corner-glow" />

            {sent ? (
              <div className="text-center py-6">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✉️</div>
                <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Check your email</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  If that email exists, we have sent a secure link to reset your password.
                </p>
                <Link to="/login" className="auth-switch-link">
                  ← Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div>
                  <label className="auth-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <button type="submit" disabled={loading} className="auth-btn-primary">
                    {loading ? 'Sending link…' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}

            {!sent && (
              <>
                {/* Divider */}
                <div className="auth-divider">
                  <div className="auth-divider-line" />
                  <span className="auth-divider-text">OR</span>
                  <div className="auth-divider-line" />
                </div>

                <p className="auth-switch-prompt">
                  Remember password?{' '}
                  <Link to="/login" className="auth-switch-link">
                    Sign in →
                  </Link>
                </p>
              </>
            )}
          </div>

          {/* Bottom hint */}
          <p className="auth-terms-hint">
            Protected by snip.ly security
          </p>
        </div>
      </div>
    </>
  );
}
