import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

/* ── Animated floating particle background (retained, recolored) ── */
function ParticleField({ dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 70;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      o: Math.random() * 0.6 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(147, 197, 253, ${d.o})`  // sky-300 glow
          : `rgba(124, 58, 237, ${d.o * 0.8})`;
        ctx.fill();
      });

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = dark
              ? `rgba(168, 85, 247, ${0.18 * (1 - dist / 110)})`
              : `rgba(67, 56, 202, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

/* ── Typewriter effect ── */
function Typewriter({ words }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[idx];
    const speed = deleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (!deleting && displayed === word) {
        setTimeout(() => setDeleting(true), 1800);
        return;
      }
      if (deleting && displayed === '') {
        setDeleting(false);
        setIdx((i) => (i + 1) % words.length);
        return;
      }
      setDisplayed(deleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx, words]);
  return (
    <span style={{ color: 'var(--accent)', borderRight: '2px solid var(--accent)', paddingRight: 2 }}>
      {displayed}
    </span>
  );
}

/* ── Animated counter ── */
function Counter({ target, duration = 1500, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        setVal(Math.floor(ease * target));
        if (p < 1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div
      className="feature-card"
      style={{ animationDelay: delay }}
    >
      <div className="feature-card-icon">
        {icon}
      </div>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{desc}</p>
    </div>
  );
}

/* ── Mock URL demo card ── */
function DemoCard({ dark }) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const demo = () => {
    if (!url.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const code = Math.random().toString(36).slice(2, 9);
      setResult(`snip.ly/${code}`);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="demo-card">
      <div className="demo-card-shine" />
      <div className="demo-card-header">
        <div className="demo-card-dot demo-card-dot-red" />
        <div className="demo-card-dot demo-card-dot-yellow" />
        <div className="demo-card-dot demo-card-dot-green" />
        <span className="demo-card-header-title">
          snip.ly — url shortener
        </span>
      </div>

      <label className="demo-card-label">
        Paste your long URL
      </label>
      <div className="demo-card-form">
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setResult(null); }}
          placeholder="https://your-very-long-url.com/..."
          onKeyDown={(e) => e.key === 'Enter' && demo()}
          className="demo-card-input"
        />
        <button
          onClick={demo}
          disabled={loading}
          className="demo-card-btn"
        >
          {loading ? '⚡ …' : '⚡ Shorten'}
        </button>
      </div>

      {result && (
        <div className="demo-card-result">
          <span className="demo-card-result-link">
            🔗 {result}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            className="demo-card-copy-btn"
          >
            Copy
          </button>
        </div>
      )}

      {/* Mock analytics preview */}
      <div className="demo-card-stats">
        {[
          { label: 'Total Links', val: '2,847' },
          { label: 'Clicks Today', val: '14.2K' },
          { label: 'Uptime', val: '99.9%' },
        ].map((s) => (
          <div key={s.label} className="demo-card-stat-box">
            <div className="demo-card-stat-val">{s.val}</div>
            <div className="demo-card-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
export default function Landing() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('snip-theme') !== 'light'; } catch { return true; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('snip-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  const features = [
    { icon: '⚡', title: 'Instant Shortening', desc: 'Generate short links in milliseconds with a 7-character nanoid code that is guaranteed unique.' },
    { icon: '📊', title: 'Deep Analytics', desc: 'Track every click with timestamps, IP info, and browser data. See daily trends with beautiful charts.' },
    { icon: '🔐', title: 'Secure & Private', desc: 'JWT-authenticated accounts ensure only you can see, manage, and delete your links.' },
    { icon: '🗂️', title: 'Full Dashboard', desc: 'Manage all your links in one place — copy, delete, inspect — with a clean sortable table.' },
    { icon: '🔁', title: 'Smart Redirects', desc: 'Every redirect is logged and counted instantly. Zero-lag redirects to your destination URL.' },
    { icon: '🌐', title: 'Works Anywhere', desc: 'Share links across social, email, or messaging. Every short URL is just one tap away.' },
  ];

  return (
    <div className="landing-wrap">

      {/* ── NAVBAR ── */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-nav-brand">
            <div className="landing-nav-logo-icon">⚡</div>
            <span className="landing-nav-logo-text">
              snip<span>.ly</span>
            </span>
          </div>

          <div className="landing-nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#stats" className="nav-link">Stats</a>
            <a href="#how" className="nav-link">How it works</a>
          </div>

          <div className="landing-nav-actions">
            {/* Dark/light toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="theme-toggle-btn"
              title="Toggle theme"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem' }}>
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem' }}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero-section">
        {/* Background gradient grid + particles */}
        <div className="landing-bg-overlay" />
        <ParticleField dark={dark} />

        {/* Glow orbs refined */}
        <div className="landing-glow-orb-1" />
        <div className="landing-glow-orb-2" />

        <div className="landing-hero-container">
          {/* Left: headline */}
          <div className="landing-hero-left">
            <div className="landing-hero-badge">
              <span className="landing-hero-badge-dot" />
              Free · Open Source · Production Ready
            </div>

            <h1 className="landing-hero-title">
              Shorten links.<br />
              Track <Typewriter words={['every click.', 'all visits.', 'real analytics.', 'your growth.']} />
            </h1>

            <p className="landing-hero-desc">
              A blazing-fast URL shortener with real-time analytics, custom dashboards,
              and JWT-secured accounts. Built for developers and creators.
            </p>

            <div className="landing-hero-actions">
              <Link to="/register" className="btn btn-primary">
                🚀 Start for free
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
            </div>

            <div className="landing-hero-stats">
              {[
                { n: '50K+', l: 'Links created' },
                { n: '2M+', l: 'Clicks tracked' },
                { n: '99.9%', l: 'Uptime' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="landing-hero-stat-num">{s.n}</div>
                  <div className="landing-hero-stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: interactive demo card */}
          <div className="landing-hero-right">
            <DemoCard dark={dark} />
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ── */}
      <div className="ticker-strip">
        <div className="ticker-inner">
          {Array(2).fill(['⚡ Instant short links', '📊 Click analytics', '🔐 Secure accounts', '🔁 Smart redirects', '📱 Mobile friendly', '🌐 Works everywhere', '🗂️ Dashboard view', '💾 Visit history']).flat().map((t, i) => (
            <span key={i} className="ticker-item">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="features-section">
        <div className="features-header">
          <div className="features-badge">
            Everything you need
          </div>
          <h2 className="features-title">
            Packed with powerful features
          </h2>
          <p className="features-desc">
            From instant link creation to deep analytics — everything you need to manage and track your URLs.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={`${i * 0.08}s`} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="how-section">
        <div className="how-container">
          <div className="how-header">
            <h2 className="how-title">
              How it works
            </h2>
            <p className="how-desc">Three steps, zero friction.</p>
          </div>
          <div className="how-grid">
            {[
              { num: '01', icon: '🔑', title: 'Create account', desc: 'Sign up in seconds. Your links and analytics are private and tied to your account.' },
              { num: '02', icon: '🔗', title: 'Paste your URL', desc: 'Drop any long link into the shortener. We generate a compact 7-char code instantly.' },
              { num: '03', icon: '📊', title: 'Share & track', desc: 'Share your short URL. Watch clicks roll in with real-time analytics on your dashboard.' },
            ].map((step) => (
              <div key={step.num} className="how-step">
                <div className="how-step-icon">
                  {step.icon}
                </div>
                <div className="how-step-tag">
                  STEP {step.num}
                </div>
                <h3 className="how-step-title">{step.title}</h3>
                <p className="how-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section id="stats" className="stats-section">
        <div className="stats-header">
          <h2 className="stats-title">
            Trusted by makers worldwide
          </h2>
        </div>
        <div className="stats-grid">
          {[
            { label: 'Links Shortened', target: 50284, suffix: '+' },
            { label: 'Clicks Tracked', target: 2100000, suffix: '+' },
            { label: 'Active Users', target: 3200, suffix: '+' },
            { label: 'Uptime %', target: 99, suffix: '.9%' },
          ].map((s) => (
            <div key={s.label} className="stats-card">
              <div className="stats-card-val">
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <div className="stats-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-overlay" />
        <div className="cta-container">
          <h2 className="cta-title">
            Ready to shorten smarter?
          </h2>
          <p className="cta-desc">
            Join thousands of creators and developers who trust snip.ly for their links.
          </p>
          <div className="cta-actions">
            <Link to="/register" className="cta-btn-primary">
              🚀 Create free account
            </Link>
            <Link to="/login" className="cta-btn-secondary">
              Sign in instead
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">
          ⚡ snip<span>.ly</span>
        </div>
        <p className="landing-footer-copy">
          Built with React, Node.js, MongoDB &amp; ❤️ — {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
