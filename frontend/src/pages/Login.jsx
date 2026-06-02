// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import Toast from '../components/Toast';

// export default function Login() {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/auth/login', form);
//       login(data.user, data.token);
//       navigate('/dashboard');
//     } catch (err) {
//       setToast({ message: err.response?.data?.message || 'Login failed', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
//       {toast && <Toast {...toast} onClose={() => setToast(null)} />}
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-white mb-1">⚡ <span className="text-violet-400">snip</span>.ly</h1>
//           <p className="text-zinc-400 text-sm">Sign in to manage your links</p>
//         </div>
//         <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
//           <div>
//             <label className="block text-zinc-400 text-xs mb-1.5 uppercase tracking-wider">Email</label>
//             <input
//               type="email" required value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
//               placeholder="you@example.com"
//             />
//           </div>
//           <div>
//             <label className="block text-zinc-400 text-xs mb-1.5 uppercase tracking-wider">Password</label>
//             <input
//               type="password" required value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
//               placeholder="••••••••"
//             />
//           </div>
//           <button
//             type="submit" disabled={loading}
//             className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors mt-2"
//           >
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//           <p className="text-center text-zinc-500 text-sm">
//             No account?{' '}
//             <Link to="/register" className="text-violet-400 hover:text-violet-300">Register</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

