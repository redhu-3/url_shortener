
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
          ? `rgba(232, 160, 173, ${d.o})`  // soft rose
          : `rgba(139, 123, 200, ${d.o * 0.8})`; // lavender
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
              ? `rgba(201, 169, 110, ${0.18 * (1 - dist / 110)})` // gold faint
              : `rgba(91, 184, 154, ${0.12 * (1 - dist / 110)})`; // mint green
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

/* ── Typewriter effect (unchanged) ── */
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

/* ── Animated counter (unchanged) ── */
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

/* ── Feature card (restyled) ── */
function FeatureCard({ icon, title, desc, delay, dark }) {
  const fontD = 'var(--font-d)';
  const borderCol = 'var(--border)';
  const hoverBorderCol = 'var(--accent-soft)';
  const glowCol = 'var(--shadow-glow)';
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg1) 100%)',
        border: `1px solid ${borderCol}`,
        borderRadius: 22,
        padding: '2rem',
        animation: `fadeUp 0.6s ease both`,
        animationDelay: delay,
        transition: 'transform 280ms cubic-bezier(.2,.8,.2,1), box-shadow 280ms, border-color 280ms',
        cursor: 'default',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
        e.currentTarget.style.boxShadow = `0 18px 60px ${glowCol}, var(--shadow-md)`;
        e.currentTarget.style.borderColor = hoverBorderCol;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = borderCol;
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--chipBg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, marginBottom: '1.1rem',
        boxShadow: `inset 0 0 14px ${dark ? 'rgba(201,105,122,0.18)' : 'rgba(139,123,200,0.18)'}`,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem',
        fontFamily: fontD,
        color: 'var(--heading)',
        letterSpacing: '-0.01em',
      }}>{title}</h3>
      <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--mutedStrong)', margin: 0 }}>{desc}</p>
    </div>
  );
}

