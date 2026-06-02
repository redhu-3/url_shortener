import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiLinkM, RiBarChartLine, RiFileCopyLine, RiCheckLine, RiSearchLine, RiGlobalLine, RiExternalLinkLine } from 'react-icons/ri';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './PublicLinks.css';

const BASE = import.meta.env.VITE_API_URL || 'https://url-shortener-1-mxet.onrender.com';
const shortUrl = (url) => `${BASE}/${url.alias || url.shortCode}`;
const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const truncate = (s, n = 55) => s?.length > n ? s.slice(0, n) + '…' : s;

export default function PublicLinks() {
  const [urls, setUrls] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/urls/public')
      .then(({ data }) => setUrls(data))
      .catch(() => setToast({ message: 'Failed to load public links', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    setToast({ message: 'Copied!', type: 'success' });
  };

  const filteredUrls = urls.filter(u =>
    u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    (u.alias && u.alias.toLowerCase().includes(search.toLowerCase())) ||
    u.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="landing-wrap">
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ambient blobs */}
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <div className="public-links-container">
        {/* Hero title */}
        <motion.div
          className="public-links-hero"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="badge badge-violet" style={{ alignSelf: 'start', marginBottom: '0.75rem' }}>
            <RiGlobalLine /> Explore Directory
          </div>
          <h1 className="public-links-title">Public Shared Links</h1>
          <p className="public-links-sub">
            Browse active links shared publicly by our community. Anyone can view click trends and visitor statistics.
          </p>
        </motion.div>

        {/* Search & Statistics Bar */}
        <div className="public-search-bar-wrap">
          <div className="search-input-wrap">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search by destination url, code, or alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="public-search-input"
            />
          </div>
          <div className="public-stats-pill">
            <span className="pill pill-violet">{filteredUrls.length} found</span>
          </div>
        </div>

        {/* Main Content Grid */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="public-link-skeleton">
                <div className="skel" style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="skel" style={{ height: 14, width: '30%' }} />
                  <div className="skel" style={{ height: 11, width: '50%' }} />
                </div>
                <div className="skel" style={{ width: 140, height: 36, borderRadius: 10 }} />
              </div>
            ))}
          </div>
        ) : filteredUrls.length === 0 ? (
          <motion.div className="empty-public-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="empty-public-glyph">🌐</div>
            <h3>No public links found</h3>
            <p>Try searching for a different keyword or create a public link in your dashboard!</p>
          </motion.div>
        ) : (
          <div className="public-links-grid">
            <AnimatePresence mode="popLayout">
              {filteredUrls.map(url => {
                const link = shortUrl(url);
                return (
                  <motion.div
                    key={url._id}
                    className="public-link-card"
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="card-top-row">
                      <div className="card-icon"><RiLinkM /></div>
                      <div className="card-labels">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="card-short-url">
                          {link.replace(/^https?:\/\//, '')}
                        </a>
                        <p className="card-original-url">{truncate(url.originalUrl)}</p>
                      </div>
                    </div>

                    <div className="card-meta-row">
                      <div className="meta-col">
                        <span className="meta-label">Clicks</span>
                        <span className="meta-val"><RiBarChartLine /> {url.clickCount.toLocaleString()}</span>
                      </div>
                      <div className="meta-col">
                        <span className="meta-label">Created</span>
                        <span className="meta-val">{fmt(url.createdAt)}</span>
                      </div>
                      <div className="meta-col">
                        <span className="meta-label">Type</span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>Public</span>
                      </div>
                    </div>

                    <hr className="card-divider" />

                    <div className="card-actions-row">
                      <button
                        className={`btn-ghost-small ${copied === url._id ? 'copied' : ''}`}
                        onClick={() => handleCopy(link, url._id)}
                        title="Copy Short URL"
                      >
                        {copied === url._id ? <RiCheckLine /> : <RiFileCopyLine />}
                        {copied === url._id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        className="btn-primary-small"
                        onClick={() => navigate(`/public/stats/${url.alias || url.shortCode}`)}
                      >
                        <RiBarChartLine /> View Stats
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
