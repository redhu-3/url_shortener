import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import './Auth.css';

/* ── Password strength checker ── */
function getStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: 'var(--error)' };
  if (score <= 2) return { score, label: 'Fair',   color: 'var(--warning)' };
  if (score <= 3) return { score, label: 'Good',   color: 'var(--info)' };
  if (score <= 4) return { score, label: 'Strong', color: 'var(--success)' };
  return { score, label: 'Very Strong', color: 'var(--accent)' };
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const strength = getStrength(form.password);
  const passwordsMatch = form.confirmPassword === '' ? null : form.password === form.confirmPassword;
  const confirmTouched = form.confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    if (strength.score < 2) {
      setToast({ message: 'Please choose a stronger password', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setToast({ message: 'Account created! Please sign in.', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' });
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
      setToast({ message: err.response?.data?.message || 'Google registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setToast({ message: 'Google authentication failed', type: 'error' });
  };

  const getInputClass = (valid) => {
    if (valid === true) return "auth-input auth-input-valid";
    if (valid === false) return "auth-input auth-input-invalid";
    return "auth-input";
  };

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="auth-wrap">
        {/* Orbs */}
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />
        <div className="auth-glow-3" />

        {/* Decorative ring */}
        <div className="auth-glow-ring" />

        <div className="auth-card-glow" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(32px)',
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
              Create your account — it's free
            </p>
          </div>

          {/* Card */}
          <div className="auth-card">
            {/* Scan line */}
            <div className="auth-scan-line" />

            <form onSubmit={handleSubmit} className="auth-form">

              {/* Name */}
              <div>
                <label className="auth-label">Full Name</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={getInputClass(null)}
                  placeholder="Jane Smith"
                />
              </div>

              {/* Email */}
              <div>
                <label className="auth-label">Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={getInputClass(null)}
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="auth-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="auth-input auth-input-has-btn"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="auth-pw-btn">
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div className="auth-strength">
                    <div className="auth-strength-bars">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="auth-strength-bar" style={{
                          background: i <= strength.score ? strength.color : undefined
                        }} />
                      ))}
                    </div>
                    <span className="auth-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="auth-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'} required value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={getInputClass(confirmTouched ? passwordsMatch : null) + " auth-input-has-btn"}
                    placeholder="••••••••"
                  />
                  <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                    {confirmTouched && (
                      <span style={{ fontSize: '14px', marginRight: '4px' }}>
                        {passwordsMatch ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} className="auth-pw-btn">
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {confirmTouched && !passwordsMatch && (
                  <p style={{ color: 'var(--violet-d)', fontSize: '11px', marginTop: '6px', margin: '6px 0 0' }}>
                    Passwords don't match
                  </p>
                )}
                {confirmTouched && passwordsMatch && (
                  <p style={{ color: '#22c55e', fontSize: '11px', marginTop: '6px', margin: '6px 0 0' }}>
                    Passwords match ✓
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (confirmTouched && !passwordsMatch)}
                className="auth-btn-primary"
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="skeleton" style={{
                      width: '14px', height: '14px', border: '2px solid var(--border)',
                      borderTop: '2px solid var(--text-primary)', borderRadius: '50%',
                      animation: 'spin-slow 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Creating account…
                  </span>
                ) : '→ Create Account'}
              </button>
            </form>

            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="rectangular"
                width="280px"
              />
            </div>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">OR</span>
              <div className="auth-divider-line" />
            </div>

            <p className="auth-switch-prompt">
              Already have an account?{' '}
              <Link to="/login" className="auth-switch-link">
                Sign in →
              </Link>
            </p>
          </div>

          <p className="auth-terms-hint">
            By registering, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}
