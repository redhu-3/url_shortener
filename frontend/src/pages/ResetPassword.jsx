import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Toast from '../components/Toast';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password: form.password });
      setSuccess(true);
      setToast({ message: 'Password updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Invalid or expired token', type: 'error' });
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
              Create a new secure password
            </p>
          </div>

          {/* Form card */}
          <div className="auth-card">
            {/* Subtle scan line effect */}
            <div className="auth-scan-line" />

            {/* Corner accent */}
            <div className="auth-corner-glow" />

            {success ? (
              <div className="text-center py-6">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Password updated!</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Your password has been successfully reset. Redirecting you to login...
                </p>
                <Link to="/login" className="auth-switch-link">
                  Click here if not redirected
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div>
                  <label className="auth-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
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

                <div>
                  <label className="auth-label">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="auth-input"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <button type="submit" disabled={loading} className="auth-btn-primary">
                    {loading ? 'Updating password…' : 'Reset Password'}
                  </button>
                </div>
              </form>
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
