import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiBarChartLine, RiTimeLine, RiGlobalLine, RiLinkM, RiArrowRightLine } from 'react-icons/ri';
import api from '../api/axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PublicStats() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/url/public/${shortCode}`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Not found or not public'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  return (
    <div className="noise" style={{ minHeight: '100vh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-10 text-lg font-bold" style={{ fontFamily: 'var(--font-display)', textDecoration: 'none', color: 'var(--text-primary)' }}>
        ⚡ snip<span style={{ color: 'var(--violet-300)' }}>.ly</span>
      </Link>

      {loading ? (
        <div className="skeleton w-full max-w-md h-48 rounded-2xl" />
      ) : error ? (
        <div className="glass-card p-10 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Link not found</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <Link to="/" className="btn btn-primary w-full justify-center">Go to Homepage</Link>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-5">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-violet">Public Stats</span>
            </div>
            <a href={`${BASE}/${data.url.alias || data.url.shortCode}`} target="_blank" rel="noopener noreferrer"
              className="font-mono font-bold text-lg block mb-1 hover:underline"
              style={{ color: 'var(--violet-200)', textDecoration: 'none' }}
            >
              {BASE.replace(/^https?:\/\//, '')}/{data.url.alias || data.url.shortCode}
            </a>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{data.url.originalUrl}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Clicks', val: data.totalClicks, icon: <RiBarChartLine />, color: 'var(--violet-300)' },
              { label: 'Last Visited', val: data.recentVisits[0] ? new Date(data.recentVisits[0].timestamp).toLocaleDateString() : 'Never', icon: <RiTimeLine />, color: 'var(--cyan-400)' },
              { label: 'Created', val: new Date(data.url.createdAt).toLocaleDateString(), icon: <RiGlobalLine />, color: 'var(--emerald-400)' },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center">
                <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {data.recentVisits.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Recent Visitors</h3>
              <div className="space-y-2">
                {data.recentVisits.slice(0, 10).map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <RiGlobalLine /> {v.country}, {v.city}
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span>{v.browser}</span>
                      <span>·</span>
                      <span>{v.device}</span>
                      <span>·</span>
                      <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Want your own short links with analytics?</p>
            <Link to="/register" className="btn btn-primary gap-2 inline-flex">
              Try snip.ly free <RiArrowRightLine />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}