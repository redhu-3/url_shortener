import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiSunLine, RiMoonLine, RiMenuLine, RiCloseLine } from 'react-icons/ri';
import './Navbar.css';

/* ── Theme hook ── */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('snip-theme') || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('snip-theme', theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}

/* ── Nav links config ── */
const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/public-links', label: 'Public Links' },
];

/* ══ NAVBAR ══ */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (path) => window.location.pathname === path;

  return (
    <>

      {/* ambient blobs (re-declared here so they always render) */}
      <div className="ambient ambient-1" aria-hidden />
      <div className="ambient ambient-2" aria-hidden />

      <nav className="snip-nav">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="nav-logo-dot" />
          snip.ly
        </Link>

        {/* Center links */}
        <div className="nav-center">
          {NAV_LINKS.filter(l => l.to !== '/dashboard' || user).map(l => (
            <Link key={l.to} to={l.to} className={`nav-link${isActive(l.to) ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="nav-right">
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <RiSunLine /> : <RiMoonLine />}
          </button>

          {user && (
            <>
              <div className="nav-user">Hey, <span>{user.name}</span></div>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          )}

          {!user && (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" style={{
                fontFamily: 'var(--font-d)', fontSize: '0.78rem', fontWeight: 700,
                padding: '0.4rem 1rem', borderRadius: '10px', textDecoration: 'none',
                background: 'linear-gradient(135deg, var(--violet), var(--violet-d))',
                color: '#fff', letterSpacing: '0.02em',
                boxShadow: '0 0 18px rgba(139,92,246,0.3)',
                transition: 'all 0.2s',
              }}>Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="menu-toggle"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <RiCloseLine /> : <RiMenuLine />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          {NAV_LINKS.filter(l => l.to !== '/dashboard' || user).map(l => (
            <Link key={l.to} to={l.to} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {l.label}
              <span style={{ color: 'var(--text3)', fontSize: '0.65rem' }}>→</span>
            </Link>
          ))}
          {user && (
            <>
              <hr className="mobile-divider" />
              <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.68rem', color: 'var(--text3)', padding: '0 0.25rem' }}>
                Signed in as <span style={{ color: 'var(--violet-l)' }}>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{ fontFamily: 'var(--font-m)', fontSize: '0.72rem', cursor: 'pointer', textAlign: 'left', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: 'var(--rose)', padding: '0.65rem 1rem', borderRadius: '10px', transition: 'all 0.2s' }}
              >
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-nav-link" onClick={() => setMobileOpen(false)}
                style={{ color: 'var(--violet-l)', borderColor: 'var(--border-v)' }}>
                Get Started →
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}