// import { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';

// /* ── Animated floating particle background ── */
// function ParticleField({ dark }) {
//   const canvasRef = useRef(null);
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     let raf;
//     const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
//     resize();
//     window.addEventListener('resize', resize);

//     const count = 60;
//     const dots = Array.from({ length: count }, () => ({
//       x: Math.random() * canvas.width,
//       y: Math.random() * canvas.height,
//       r: Math.random() * 1.5 + 0.3,
//       vx: (Math.random() - 0.5) * 0.3,
//       vy: (Math.random() - 0.5) * 0.3,
//       o: Math.random() * 0.5 + 0.1,
//     }));

//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       dots.forEach((d) => {
//         d.x += d.vx; d.y += d.vy;
//         if (d.x < 0) d.x = canvas.width;
//         if (d.x > canvas.width) d.x = 0;
//         if (d.y < 0) d.y = canvas.height;
//         if (d.y > canvas.height) d.y = 0;
//         ctx.beginPath();
//         ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
//         ctx.fillStyle = dark
//           ? `rgba(139,92,246,${d.o})`
//           : `rgba(109,40,217,${d.o * 0.6})`;
//         ctx.fill();
//       });

//       // draw lines between nearby dots
//       for (let i = 0; i < dots.length; i++) {
//         for (let j = i + 1; j < dots.length; j++) {
//           const dx = dots[i].x - dots[j].x;
//           const dy = dots[i].y - dots[j].y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
//           if (dist < 100) {
//             ctx.beginPath();
//             ctx.moveTo(dots[i].x, dots[i].y);
//             ctx.lineTo(dots[j].x, dots[j].y);
//             ctx.strokeStyle = dark
//               ? `rgba(139,92,246,${0.15 * (1 - dist / 100)})`
//               : `rgba(109,40,217,${0.08 * (1 - dist / 100)})`;
//             ctx.lineWidth = 0.5;
//             ctx.stroke();
//           }
//         }
//       }
//       raf = requestAnimationFrame(draw);
//     };
//     draw();
//     return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
//   }, [dark]);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
//     />
//   );
// }

// /* ── Typewriter effect ── */
// function Typewriter({ words }) {
//   const [idx, setIdx] = useState(0);
//   const [displayed, setDisplayed] = useState('');
//   const [deleting, setDeleting] = useState(false);
//   useEffect(() => {
//     const word = words[idx];
//     const speed = deleting ? 40 : 80;
//     const timer = setTimeout(() => {
//       if (!deleting && displayed === word) {
//         setTimeout(() => setDeleting(true), 1800);
//         return;
//       }
//       if (deleting && displayed === '') {
//         setDeleting(false);
//         setIdx((i) => (i + 1) % words.length);
//         return;
//       }
//       setDisplayed(deleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1));
//     }, speed);
//     return () => clearTimeout(timer);
//   }, [displayed, deleting, idx, words]);
//   return (
//     <span style={{ color: 'var(--accent)', borderRight: '2px solid var(--accent)', paddingRight: 2 }}>
//       {displayed}
//     </span>
//   );
// }

// /* ── Animated counter ── */
// function Counter({ target, duration = 1500, suffix = '' }) {
//   const [val, setVal] = useState(0);
//   const ref = useRef(null);
//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (!entry.isIntersecting) return;
//       observer.disconnect();
//       let start = null;
//       const step = (ts) => {
//         if (!start) start = ts;
//         const p = Math.min((ts - start) / duration, 1);
//         const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
//         setVal(Math.floor(ease * target));
//         if (p < 1) requestAnimationFrame(step);
//         else setVal(target);
//       };
//       requestAnimationFrame(step);
//     }, { threshold: 0.3 });
//     if (ref.current) observer.observe(ref.current);
//     return () => observer.disconnect();
//   }, [target, duration]);
//   return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
// }

// /* ── Feature card ── */
// function FeatureCard({ icon, title, desc, delay, dark }) {
//   return (
//     <div
//       style={{
//         background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(109,40,217,0.04)',
//         border: `1px solid ${dark ? 'rgba(139,92,246,0.2)' : 'rgba(109,40,217,0.12)'}`,
//         borderRadius: 20,
//         padding: '2rem',
//         animation: `fadeUp 0.6s ease both`,
//         animationDelay: delay,
//         transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//         cursor: 'default',
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.transform = 'translateY(-6px)';
//         e.currentTarget.style.boxShadow = dark
//           ? '0 20px 60px rgba(139,92,246,0.2)'
//           : '0 20px 60px rgba(109,40,217,0.12)';
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.transform = 'translateY(0)';
//         e.currentTarget.style.boxShadow = 'none';
//       }}
//     >
//       <div style={{
//         width: 52, height: 52, borderRadius: 14,
//         background: dark ? 'rgba(139,92,246,0.2)' : 'rgba(109,40,217,0.1)',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         fontSize: 24, marginBottom: '1.2rem',
//       }}>
//         {icon}
//       </div>
//       <h3 style={{
//         fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem',
//         fontFamily: "'Clash Display', 'Plus Jakarta Sans', sans-serif",
//         color: dark ? '#f4f4f5' : '#18181b',
//       }}>{title}</h3>
//       <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: dark ? '#a1a1aa' : '#52525b', margin: 0 }}>{desc}</p>
//     </div>
//   );
// }