/* ── Mock URL demo card (restyled) ── */
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

  const borderCol = 'var(--border)';
  const shadowVal = 'var(--shadow-glass)';

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg1) 100%)',
      border: `1px solid ${borderCol}`,
      borderRadius: 26,
      padding: '2rem',
      boxShadow: shadowVal,
      animation: 'float 6s ease-in-out infinite, fadeUp 0.8s 0.3s ease both',
      maxWidth: 520,
      width: '100%',
      overflow: 'hidden',
      backdropFilter: 'blur(14px)',
    }}>
      {/* Shine */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.08) 40%, transparent 60%)',
        transform: 'translateX(-100%)',
        animation: 'shine 4.5s ease-in-out infinite',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.2rem' }}>
        {['#ff5f57','#febc2e','#28c840'].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, boxShadow: `0 0 10px ${c}55` }} />
        ))}
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 6, fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.02em' }}>
          snip.ly — url shortener
        </span>
      </div>

      <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 700 }}>
        Paste your long URL
      </label>
      <div style={{ display: 'flex', gap: 10, marginTop: '0.6rem', marginBottom: '1rem' }}>
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setResult(null); }}
          placeholder="[your-very-long-url.com](https://your-very-long-url.com/)"
          onKeyDown={(e) => e.key === 'Enter' && demo()}
          style={{
            flex: 1,
            background: 'var(--inputBg)',
            border: '1.5px solid var(--inputBorder)',
            borderRadius: 14,
            padding: '0.75rem 1rem',
            color: 'var(--text)',
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
            transition: 'border-color 200ms, box-shadow 200ms, transform 120ms',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 6px var(--focusRing)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--inputBorder)';
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        />
        <button
          onClick={demo}
          style={{
            background: loading ? 'var(--accentSoft)' : 'var(--accentGrad)',
            backgroundSize: '200% 200%',
            border: 'none',
            borderRadius: 14,
            padding: '0.75rem 1.2rem',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'transform 160ms, box-shadow 160ms, filter 160ms',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-glow)',
            animation: 'gradientShift 5s ease infinite',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 40px var(--accent-soft)';
              e.currentTarget.style.filter = 'brightness(1.06)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          {loading ? '⚡ …' : '⚡ Shorten'}
        </button>
      </div>

      {result && (
        <div style={{
          background: 'var(--pillBg)',
          border: '1px solid var(--pillBorder)',
          borderRadius: 14,
          padding: '0.9rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'popIn 0.32s ease',
        }}>
          <span style={{ fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 800, color: 'var(--accent)', fontSize: '1rem', letterSpacing: '0.02em' }}>
            🔗 {result}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            style={{
              background: 'var(--accentGrad)',
              border: 'none', borderRadius: 10,
              padding: '0.45rem 0.9rem', color: '#fff', fontSize: '0.8rem',
              fontWeight: 800, cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)',
              transition: 'transform 140ms, box-shadow 140ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px var(--accent-soft)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
          >
            Copy
          </button>
        </div>
      )}

      {/* Mock analytics preview */}
           {result && (
        <div
          style={{
            background: 'var(--pillBg)',
            border: '1px solid var(--pillBorder)',
            borderRadius: 14,
            padding: '0.9rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'popIn 0.32s ease',
          }}
        >
          ...
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
export default function Landing() {
  const [dark, setDark] = useState(() => {
    try { return (localStorage.getItem('snip-theme') || 'dark') === 'dark'; } catch { return true; }
  });

  useEffect(() => {
    const val = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', val);
    try { localStorage.setItem('snip-theme', val); } catch {}
  }, [dark]);

  const bg = 'var(--bg)';
  const text = 'var(--text)';
  const muted = 'var(--text-muted)';
  const accent = 'var(--accent)';

  const features = [
    { icon: '⚡', title: 'Instant Shortening', desc: 'Generate short links in milliseconds with a 7-character nanoid code that is guaranteed unique.' },
    { icon: '📊', title: 'Deep Analytics', desc: 'Track every click with timestamps, IP info, and browser data. See daily trends with beautiful charts.' },
    { icon: '🔐', title: 'Secure & Private', desc: 'JWT-authenticated accounts ensure only you can see, manage, and delete your links.' },
    { icon: '🗂️', title: 'Full Dashboard', desc: 'Manage all your links in one place — copy, delete, inspect — with a clean sortable table.' },
    { icon: '🔁', title: 'Smart Redirects', desc: 'Every redirect is logged and counted instantly. Zero-lag redirects to your destination URL.' },
    { icon: '🌐', title: 'Works Anywhere', desc: 'Share links across social, email, or messaging. Every short URL is just one tap away.' },
  ];

  const fontD = 'var(--font-d)';
  const fontB = 'var(--font-b)';

  return (
    <div className="landing-wrap" style={{
      '--accent': 'var(--accent)',
      '--accentSoft': 'var(--accent-soft)',
      '--accentGrad': 'var(--accent-grad)',
      '--focusRing': 'var(--focus-ring)',
      '--muted': 'var(--text-muted)',
      '--mutedStrong': 'var(--text-secondary)',
      '--heading': 'var(--heading)',
      '--chipBg': 'var(--chip-bg)',
      '--pillBg': 'var(--pill-bg)',
      '--pillBorder': 'var(--pill-border)',
      '--inputBg': 'var(--input-bg)',
      '--inputBorder': 'var(--input-border)',
      '--statBg': 'var(--stat-bg)',
      '--statBorder': 'var(--stat-border)',
      background: bg,
      color: text,
      fontFamily: fontB,
      minHeight: '100vh',
      overflowX: 'hidden',
      transition: 'background 0.4s, color 0.4s',
    }}>
      <div className="landing-extra-bg" />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: dark ? 'rgba(10,10,10,0.78)' : 'rgba(250,251,255,0.88)',
        backdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: `1px solid ${dark ? 'rgba(201,169,110,0.15)' : 'rgba(139,123,200,0.14)'}`,
        transition: 'background 0.4s',
      }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 1.5rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'var(--accentGrad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
              boxShadow: dark ? '0 0 30px rgba(201,105,122,0.3)' : '0 0 30px rgba(139,123,200,0.25)',
            }}>⚡</div>
            <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.02em', fontFamily: fontD }}>
              snip<span style={{ color: 'var(--accent)' }}>.ly</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" className="nav-link">Features</a>
            
            <a href="#how" className="nav-link">How it works</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Dark/light toggle */}
            <button
              onClick={() => setDark(!dark)}
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: `1px solid ${dark ? 'rgba(201,169,110,0.25)' : 'rgba(139,123,200,0.25)'}`, borderRadius: 12, width: 42, height: 42,
                cursor: 'pointer', fontSize: 18, transition: 'all 160ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.8)',
                color: 'var(--heading)',
              }}
              title="Toggle theme"
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn-ghost" style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem', borderRadius: 12 }}>
              Sign in
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem', borderRadius: 12 }}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Background gradient grid + particles */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: dark
          ? 'radial-gradient(1200px 600px at 20% 10%, rgba(201,105,122,0.13) 0%, rgba(201,105,122,0) 60%), radial-gradient(1000px 500px at 85% 80%, rgba(201,169,110,0.10) 0%, rgba(201,169,110,0) 60%)'
          : 'radial-gradient(1200px 600px at 20% 10%, rgba(139,123,200,0.12) 0%, rgba(139,123,200,0) 60%), radial-gradient(1000px 500px at 85% 80%, rgba(91,184,154,0.10) 0%, rgba(91,184,154,0) 60%)',
        maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)'
      }} />
      <ParticleField dark={dark} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Glow orbs refined */}
        <div style={{
          position: 'absolute', top: '12%', left: '8%',
          width: 520, height: 520, borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(201,105,122,0.14) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,123,200,0.12) 0%, transparent 70%)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '8%', right: '8%',
          width: 420, height: 420, borderRadius: '50%',
          background: dark
            ? 'radial-gradient(circle, rgba(201,169,110,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(91,184,154,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '7rem 1.5rem 4rem', display: 'flex', alignItems: 'center', gap: '4rem', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {/* Left: headline */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--chip-bg)',
              border: `1px solid var(--border-v)`,
              borderRadius: 999, padding: '0.45rem 1rem',
              fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)',
              marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease both',
              letterSpacing: '0.08em',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block', boxShadow: '0 0 10px var(--emerald)' }} />
              Free · Open Source · Production Ready
            </div>

            <h1 style={{
              fontSize: 'clamp(2.8rem, 6.2vw, 4.6rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: '1.2rem',
              animation: 'fadeUp 0.6s 0.1s ease both',
              fontFamily: fontD,
              background: 'linear-gradient(180deg, var(--text-primary), var(--violet-l))',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: 'var(--shadow-glow)',
            }}>
              Shorten links.<br />
              Track <Typewriter words={['every click.', 'all visits.', 'real analytics.', 'your growth.']} />
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.18rem)',
              color: 'var(--mutedStrong)',
              lineHeight: 1.8,
              maxWidth: 540,
              marginBottom: '2rem',
              animation: 'fadeUp 0.6s 0.2s ease both',
            }}>
              A blazing-fast URL shortener with real-time analytics, custom dashboards,
              and JWT-secured accounts. Built for developers and creators.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.3s ease both' }}>
              <Link to="/register" className="btn-primary">
                🚀 Start for free
              </Link>
              <Link to="/login" className="btn-ghost">
                Sign in
              </Link>
            </div>

         
         
          </div>

          {/* Right: interactive demo card */}
          <div style={{ flex: '0 0 auto', minWidth: 360 }}>
            <DemoCard dark={dark} />
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ── */}
      <div style={{
        overflow: 'hidden',
        background: 'var(--accent-grad)',
        padding: '0.9rem 0',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
      }}>
        <div className="ticker-inner" style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap' }}>
          {Array(2).fill(['⚡ Instant short links', '📊 Click analytics', '🔐 Secure accounts', '🔁 Smart redirects', '📱 Mobile friendly', '🌐 Works everywhere']).flat().map((t, idx) => (
            <span key={idx} style={{
              fontSize: '0.85rem', fontWeight: 800,
              fontFamily: "var(--font-m)",
              color: '#fff',
              letterSpacing: '0.04em',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <section id="features" style={{ maxWidth: 1220, margin: '0 auto', padding: '6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.3rem' }}>
          <div style={{
            display: 'inline-block',
            background: dark ? 'rgba(201,105,122,0.16)' : 'rgba(139,123,200,0.12)',
            border: `1px solid ${dark ? 'rgba(201,105,122,0.35)' : 'rgba(139,123,200,0.25)'}`,
            borderRadius: 999, padding: '0.38rem 1.05rem',
            fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)',
            marginBottom: '1rem', letterSpacing: '0.08em',
          }}>
            Everything you need
          </div>
          <h2 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.8rem', fontFamily: fontD }}>
            Packed with powerful features
          </h2>
          <p style={{ color: muted, fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>
            From instant link creation to deep analytics — everything you need to manage and track your URLs.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={`${i * 0.08}s`} dark={dark} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{
        background: dark ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04))' : 'linear-gradient(180deg, rgba(139,123,200,0.04), rgba(139,123,200,0.06))',
        borderTop: `1px solid ${dark ? 'rgba(201,169,110,0.15)' : 'rgba(139,123,200,0.14)'}`,
        borderBottom: `1px solid ${dark ? 'rgba(201,169,110,0.15)' : 'rgba(139,123,200,0.14)'}`,
        padding: '6rem 1.5rem',
      }}>
        <div style={{ maxWidth: 1220, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.6rem', fontFamily: fontD }}>
              How it works
            </h2>
            <p style={{ color: muted, fontSize: '1.05rem' }}>Three steps, zero friction.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', position: 'relative' }}>
            {[
              { num: '01', icon: '🔑', title: 'Create account', desc: 'Sign up in seconds. Your links and analytics are private and tied to your account.' },
              { num: '02', icon: '🔗', title: 'Paste your URL', desc: 'Drop any long link into the shortener. We generate a compact 7-char code instantly.' },
              { num: '03', icon: '📊', title: 'Share & track', desc: 'Share your short URL. Watch clicks roll in with real-time analytics on your dashboard.' },
            ].map((step) => (
              <div key={step.num} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--accentGrad)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, margin: '0 auto 1.2rem',
                  boxShadow: dark ? '0 0 40px rgba(201,105,122,0.35)' : '0 0 40px rgba(139,123,200,0.30)',
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                  STEP {step.num}
                </div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--heading)' }}>{step.title}</h3>
                <p style={{ color: muted, fontSize: '0.92rem', lineHeight: 1.8, maxWidth: 260, margin: '0 auto' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      

      {/* ── CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--violet-d) 0%, var(--violet) 40%, var(--cyan) 100%)',
        padding: '6rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '30%',
          width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(2px)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', marginBottom: '1rem', fontFamily: fontD }}>
            Ready to shorten smarter?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.12rem', marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Join thousands of creators and developers who trust snip.ly for their links.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: '#fff', color: 'var(--violet-d)',
              border: 'none', borderRadius: 16,
              padding: '1rem 2.3rem',
              fontWeight: 900, fontSize: '1rem',
              cursor: 'pointer', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'transform 160ms, box-shadow 160ms, filter 160ms',
              boxShadow: '0 14px 40px rgba(0,0,0,0.2)',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 54px rgba(0,0,0,0.3)'; e.currentTarget.style.filter = 'brightness(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.2)'; e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              🚀 Create free account
            </Link>
            <Link to="/login" style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1.6px solid rgba(255,255,255,0.4)',
              borderRadius: 16, padding: '1rem 2.3rem',
              color: '#fff', fontWeight: 800, fontSize: '1rem',
              cursor: 'pointer', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'background 160ms, transform 160ms',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.4rem', fontFamily: fontD }}>
          ⚡ snip<span style={{ color: 'var(--accent)' }}>.ly</span>
        </div>
        <p style={{ color: muted, fontSize: '0.82rem' }}>
            {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