/* ── Floating orb background (pure CSS animation via inline keyframes injected once) ── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

@keyframes orb-drift {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(40px, -30px) scale(1.08); }
  66%  { transform: translate(-20px, 20px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes orb-drift-2 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(-50px, 40px) scale(1.12); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-up-delayed {
  0%, 15% { opacity: 0; transform: translateY(20px); }
  100%    { opacity: 1; transform: translateY(0); }
}
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.15), 0 0 60px rgba(139,92,246,0.05); }
  50%       { box-shadow: 0 0 30px rgba(139,92,246,0.25), 0 0 80px rgba(139,92,246,0.1); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes scan-line {
  0%   { top: -2px; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.snip-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(139,92,246,0.2);
  border-radius: 12px;
  padding: 12px 16px;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
}
.snip-input::placeholder { color: rgba(255,255,255,0.2); }
.snip-input:hover { border-color: rgba(139,92,246,0.4); background: rgba(255,255,255,0.06); }
.snip-input:focus {
  border-color: rgba(139,92,246,0.8);
  background: rgba(139,92,246,0.06);
  box-shadow: 0 0 0 3px rgba(139,92,246,0.12), inset 0 1px 2px rgba(0,0,0,0.2);
}

.snip-btn-primary {
  width: 100%;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
  border: none;
  border-radius: 12px;
  padding: 13px 24px;
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, opacity 0.2s;
}
.snip-btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}
.snip-btn-primary:hover { transform: translateY(-1px); }
.snip-btn-primary:hover::before { opacity: 1; }
.snip-btn-primary:active { transform: translateY(1px); opacity: 0.9; }
.snip-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.snip-btn-ghost {
  background: transparent;
  border: 1px solid rgba(139,92,246,0.3);
  border-radius: 10px;
  padding: 9px 20px;
  color: rgba(167,139,250,0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.snip-btn-ghost:hover { border-color: rgba(139,92,246,0.6); background: rgba(139,92,246,0.08); color: #c4b5fd; }

.card-glow { animation: glow-pulse 4s ease-in-out infinite; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  animation: fade-up 0.2s ease;
}

.grid-bg {
  background-image:
    linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('snip-auth-styles')) return;
    const el = document.createElement('style');
    el.id = 'snip-auth-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);
  return null;
}

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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'linear-gradient(145deg, #18181b 0%, #111113 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: '20px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        margin: '0 16px',
        position: 'relative',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.1)',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
          width: '32px', height: '32px', color: '#a1a1aa', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>×</button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(109,40,217,0.1))',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', marginBottom: '16px',
          }}>🔑</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>
            Reset your password
          </h2>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#71717a', fontSize: '13px', margin: 0 }}>
            Enter your email and we'll send a reset link.
          </p>
        </div>

        {sent ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px', padding: '16px',
            color: '#86efac', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', textAlign: 'center',
          }}>
            ✅ &nbsp;If that email exists, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', color: '#71717a', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Email address
              </label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="snip-input"
                placeholder="you@example.com"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="snip-btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={loading} className="snip-btn-primary" style={{ flex: 2 }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
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

  return (
    <>
      <StyleInjector />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="grid-bg" style={{
        minHeight: '100vh',
        background: '#09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif',
      }}>

        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)',
          animation: 'orb-drift 18s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          animation: 'orb-drift-2 22s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,33,182,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Decorative ring */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '700px', borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.06)',
          animation: 'spin-slow 60s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Card */}
        <div className="card-glow" style={{
          width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px',
            animation: mounted ? 'fade-up 0.5s ease both' : 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginBottom: '10px',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', boxShadow: '0 0 20px rgba(124,58,237,0.4)',
              }}>⚡</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                snip<span style={{ color: '#a78bfa' }}>.ly</span>
              </span>
            </div>
            <p style={{ color: '#52525b', fontSize: '13px', margin: 0, letterSpacing: '0.02em' }}>
              Sign in to manage your links
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(24,24,27,0.95) 0%, rgba(16,16,18,0.98) 100%)',
            border: '1px solid rgba(139,92,246,0.18)',
            borderRadius: '24px',
            padding: '36px',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle scan line effect */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)',
              animation: 'scan-line 8s ease-in-out infinite',
              pointerEvents: 'none',
            }} />

            {/* Corner accent */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '120px', height: '120px',
              background: 'radial-gradient(circle at top right, rgba(139,92,246,0.08) 0%, transparent 70%)',
              borderRadius: '0 24px 0 0',
            }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ animation: mounted ? 'fade-up-delayed 0.6s 0.1s ease both' : 'none' }}>
                <label style={{
                  display: 'block', color: '#71717a', fontSize: '11px',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px',
                }}>Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="snip-input"
                  placeholder="you@example.com"
                />
              </div>

              <div style={{ animation: mounted ? 'fade-up-delayed 0.6s 0.2s ease both' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    color: '#71717a', fontSize: '11px',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#7c3aed', fontSize: '12px', padding: 0,
                      fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.01em',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#a78bfa'}
                    onMouseLeave={(e) => e.target.style.color = '#7c3aed'}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="snip-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#52525b', fontSize: '16px', display: 'flex', alignItems: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#a78bfa'}
                    onMouseLeave={(e) => e.target.style.color = '#52525b'}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div style={{ animation: mounted ? 'fade-up-delayed 0.6s 0.3s ease both' : 'none' }}>
                <button type="submit" disabled={loading} className="snip-btn-primary">
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{
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

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              margin: '24px 0 20px',
              animation: mounted ? 'fade-up-delayed 0.6s 0.35s ease both' : 'none',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: '#3f3f46', fontSize: '11px', letterSpacing: '0.08em' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <p style={{
              textAlign: 'center', color: '#52525b', fontSize: '13px', margin: 0,
              animation: mounted ? 'fade-up-delayed 0.6s 0.4s ease both' : 'none',
            }}>
              No account?{' '}
              <Link to="/register" style={{
                color: '#a78bfa', textDecoration: 'none', fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#c4b5fd'}
              onMouseLeave={(e) => e.target.style.color = '#a78bfa'}
              >
                Create one →
              </Link>
            </p>
          </div>

          {/* Bottom hint */}
          <p style={{
            textAlign: 'center', color: '#27272a', fontSize: '11px', marginTop: '20px',
            letterSpacing: '0.05em',
            animation: mounted ? 'fade-up-delayed 0.6s 0.5s ease both' : 'none',
          }}>
            Protected by snip.ly security
          </p>
        </div>
      </div>
    </>
  );
}