// /* ── Mock URL demo card ── */
// function DemoCard({ dark }) {
//   const [url, setUrl] = useState('');
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const demo = () => {
//     if (!url.trim()) return;
//     setLoading(true);
//     setTimeout(() => {
//       const code = Math.random().toString(36).slice(2, 9);
//       setResult(`snip.ly/${code}`);
//       setLoading(false);
//     }, 900);
//   };

//   return (
//     <div style={{
//       background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
//       border: `1px solid ${dark ? 'rgba(139,92,246,0.3)' : 'rgba(109,40,217,0.15)'}`,
//       borderRadius: 24,
//       padding: '2rem',
//       boxShadow: dark
//         ? '0 0 80px rgba(139,92,246,0.15), 0 40px 80px rgba(0,0,0,0.4)'
//         : '0 0 80px rgba(109,40,217,0.08), 0 40px 80px rgba(0,0,0,0.08)',
//       animation: 'fadeUp 0.8s 0.3s ease both',
//       maxWidth: 480,
//       width: '100%',
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.2rem' }}>
//         {['#ff5f57','#febc2e','#28c840'].map((c) => (
//           <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
//         ))}
//         <span style={{ fontSize: '0.75rem', color: dark ? '#71717a' : '#a1a1aa', marginLeft: 6, fontFamily: 'monospace' }}>
//           snip.ly — url shortener
//         </span>
//       </div>

//       <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: dark ? '#a1a1aa' : '#71717a', fontWeight: 600 }}>
//         Paste your long URL
//       </label>
//       <div style={{ display: 'flex', gap: 8, marginTop: '0.5rem', marginBottom: '1rem' }}>
//         <input
//           value={url}
//           onChange={(e) => { setUrl(e.target.value); setResult(null); }}
//           placeholder="https://your-very-long-url.com/..."
//           onKeyDown={(e) => e.key === 'Enter' && demo()}
//           style={{
//             flex: 1,
//             background: dark ? 'rgba(255,255,255,0.06)' : '#f4f4f5',
//             border: `1px solid ${dark ? 'rgba(139,92,246,0.25)' : 'rgba(109,40,217,0.15)'}`,
//             borderRadius: 12,
//             padding: '0.65rem 1rem',
//             color: dark ? '#e4e4e7' : '#18181b',
//             fontSize: '0.875rem',
//             outline: 'none',
//             fontFamily: 'monospace',
//           }}
//         />
//         <button
//           onClick={demo}
//           style={{
//             background: loading ? (dark ? 'rgba(139,92,246,0.5)' : 'rgba(109,40,217,0.5)') : 'var(--accent)',
//             border: 'none',
//             borderRadius: 12,
//             padding: '0.65rem 1.2rem',
//             color: '#fff',
//             fontWeight: 700,
//             fontSize: '0.875rem',
//             cursor: loading ? 'not-allowed' : 'pointer',
//             transition: 'all 0.2s',
//             whiteSpace: 'nowrap',
//           }}
//         >
//           {loading ? '⚡ …' : '⚡ Shorten'}
//         </button>
//       </div>

//       {result && (
//         <div style={{
//           background: dark ? 'rgba(139,92,246,0.12)' : 'rgba(109,40,217,0.06)',
//           border: `1px solid ${dark ? 'rgba(139,92,246,0.3)' : 'rgba(109,40,217,0.2)'}`,
//           borderRadius: 12,
//           padding: '0.9rem 1rem',
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           animation: 'popIn 0.3s ease',
//         }}>
//           <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
//             🔗 {result}
//           </span>
//           <button
//             onClick={() => navigator.clipboard.writeText(result)}
//             style={{
//               background: 'var(--accent)', border: 'none', borderRadius: 8,
//               padding: '0.35rem 0.8rem', color: '#fff', fontSize: '0.75rem',
//               fontWeight: 700, cursor: 'pointer',
//             }}
//           >
//             Copy
//           </button>
//         </div>
//       )}

//       {/* Mock analytics preview */}
//       <div style={{ marginTop: '1.2rem', display: 'flex', gap: 8 }}>
//         {[
//           { label: 'Total Links', val: '2,847' },
//           { label: 'Clicks Today', val: '14.2K' },
//           { label: 'Uptime', val: '99.9%' },
//         ].map((s) => (
//           <div key={s.label} style={{
//             flex: 1, textAlign: 'center',
//             background: dark ? 'rgba(255,255,255,0.04)' : '#f9f9fb',
//             borderRadius: 10, padding: '0.6rem 0.4rem',
//             border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
//           }}>
//             <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent)' }}>{s.val}</div>
//             <div style={{ fontSize: '0.65rem', color: dark ? '#71717a' : '#a1a1aa', marginTop: 2 }}>{s.label}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════
//    MAIN LANDING PAGE
// ══════════════════════════════════════════ */
// export default function Landing() {
//   const [dark, setDark] = useState(true);

//   const bg = dark ? '#09090b' : '#fafaf9';
//   const text = dark ? '#f4f4f5' : '#18181b';
//   const muted = dark ? '#a1a1aa' : '#52525b';
//   const accent = '#7c3aed';

//   const features = [
//     { icon: '⚡', title: 'Instant Shortening', desc: 'Generate short links in milliseconds with a 7-character nanoid code that is guaranteed unique.' },
//     { icon: '📊', title: 'Deep Analytics', desc: 'Track every click with timestamps, IP info, and browser data. See daily trends with beautiful charts.' },
//     { icon: '🔐', title: 'Secure & Private', desc: 'JWT-authenticated accounts ensure only you can see, manage, and delete your links.' },
//     { icon: '🗂️', title: 'Full Dashboard', desc: 'Manage all your links in one place — copy, delete, inspect — with a clean sortable table.' },
//     { icon: '🔁', title: 'Smart Redirects', desc: 'Every redirect is logged and counted instantly. Zero-lag redirects to your destination URL.' },
//     { icon: '🌐', title: 'Works Anywhere', desc: 'Share links across social, email, or messaging. Every short URL is just one tap away.' },
//   ];

//   return (
//     <div style={{
//       '--accent': accent,
//       background: bg,
//       color: text,
//       fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
//       minHeight: '100vh',
//       overflowX: 'hidden',
//       transition: 'background 0.4s, color 0.4s',
//     }}>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

//         * { box-sizing: border-box; margin: 0; padding: 0; }

//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(28px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes popIn {
//           from { opacity: 0; transform: scale(0.92); }
//           to   { opacity: 1; transform: scale(1); }
//         }
//         @keyframes float {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           33%       { transform: translateY(-14px) rotate(1deg); }
//           66%       { transform: translateY(-6px) rotate(-1deg); }
//         }
//         @keyframes gradientShift {
//           0%   { background-position: 0% 50%; }
//           50%  { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//         @keyframes pulse-ring {
//           0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
//           70%  { transform: scale(1);    box-shadow: 0 0 0 18px rgba(124,58,237,0); }
//           100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124,58,237,0); }
//         }
//         @keyframes ticker {
//           0%   { transform: translateX(0); }
//           100% { transform: translateX(-50%); }
//         }
//         .ticker-inner { animation: ticker 22s linear infinite; }

//         .btn-primary {
//           background: linear-gradient(135deg, #7c3aed, #a855f7);
//           background-size: 200% 200%;
//           animation: gradientShift 4s ease infinite;
//           border: none;
//           border-radius: 14px;
//           padding: 0.85rem 2rem;
//           color: #fff;
//           font-weight: 800;
//           font-size: 1rem;
//           cursor: pointer;
//           transition: transform 0.2s, box-shadow 0.2s;
//           font-family: inherit;
//           text-decoration: none;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//         }
//         .btn-primary:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 12px 40px rgba(124,58,237,0.45);
//         }
//         .btn-ghost {
//           background: transparent;
//           border: 1.5px solid ${dark ? 'rgba(139,92,246,0.35)' : 'rgba(109,40,217,0.25)'};
//           border-radius: 14px;
//           padding: 0.85rem 2rem;
//           color: ${dark ? '#e4e4e7' : '#3f3f46'};
//           font-weight: 700;
//           font-size: 1rem;
//           cursor: pointer;
//           transition: all 0.2s;
//           font-family: inherit;
//           text-decoration: none;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//         }
//         .btn-ghost:hover {
//           background: ${dark ? 'rgba(139,92,246,0.1)' : 'rgba(109,40,217,0.06)'};
//           border-color: var(--accent);
//           color: var(--accent);
//         }
//         .nav-link {
//           color: ${muted};
//           text-decoration: none;
//           font-size: 0.9rem;
//           font-weight: 500;
//           transition: color 0.2s;
//         }
//         .nav-link:hover { color: ${text}; }
//       `}</style>

//       {/* ── NAVBAR ── */}
//       <nav style={{
//         position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
//         background: dark ? 'rgba(9,9,11,0.85)' : 'rgba(250,250,249,0.85)',
//         backdropFilter: 'blur(20px)',
//         borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
//         transition: 'background 0.4s',
//       }}>
//         <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <div style={{
//               width: 34, height: 34, borderRadius: 10,
//               background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: 16, animation: 'pulse-ring 2.5s ease infinite',
//             }}>⚡</div>
//             <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
//               snip<span style={{ color: 'var(--accent)' }}>.ly</span>
//             </span>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
//             <a href="#features" className="nav-link">Features</a>
//             <a href="#stats" className="nav-link">Stats</a>
//             <a href="#how" className="nav-link">How it works</a>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//             {/* Dark/light toggle */}
//             <button
//               onClick={() => setDark(!dark)}
//               style={{
//                 background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
//                 border: 'none', borderRadius: 10, width: 38, height: 38,
//                 cursor: 'pointer', fontSize: 16, transition: 'all 0.2s',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//               }}
//               title="Toggle theme"
//             >
//               {dark ? '☀️' : '🌙'}
//             </button>
//             <Link to="/login" className="btn-ghost" style={{ padding: '0.55rem 1.2rem', fontSize: '0.875rem' }}>
//               Sign in
//             </Link>
//             <Link to="/register" className="btn-primary" style={{ padding: '0.55rem 1.2rem', fontSize: '0.875rem' }}>
//               Get started →
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* ── HERO ── */}
//       <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
//         <ParticleField dark={dark} />

