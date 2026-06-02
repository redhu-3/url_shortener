// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import Toast from '../components/Toast';

// export default function Register() {
//   const [form, setForm] = useState({ name: '', email: '', password: '' });
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password.length < 6) {
//       setToast({ message: 'Password must be at least 6 characters', type: 'error' });
//       return;
//     }
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/auth/register', form);
//       login(data.user, data.token);
//       navigate('/dashboard');
//     } catch (err) {
//       setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' });
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
//           <p className="text-zinc-400 text-sm">Create your free account</p>
//         </div>
//         <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
//           {['name', 'email', 'password'].map((field) => (
//             <div key={field}>
//               <label className="block text-zinc-400 text-xs mb-1.5 uppercase tracking-wider">{field}</label>
//               <input
//                 type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
//                 required value={form[field]}
//                 onChange={(e) => setForm({ ...form, [field]: e.target.value })}
//                 className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
//                 placeholder={field === 'email' ? 'you@example.com' : field === 'password' ? '••••••••' : 'Your name'}
//               />
//             </div>
//           ))}
//           <button
//             type="submit" disabled={loading}
//             className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors mt-2"
//           >
//             {loading ? 'Creating account...' : 'Create Account'}
//           </button>
//           <p className="text-center text-zinc-500 text-sm">
//             Already have an account?{' '}
//             <Link to="/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Toast from '../components/Toast';

/* ── Password strength checker ── */
function getStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair',   color: '#f97316' };
  if (score <= 3) return { score, label: 'Good',   color: '#eab308' };
  if (score <= 4) return { score, label: 'Strong', color: '#22c55e' };
  return { score, label: 'Very Strong', color: '#a78bfa' };
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const strength = getStrength(form.password);

  const passwordsMatch  = form.confirmPassword === '' ? null : form.password === form.confirmPassword;
  const confirmTouched  = form.confirmPassword.length > 0;

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

  const inputStyle = (valid) => ({
    width: '100%',
    background: valid === true
      ? 'rgba(34,197,94,0.05)'
      : valid === false
      ? 'rgba(239,68,68,0.05)'
      : 'rgba(255,255,255,0.04)',
    border: `1px solid ${
      valid === true
        ? 'rgba(34,197,94,0.4)'
        : valid === false
        ? 'rgba(239,68,68,0.4)'
        : 'rgba(139,92,246,0.2)'
    }`,
    borderRadius: '12px',
    padding: '12px 44px 12px 16px',
    color: '#fff',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box',
  });

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{
        minHeight: '100vh',
        background: '#09090b',
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif',
      }}>

        {/* Orbs */}
        <div style={{
          position: 'absolute', top: '-15%', right: '-8%',
          width: '550px', height: '550px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.16) 0%, transparent 70%)',
          animation: 'orb-drift 20s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-8%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          animation: 'orb-drift-2 25s ease-in-out infinite', pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', boxShadow: '0 0 20px rgba(124,58,237,0.4)',
              }}>⚡</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#fff' }}>
                snip<span style={{ color: '#a78bfa' }}>.ly</span>
              </span>
            </Link>
            <p style={{ color: '#52525b', fontSize: '13px', margin: 0 }}>
              Create your account — it's free
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(24,24,27,0.95) 0%, rgba(16,16,18,0.98) 100%)',
            border: '1px solid rgba(139,92,246,0.18)',
            borderRadius: '24px',
            padding: '36px',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(139,92,246,0.1), 0 0 60px rgba(139,92,246,0.04)',
          }}>
            {/* Scan line */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)',
              animation: 'scan-line 10s ease-in-out infinite',
              pointerEvents: 'none',
            }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Name */}
              <div>
                <label style={{ display: 'block', color: '#71717a', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ ...inputStyle(null), padding: '12px 16px' }}
                  placeholder="Jane Smith"
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.8)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', color: '#71717a', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ ...inputStyle(null), padding: '12px 16px' }}
                  placeholder="you@example.com"
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.8)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', color: '#71717a', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={inputStyle(null)}
                    placeholder="••••••••"
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.8)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', fontSize: '15px',
                  }}>{showPassword ? '🙈' : '👁'}</button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '2px',
                          background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: strength.color, fontWeight: 500 }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', color: '#71717a', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'} required value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    style={inputStyle(confirmTouched ? passwordsMatch : null)}
                    placeholder="••••••••"
                    onFocus={(e) => { if (!confirmTouched || passwordsMatch === null) { e.target.style.borderColor = 'rgba(139,92,246,0.8)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}}
                    onBlur={(e) => { if (!confirmTouched || passwordsMatch === null) { e.target.style.borderColor = 'rgba(139,92,246,0.2)'; e.target.style.boxShadow = 'none'; }}}
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {confirmTouched && (
                      <span style={{ fontSize: '14px' }}>
                        {passwordsMatch ? '✅' : '❌'}
                      </span>
                    )}
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', fontSize: '15px',
                    }}>{showConfirm ? '🙈' : '👁'}</button>
                  </div>
                </div>
                {confirmTouched && !passwordsMatch && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', margin: '6px 0 0' }}>
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
                style={{
                  width: '100%',
                  background: loading || (confirmTouched && !passwordsMatch)
                    ? 'rgba(124,58,237,0.3)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px 24px',
                  color: '#fff',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading || (confirmTouched && !passwordsMatch) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0.5px',
                  marginTop: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{
                      width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff', borderRadius: '50%',
                      animation: 'spin-slow 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Creating account…
                  </span>
                ) : '→ Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: '#3f3f46', fontSize: '11px', letterSpacing: '0.08em' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <p style={{ textAlign: 'center', color: '#52525b', fontSize: '13px', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={(e) => e.target.style.color = '#c4b5fd'}
                onMouseLeave={(e) => e.target.style.color = '#a78bfa'}
              >
                Sign in →
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', color: '#27272a', fontSize: '11px', marginTop: '20px', letterSpacing: '0.05em' }}>
            By registering, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}