//         {/* Glow orbs */}
//         <div style={{
//           position: 'absolute', top: '15%', left: '10%',
//           width: 500, height: 500, borderRadius: '50%',
//           background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
//           pointerEvents: 'none',
//         }} />
//         <div style={{
//           position: 'absolute', bottom: '10%', right: '5%',
//           width: 400, height: 400, borderRadius: '50%',
//           background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
//           pointerEvents: 'none',
//         }} />

//         <div style={{ maxWidth: 1200, margin: '0 auto', padding: '7rem 1.5rem 4rem', display: 'flex', alignItems: 'center', gap: '4rem', position: 'relative', zIndex: 1 }}>
//           {/* Left: headline */}
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{
//               display: 'inline-flex', alignItems: 'center', gap: 8,
//               background: dark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
//               border: '1px solid rgba(124,58,237,0.3)',
//               borderRadius: 100, padding: '0.4rem 1rem',
//               fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)',
//               marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease both',
//             }}>
//               <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
//               Free · Open Source · Production Ready
//             </div>

//             <h1 style={{
//               fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
//               fontWeight: 900,
//               lineHeight: 1.1,
//               letterSpacing: '-0.035em',
//               marginBottom: '1.2rem',
//               animation: 'fadeUp 0.6s 0.1s ease both',
//               fontFamily: "'Plus Jakarta Sans', sans-serif",
//             }}>
//               Shorten links.<br />
//               Track{' '}
//               <Typewriter words={['every click.', 'all visits.', 'real analytics.', 'your growth.']} />
//             </h1>

//             <p style={{
//               fontSize: 'clamp(1rem, 2vw, 1.2rem)',
//               color: muted,
//               lineHeight: 1.7,
//               maxWidth: 480,
//               marginBottom: '2rem',
//               animation: 'fadeUp 0.6s 0.2s ease both',
//             }}>
//               A blazing-fast URL shortener with real-time analytics, custom dashboards, 
//               and JWT-secured accounts. Built for developers and creators.
//             </p>

//             <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.3s ease both' }}>
//               <Link to="/register" className="btn-primary">
//                 🚀 Start for free
//               </Link>
//               <Link to="/login" className="btn-ghost">
//                 Sign in
//               </Link>
//             </div>

//             <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', animation: 'fadeUp 0.6s 0.4s ease both' }}>
//               {[
//                 { n: '50K+', l: 'Links created' },
//                 { n: '2M+', l: 'Clicks tracked' },
//                 { n: '99.9%', l: 'Uptime' },
//               ].map((s) => (
//                 <div key={s.l}>
//                   <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>{s.n}</div>
//                   <div style={{ fontSize: '0.75rem', color: muted }}>{s.l}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right: interactive demo card */}
//           <div style={{ flex: '0 0 auto', animation: 'float 6s ease-in-out infinite' }}>
//             <DemoCard dark={dark} />
//           </div>
//         </div>
//       </section>

//       {/* ── TICKER STRIP ── */}
//       <div style={{
//         overflow: 'hidden',
//         background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
//         padding: '0.8rem 0',
//       }}>
//         <div className="ticker-inner" style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap' }}>
//           {Array(2).fill(['⚡ Instant short links', '📊 Click analytics', '🔐 Secure accounts', '🔁 Smart redirects', '📱 Mobile friendly', '🌐 Works everywhere', '🗂️ Dashboard view', '💾 Visit history']).flat().map((t, i) => (
//             <span key={i} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em' }}>
//               {t}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* ── FEATURES ── */}
//       <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1.5rem' }}>
//         <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
//           <div style={{
//             display: 'inline-block',
//             background: dark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
//             border: '1px solid rgba(124,58,237,0.3)',
//             borderRadius: 100, padding: '0.35rem 1rem',
//             fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)',
//             marginBottom: '1rem',
//           }}>
//             Everything you need
//           </div>
//           <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.8rem' }}>
//             Packed with powerful features
//           </h2>
//           <p style={{ color: muted, fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
//             From instant link creation to deep analytics — everything you need to manage and track your URLs.
//           </p>
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
//           {features.map((f, i) => (
//             <FeatureCard key={f.title} {...f} delay={`${i * 0.08}s`} dark={dark} />
//           ))}
//         </div>
//       </section>

//       {/* ── HOW IT WORKS ── */}
//       <section id="how" style={{
//         background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(124,58,237,0.03)',
//         borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
//         borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
//         padding: '6rem 1.5rem',
//       }}>
//         <div style={{ maxWidth: 1200, margin: '0 auto' }}>
//           <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
//             <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.8rem' }}>
//               How it works
//             </h2>
//             <p style={{ color: muted, fontSize: '1.05rem' }}>Three steps, zero friction.</p>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', position: 'relative' }}>
//             {[
//               { num: '01', icon: '🔑', title: 'Create account', desc: 'Sign up in seconds. Your links and analytics are private and tied to your account.' },
//               { num: '02', icon: '🔗', title: 'Paste your URL', desc: 'Drop any long link into the shortener. We generate a compact 7-char code instantly.' },
//               { num: '03', icon: '📊', title: 'Share & track', desc: 'Share your short URL. Watch clicks roll in with real-time analytics on your dashboard.' },
//             ].map((step, i) => (
//               <div key={step.num} style={{ textAlign: 'center', position: 'relative' }}>
//                 <div style={{
//                   width: 72, height: 72, borderRadius: '50%',
//                   background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 28, margin: '0 auto 1.2rem',
//                   boxShadow: '0 0 30px rgba(124,58,237,0.4)',
//                 }}>
//                   {step.icon}
//                 </div>
//                 <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
//                   STEP {step.num}
//                 </div>
//                 <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>{step.title}</h3>
//                 <p style={{ color: muted, fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 240, margin: '0 auto' }}>{step.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── STATS STRIP ── */}
//       <section id="stats" style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1.5rem' }}>
//         <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
//           <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
//             Trusted by makers worldwide
//           </h2>
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
//           {[
//             { label: 'Links Shortened', target: 50284, suffix: '+' },
//             { label: 'Clicks Tracked', target: 2100000, suffix: '+' },
//             { label: 'Active Users', target: 3200, suffix: '+' },
//             { label: 'Uptime %', target: 99, suffix: '.9%' },
//           ].map((s) => (
//             <div key={s.label} style={{
//               textAlign: 'center',
//               background: dark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)',
//               border: `1px solid ${dark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.12)'}`,
//               borderRadius: 20, padding: '2rem 1rem',
//             }}>
//               <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
//                 <Counter target={s.target} suffix={s.suffix} />
//               </div>
//               <div style={{ color: muted, fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{s.label}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── CTA ── */}
//       <section style={{
//         background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 40%, #a855f7 100%)',
//         padding: '6rem 1.5rem',
//         textAlign: 'center',
//         position: 'relative',
//         overflow: 'hidden',
//       }}>
//         <div style={{
//           position: 'absolute', top: '-60%', left: '30%',
//           width: 600, height: 600, borderRadius: '50%',
//           background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
//           pointerEvents: 'none',
//         }} />
//         <div style={{ position: 'relative', zIndex: 1 }}>
//           <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', marginBottom: '1rem' }}>
//             Ready to shorten smarter?
//           </h2>
//           <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 460, margin: '0 auto 2rem' }}>
//             Join thousands of creators and developers who trust snip.ly for their links.
//           </p>
//           <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
//             <Link to="/register" style={{
//               background: '#fff', color: '#7c3aed',
//               border: 'none', borderRadius: 14,
//               padding: '0.9rem 2.2rem',
//               fontWeight: 800, fontSize: '1rem',
//               cursor: 'pointer', textDecoration: 'none',
//               display: 'inline-flex', alignItems: 'center', gap: 8,
//               transition: 'transform 0.2s, box-shadow 0.2s',
//               boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'; }}
//               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
//             >
//               🚀 Create free account
//             </Link>
//             <Link to="/login" style={{
//               background: 'rgba(255,255,255,0.15)',
//               border: '1.5px solid rgba(255,255,255,0.4)',
//               borderRadius: 14, padding: '0.9rem 2.2rem',
//               color: '#fff', fontWeight: 700, fontSize: '1rem',
//               cursor: 'pointer', textDecoration: 'none',
//               display: 'inline-flex', alignItems: 'center', gap: 8,
//               transition: 'background 0.2s',
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
//               onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
//             >
//               Sign in instead
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* ── FOOTER ── */}
//       <footer style={{
//         borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
//         padding: '2.5rem 1.5rem',
//         textAlign: 'center',
//       }}>
//         <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
//           ⚡ snip<span style={{ color: 'var(--accent)' }}>.ly</span>
//         </div>
//         <p style={{ color: muted, fontSize: '0.8rem' }}>
//           Built with React, Node.js, MongoDB &amp; ❤️ — {new Date().getFullYear()}
//         </p>
//       </footer>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <div
      style={{
        background: dark
          ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,250,255,0.8) 100%)',
        border: `1px solid ${dark ? 'rgba(168,85,247,0.22)' : 'rgba(124,58,237,0.18)'}`,
        borderRadius: 22,
        padding: '2rem',
        animation: `fadeUp 0.6s ease both`,
        animationDelay: delay,
        transition: 'transform 280ms cubic-bezier(.2,.8,.2,1), box-shadow 280ms, border-color 280ms',
        cursor: 'default',
        boxShadow: dark
          ? '0 8px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 12px 30px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
        e.currentTarget.style.boxShadow = dark
          ? '0 18px 60px rgba(168,85,247,0.22), 0 10px 30px rgba(0,0,0,0.45)'
          : '0 22px 60px rgba(124,58,237,0.18), 0 12px 30px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = 'var(--accentSoft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = dark
          ? '0 8px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 12px 30px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.8)';
        e.currentTarget.style.borderColor = dark ? 'rgba(168,85,247,0.22)' : 'rgba(124,58,237,0.18)';
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--chipBg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, marginBottom: '1.1rem',
        boxShadow: 'inset 0 0 14px rgba(124,58,237,0.18)',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem',
        fontFamily: "'Sora', 'Geist', system-ui, sans-serif",
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

  return (
    <div style={{
      position: 'relative',
      background: dark
        ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
        : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.9) 100%)',
      border: `1px solid ${dark ? 'rgba(168,85,247,0.35)' : 'rgba(124,58,237,0.2)'}`,
      borderRadius: 26,
      padding: '2rem',
      boxShadow: dark
        ? '0 20px 70px rgba(0,0,0,0.55), 0 0 100px rgba(168,85,247,0.18)'
        : '0 24px 80px rgba(124,58,237,0.16), 0 8px 60px rgba(0,0,0,0.08)',
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
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 6px var(--focusRing)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--inputBorder)';
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.06)';
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
            boxShadow: '0 10px 30px rgba(124,58,237,0.35)',
            animation: 'gradientShift 5s ease infinite',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(124,58,237,0.45)';
              e.currentTarget.style.filter = 'brightness(1.06)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(124,58,237,0.35)';
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
              boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
              transition: 'transform 140ms, box-shadow 140ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(124,58,237,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.35)'; }}
          >
            Copy
          </button>
        </div>
      )}

      {/* Mock analytics preview */}
      <div style={{ marginTop: '1.2rem', display: 'flex', gap: 10 }}>
        {[
          { label: 'Total Links', val: '2,847' },
          { label: 'Clicks Today', val: '14.2K' },
          { label: 'Uptime', val: '99.9%' },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center',
            background: 'var(--statBg)',
            borderRadius: 12, padding: '0.7rem 0.5rem',
            border: '1px solid var(--statBorder)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--accent)' }}>{s.val}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
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
  const [dark, setDark] = useState(true);

  const bg = dark ? '#0a0a0f' : '#faf9ff';
  const text = dark ? '#f6f7fb' : '#0f1222';
  const muted = dark ? '#a8acb8' : '#5f6580';
  const accent = '#7c3aed';

  const features = [
    { icon: '⚡', title: 'Instant Shortening', desc: 'Generate short links in milliseconds with a 7-character nanoid code that is guaranteed unique.' },
    { icon: '📊', title: 'Deep Analytics', desc: 'Track every click with timestamps, IP info, and browser data. See daily trends with beautiful charts.' },
    { icon: '🔐', title: 'Secure & Private', desc: 'JWT-authenticated accounts ensure only you can see, manage, and delete your links.' },
    { icon: '🗂️', title: 'Full Dashboard', desc: 'Manage all your links in one place — copy, delete, inspect — with a clean sortable table.' },
    { icon: '🔁', title: 'Smart Redirects', desc: 'Every redirect is logged and counted instantly. Zero-lag redirects to your destination URL.' },
    { icon: '🌐', title: 'Works Anywhere', desc: 'Share links across social, email, or messaging. Every short URL is just one tap away.' },
  ];

  return (
    <div style={{
      '--accent': accent,
      '--accentSoft': dark ? 'rgba(124,58,237,0.55)' : 'rgba(124,58,237,0.45)',
      '--accentGrad': 'linear-gradient(135deg, #7c3aed, #a855f7 45%, #22d3ee 120%)',
      '--focusRing': dark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.2)',
      '--muted': muted,
      '--mutedStrong': dark ? '#c2c6d6' : '#3c4056',
      '--heading': dark ? '#f2f4ff' : '#0f1222',
      '--chipBg': dark ? 'rgba(124,58,237,0.16)' : 'rgba(124,58,237,0.1)',
      '--pillBg': dark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.06)',
      '--pillBorder': dark ? 'rgba(124,58,237,0.32)' : 'rgba(124,58,237,0.2)',
      '--inputBg': dark ? 'rgba(10,10,16,0.6)' : '#f4f2ff',
      '--inputBorder': dark ? 'rgba(168,85,247,0.28)' : 'rgba(124,58,237,0.24)',
      '--statBg': dark ? 'rgba(255,255,255,0.04)' : '#fbfaff',
      '--statBorder': dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,18,34,0.06)',
      background: bg,
      color: text,
      fontFamily: "'Geist', 'Sora', 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden',
      transition: 'background 0.4s, color 0.4s',
    }}>

      <style>{`
        @import url('[fonts.googleapis.com](https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Geist:wght@400;600;700;800;900&display=swap)');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        /* Subtle noise */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='[w3.org](http://www.w3.org/2000/svg)' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='table' tableValues='0 0 0 0 0 0.03 0.04 0.03 0.05 0.04 0'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E");
          opacity: ${dark ? '0.08' : '0.06'};
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(0.6deg); }
          66%       { transform: translateY(-5px) rotate(-0.6deg); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shine {
          0% { transform: translateX(-120%); }
          55% { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
        .ticker-inner { animation: ticker 22s linear infinite; }

        .btn-primary {
          background: var(--accentGrad);
          background-size: 200% 200%;
          animation: gradientShift 5s ease infinite;
          border: none;
          border-radius: 16px;
          padding: 0.95rem 2.1rem;
          color: #fff;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 160ms, box-shadow 160ms, filter 160ms;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 14px 40px rgba(124,58,237,0.42);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 54px rgba(124,58,237,0.52);
          filter: brightness(1.06);
        }
        .btn-ghost {
          background: transparent;
          border: 1.6px solid ${dark ? 'rgba(168,85,247,0.4)' : 'rgba(124,58,237,0.28)'};
          border-radius: 16px;
          padding: 0.95rem 2rem;
          color: ${dark ? '#eaeaf6' : '#2a2c3e'};
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: all 160ms;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .btn-ghost:hover {
          background: ${dark ? 'rgba(168,85,247,0.12)' : 'rgba(124,58,237,0.08)'};
          border-color: var(--accent);
          color: var(--accent);
        }
        .nav-link {
          color: ${muted};
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          transition: color 160ms, transform 160ms;
          letter-spacing: 0.01em;
        }
        .nav-link:hover { color: ${text}; transform: translateY(-1px); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: dark ? 'rgba(5,6,12,0.72)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        transition: 'background 0.4s',
      }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 1.5rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7 70%, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 0 30px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}>⚡</div>
            <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
              snip<span style={{ color: 'var(--accent)' }}>.ly</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#stats" className="nav-link">Stats</a>
            <a href="#how" className="nav-link">How it works</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Dark/light toggle */}
            <button
              onClick={() => setDark(!dark)}
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(124,58,237,0.25)', borderRadius: 12, width: 42, height: 42,
                cursor: 'pointer', fontSize: 18, transition: 'all 160ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
              title="Toggle theme"
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn-ghost" style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem' }}>
              Sign in
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem' }}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Background gradient grid + particles */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: dark
          ? 'radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.0) 60%), radial-gradient(1000px 500px at 85% 80%, rgba(6,182,212,0.14) 0%, rgba(6,182,212,0.0) 60%)'
          : 'radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.0) 60%), radial-gradient(1000px 500px at 85% 80%, rgba(79,70,229,0.14) 0%, rgba(79,70,229,0.0) 60%)',
        maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)'
      }} />
      <ParticleField dark={dark} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Glow orbs refined */}
        <div style={{
          position: 'absolute', top: '12%', left: '8%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '8%', right: '8%',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '7rem 1.5rem 4rem', display: 'flex', alignItems: 'center', gap: '4rem', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {/* Left: headline */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: dark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: 999, padding: '0.45rem 1rem',
              fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)',
              marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease both',
              letterSpacing: '0.08em',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 10px #22c55e' }} />
              Free · Open Source · Production Ready
            </div>

            <h1 style={{
              fontSize: 'clamp(2.8rem, 6.2vw, 4.6rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: '1.2rem',
              animation: 'fadeUp 0.6s 0.1s ease both',
              fontFamily: "'Sora', 'Geist', sans-serif",
              background: 'linear-gradient(180deg, #ffffff, #c7c9ff)',
              WebkitBackgroundClip: 'text',
              color: dark ? 'transparent' : '#0f1222',
              textShadow: dark ? '0 0 30px rgba(124,58,237,0.18)' : 'none',
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

            <div style={{ marginTop: '2.4rem', display: 'flex', alignItems: 'center', gap: '1.8rem', animation: 'fadeUp 0.6s 0.4s ease both' }}>
              {[
                { n: '50K+', l: 'Links created' },
                { n: '2M+', l: 'Clicks tracked' },
                { n: '99.9%', l: 'Uptime' },
              ].map((s) => (
                <div key={s.l}>
                  <div style={{
                    fontWeight: 900, fontSize: '1.22rem',
                    background: 'var(--accentGrad)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}>{s.n}</div>
                  <div style={{ fontSize: '0.8rem', color: muted }}>{s.l}</div>
                </div>
              ))}
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
        background: 'var(--accentGrad)',
        padding: '0.9rem 0',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
      }}>
        <div className="ticker-inner" style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap' }}>
          {Array(2).fill(['⚡ Instant short links', '📊 Click analytics', '🔐 Secure accounts', '🔁 Smart redirects', '📱 Mobile friendly', '🌐 Works everywhere', '🗂️ Dashboard view', '💾 Visit history']).flat().map((t, i) => (
            <span key={i} style={{ fontSize: '0.88rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.06em' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1220, margin: '0 auto', padding: '6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.3rem' }}>
          <div style={{
            display: 'inline-block',
            background: dark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 999, padding: '0.38rem 1.05rem',
            fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)',
            marginBottom: '1rem', letterSpacing: '0.08em',
          }}>
            Everything you need
          </div>
          <h2 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.8rem', fontFamily: "'Sora', sans-serif" }}>
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
        background: dark ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04))' : 'linear-gradient(180deg, rgba(124,58,237,0.04), rgba(124,58,237,0.06))',
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        padding: '6rem 1.5rem',
      }}>
        <div style={{ maxWidth: 1220, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.6rem', fontFamily: "'Sora', sans-serif" }}>
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
                  boxShadow: '0 0 40px rgba(124,58,237,0.45)',
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
      <section id="stats" style={{ maxWidth: 1220, margin: '0 auto', padding: '6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: "'Sora', sans-serif" }}>
            Trusted by makers worldwide
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Links Shortened', target: 50284, suffix: '+' },
            { label: 'Clicks Tracked', target: 2100000, suffix: '+' },
            { label: 'Active Users', target: 3200, suffix: '+' },
            { label: 'Uptime %', target: 99, suffix: '.9%' },
          ].map((s) => (
            <div key={s.label} style={{
              textAlign: 'center',
              background: dark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.06)',
              border: `1px solid ${dark ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.16)'}`,
              borderRadius: 22, padding: '2.1rem 1rem',
              boxShadow: dark ? '0 14px 40px rgba(0,0,0,0.35)' : '0 14px 40px rgba(124,58,237,0.12)',
              backdropFilter: 'blur(6px)',
            }}>
              <div style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em',
                background: 'var(--accentGrad)', WebkitBackgroundClip: 'text', color: 'transparent'
              }}>
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <div style={{ color: muted, fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 40%, #06b6d4 100%)',
        padding: '6rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '30%',
          width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(2px)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', marginBottom: '1rem', fontFamily: "'Sora', sans-serif" }}>
            Ready to shorten smarter?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.12rem', marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Join thousands of creators and developers who trust snip.ly for their links.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: '#fff', color: '#5b21b6',
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
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        background: dark ? 'rgba(10,10,16,0.4)' : 'linear-gradient(0deg, #ffffff, #faf9ff)',
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.4rem' }}>
          ⚡ snip<span style={{ color: 'var(--accent)' }}>.ly</span>
        </div>
        <p style={{ color: muted, fontSize: '0.82rem' }}>
          Built with React, Node.js, MongoDB &amp; ❤️ — {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
