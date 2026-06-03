import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  RiLinkM, RiBarChartLine, RiDeleteBin6Line, RiFileCopyLine,
  RiCheckLine, RiAddLine, RiQrCodeLine, RiDownloadLine,
  RiEditLine, RiCloseLine, RiUploadCloud2Line, RiExternalLinkLine,
  RiTimeLine, RiGlobalLine, RiShieldLine,
  RiFlashlightLine, RiArrowRightLine, RiMenuLine,
  RiStarFill, RiStarLine, RiPulseLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine,
  RiSearchLine
} from 'react-icons/ri';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useUrls } from '../context/UrlContext';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';

const BASE = import.meta.env.VITE_API_URL || 'https://url-shortener-1-mxet.onrender.com';
const shortUrl = (url) => `${BASE}/${url.alias || url.shortCode}`;
const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const truncate = (s, n = 50) => s?.length > n ? s.slice(0, n) + '…' : s;
import './Dashboard.css';

/* ─────────────────────────────────────────
   STAT CELL
───────────────────────────────────────── */
function StatCell({ label, value, icon, color }) {
  return (
    <motion.div
      className="stat-cell"
      style={{ '--accent-color': color }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-icon">{icon}</div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   QR MODAL
───────────────────────────────────────── */
function QRModal({ url, onClose }) {
  const ref = useRef();
  const link = shortUrl(url);

  const downloadSVG = () => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${url.alias || url.shortCode}.svg`;
    a.click();
  };

  const downloadPNG = () => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLReader = window.URL || window.webkitURL || window;
    const blobURL = URLReader.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 1024, 1024);
      context.drawImage(image, 64, 64, 896, 896);
      const pngURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = `qr-${url.alias || url.shortCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URLReader.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  return (
    <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal-box" style={{ maxWidth: 360 }}
        initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-title">
          QR Code Preview
          <button className="modal-close" onClick={onClose}><RiCloseLine /></button>
        </div>
        <div ref={ref} className="qr-box" style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <QRCodeSVG value={link} size={180} level="H" fgColor="#050508" bgColor="#ffffff" />
        </div>
        <p style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--text3)', textAlign: 'center', marginBottom: '1.25rem', wordBreak: 'break-all' }}>{link}</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.6rem 0' }} onClick={downloadSVG}>
            <RiDownloadLine /> SVG
          </button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.6rem 0' }} onClick={downloadPNG}>
            <RiDownloadLine /> PNG (HD)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   EDIT MODAL
───────────────────────────────────────── */
function EditModal({ url, onClose, onSave, showToast }) {
  const [form, setForm] = useState({
    originalUrl: url.originalUrl,
    alias: url.alias || '',
    expiresAt: url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : '',
    isPublic: url.isPublic || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        expiresAt: form.expiresAt || null,
        isPublic: form.isPublic,
      };
      const trimmedAlias = form.alias.trim();
      const originalAlias = url.alias || '';
      if (trimmedAlias !== originalAlias) {
        payload.alias = trimmedAlias || null;
      }
      const { data } = await api.put(`/api/url/${url._id}`, payload);
      onSave(data); onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setLoading(false); }
  };

  return (
    <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal-box" style={{ maxWidth: 480 }}
        initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-title">
          Edit Link
          <button className="modal-close" onClick={onClose}><RiCloseLine /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Destination URL</label>
            <input className="snip-input" value={form.originalUrl} onChange={e => setForm({ ...form, originalUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="input-label">Custom Alias <span style={{ color: 'var(--text3)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <div className="input-prefix">
              <span className="prefix-tag">{BASE.replace(/^https?:\/\//, '')}/</span>
              <input className="snip-input" value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} placeholder="my-link" />
            </div>
          </div>
          <div>
            <label className="input-label">Expiry <span style={{ color: 'var(--text3)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input type="datetime-local" className="snip-input" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <label className="toggle-row" onClick={() => setForm({ ...form, isPublic: !form.isPublic })}>
            <div className="toggle-track" style={{ background: form.isPublic ? 'var(--violet)' : 'rgba(255,255,255,0.1)' }}>
              <div className="toggle-thumb" style={{ transform: form.isPublic ? 'translateX(18px)' : 'translateX(0)' }} />
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>Public stats page</span>
          </label>
        </div>
        <hr className="divider" />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   DELETE MODAL
───────────────────────────────────────── */
function DeleteModal({ url, onClose, onConfirm }) {
  return (
    <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal-box" style={{ maxWidth: 360, textAlign: 'center' }}
        initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)' }}>
          <RiDeleteBin6Line style={{ fontSize: '1.5rem', color: 'var(--rose)' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete this link?</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-m)', color: 'var(--violet-l)' }}>/{url.alias || url.shortCode}</span> and all analytics will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onConfirm(url._id); onClose(); }}>
            <RiDeleteBin6Line /> Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ─────────────────────────────────────────
   BULK MODAL
───────────────────────────────────────── */
function BulkModal({ onClose, onDone, showToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState(null);
  const fileRef = useRef();

  const isValidUrlStr = (str) => {
    if (!str) return false;
    try {
      const parsed = new URL(str);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch { return false; }
  };

  const parseFile = (file) => {
    if (!file) return;
    setParseError(null);
    setRows([]);
    setResults(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length > 0 && data.length === 0) {
          setParseError('Failed to parse CSV file.');
          showToast('Failed to parse CSV file', 'error');
          return;
        }
        if (data.length === 0) {
          setParseError('CSV file is empty.');
          showToast('CSV file is empty', 'error');
          return;
        }
        const seenUrls = new Set();
        const seenAliases = new Set();
        const validated = data.map((r, index) => {
          const originalUrl = (r.url || r.originalUrl || r.original_url || r.URL || r.long_url || r.destination || r.link || r.target_url || r.source_url || '').trim();
          const alias = (r.alias || r.Alias || '').trim();
          const expiresAt = (r.expiresAt || r.expires || '').trim();
          let status = 'valid';
          let errorMsg = '';
          if (!originalUrl) { status = 'invalid'; errorMsg = 'URL is empty'; }
          else if (!isValidUrlStr(originalUrl)) { status = 'invalid'; errorMsg = 'Invalid URL format'; }
          else if (seenUrls.has(originalUrl)) { status = 'duplicate'; errorMsg = 'Duplicate URL in CSV'; }
          else if (alias && seenAliases.has(alias)) { status = 'duplicate'; errorMsg = 'Duplicate Alias in CSV'; }
          if (originalUrl && status === 'valid') seenUrls.add(originalUrl);
          if (alias && status === 'valid') seenAliases.add(alias);
          return { originalUrl, alias, expiresAt, status, errorMsg, index };
        });
        setRows(validated);
        const validCount = validated.filter(r => r.status === 'valid').length;
        if (validCount === 0) {
          setParseError('No valid URLs found in the CSV.');
          showToast('No valid URLs found in the CSV', 'error');
        } else {
          showToast(`Successfully loaded ${validated.length} rows (${validCount} valid)`);
        }
      },
      error: (err) => {
        setParseError(`Parse error: ${err.message}`);
        showToast('Error reading CSV file', 'error');
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    parseFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    const validRows = rows.filter(r => r.status === 'valid');
    if (!validRows.length) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/url/bulk', { urls: validRows });
      setResults(data);
      onDone();
      showToast(`Bulk upload finished! Created ${data.created} links.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk upload failed', 'error');
    } finally { setLoading(false); }
  };

  const validRowsCount = rows.filter(r => r.status === 'valid').length;
  const invalidRowsCount = rows.filter(r => r.status !== 'valid').length;

  return (
    <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal-box" style={{ maxWidth: 640 }}
        initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-title">
          Bulk Shortening
          <button className="modal-close" onClick={onClose}><RiCloseLine /></button>
        </div>
        {!results ? (
          <>
            <div
              className={`drop-zone ${dragging ? 'drag' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="drop-icon"><RiUploadCloud2Line /></div>
              <div style={{ fontFamily: 'var(--font-d)', fontWeight: 700, marginBottom: '0.4rem' }}>
                {rows.length > 0 ? `${rows.length} rows loaded ✓` : 'Drop CSV or click to browse'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                Columns: <code style={{ color: 'var(--violet-l)' }}>url</code> <span style={{ color: 'var(--text3)', fontSize: '0.65rem' }}>(or original_url)</span>, <code style={{ color: 'var(--cyan)' }}>alias</code>, <code style={{ color: 'var(--amber)' }}>expiresAt</code>
              </div>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => parseFile(e.target.files[0])} />
            </div>
            {parseError && (
              <div style={{ marginTop: '1rem', color: 'var(--rose)', fontSize: '0.8rem', textAlign: 'center', fontFamily: 'var(--font-m)' }}>
                ⚠️ {parseError}
              </div>
            )}
            {rows.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text2)' }}>
                  <span>Preview ({validRowsCount} valid, {invalidRowsCount} skipped)</span>
                  <span style={{ color: 'var(--text3)' }}>Showing up to 20 rows</span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '10px', background: 'rgba(255,255,255,0.01)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg1)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>URL</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Alias</th>
                        <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 20).map((r, i) => (
                        <tr key={i} style={{ borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--border)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-m)' }} title={r.originalUrl}>{r.originalUrl}</td>
                          <td style={{ padding: '0.5rem 0.75rem', color: 'var(--violet-l)', fontFamily: 'var(--font-m)' }}>{r.alias ? `/${r.alias}` : '-'}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            {r.status === 'valid' ? (
                              <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>Valid</span>
                            ) : (
                              <span className="badge badge-violet" style={{ fontSize: '0.6rem', color: 'var(--rose)', borderColor: 'rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)' }} title={r.errorMsg}>{r.errorMsg}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 20 && (
                  <div style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text3)', marginTop: '0.5rem' }}>
                    And {rows.length - 20} more rows...
                  </div>
                )}
              </div>
            )}
            <hr className="divider" style={{ margin: '1.25rem 0' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading || !validRowsCount} onClick={handleSubmit}>
                {loading ? 'Processing…' : `Shorten ${validRowsCount} URLs`}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '1rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <RiCheckLine style={{ color: 'var(--emerald)', fontSize: '1.2rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{results.created} of {results.results.length} links created</div>
                {results.results.length - results.created > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{results.results.length - results.created} failed</div>}
              </div>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {results.results.map((r, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', padding: '0.5rem 0.75rem', background: r.error ? 'rgba(251,113,133,0.08)' : 'rgba(52,211,153,0.05)', border: `1px solid ${r.error ? 'rgba(251,113,133,0.2)' : 'rgba(52,211,153,0.15)'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '0.5rem', color: r.error ? 'var(--rose)' : 'var(--text2)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.originalUrl}</span>
                  <span style={{ flexShrink: 0, color: r.error ? 'var(--rose)' : 'var(--emerald)' }}>{r.error || `/${r.alias || r.shortCode}`}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Done</button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Helpers for Health Ping ── */
const getPingTimeAgo = (checkedAt) => {
  if (!checkedAt) return '';
  const diffMs = Date.now() - new Date(checkedAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Last checked just now';
  return `Last checked ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
};

/* ── Favourite Star Button with Sparkle Dot Animation ── */
function FavouriteButton({ isFavourite, onClick }) {
  const [sparkles, setSparkles] = useState([]);

  const handleToggle = (e) => {
    e.stopPropagation();
    onClick();
    if (!isFavourite) {
      const newSparkles = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5;
        const distance = 20;
        return { id: Date.now() + i, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
      });
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 600);
    }
  };

  return (
    <div className="fav-star-container" style={{ position: 'relative', display: 'inline-block', alignSelf: 'start', marginTop: '0.2rem' }}>
      <motion.button
        type="button"
        className="icon-btn fav-star-btn"
        onClick={handleToggle}
        whileTap={{ scale: 0.8 }}
        animate={{ scale: isFavourite ? [1, 1.4, 1] : 1 }}
        transition={{ duration: 0.3 }}
        style={{ color: isFavourite ? 'var(--amber)' : 'var(--text-muted)' }}
      >
        {isFavourite ? <RiStarFill /> : <RiStarLine />}
      </motion.button>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: s.x, y: s.y, scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ position: 'absolute', top: '50%', left: '50%', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--amber)', pointerEvents: 'none', zIndex: 5 }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   URL CARD
───────────────────────────────────────── */
// ← CHANGED: added onPinned prop
function UrlCard({ url, onCopy, onDelete, onQR, onEdit, navigate, copied, index, toggleFavourite, pingUrl, onPinned }) {
  const link = shortUrl(url);
  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
  const isSoon = url.expiresAt && !isExpired && (new Date(url.expiresAt) - Date.now()) < 864e5 * 3;
  const [isPinging, setIsPinging] = useState(false);

  const handlePing = async (e) => {
    e.stopPropagation();
    setIsPinging(true);
    try {
      await pingUrl(url._id);
      // ← NEW: after ping succeeds, tell Dashboard to move this card to top
      onPinned(url._id);
    } catch (err) {
      console.error('Failed to ping URL:', err);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <motion.div
      className="url-item"
      layout
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
        exit: { opacity: 0, scale: 0.9, height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.3 } }
      }}
    >
      <FavouriteButton isFavourite={url.isFavourite} onClick={() => toggleFavourite(url._id, url.isFavourite)} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.1rem' }}>
          <a className="url-shortcode" href={link} target="_blank" rel="noopener noreferrer">
            {link.replace(/^https?:\/\//, '')}
          </a>
          {url.isFavourite && <span className="pill pill-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><RiStarFill /> Favourited</span>}
          {url.alias && <span className="pill pill-violet">alias</span>}
          {isExpired && <span className="pill pill-rose">expired</span>}
          {isSoon && !isExpired && <span className="pill pill-amber">expires soon</span>}
        </div>
        <div className="url-original">{truncate(url.originalUrl, 64)}</div>
        <div className="url-meta">
          <span className="url-meta-item">{fmt(url.createdAt)}</span>
          <span className="url-meta-item"><RiBarChartLine /> {url.clickCount.toLocaleString()} clicks</span>
          {url.expiresAt && !isExpired && (
            <span className="url-meta-item" style={{ color: 'var(--amber)' }}><RiTimeLine /> expires {fmt(url.expiresAt)}</span>
          )}
        </div>

        {url.pingResult && url.pingResult.status && (
          <div className="ping-status-row" style={{ marginTop: '0.4rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className={`badge ${url.pingResult.status === 'live' ? 'badge-cyan' : 'badge-violet'}`}
              style={{
                textTransform: 'none',
                color: url.pingResult.status === 'dead' ? 'var(--rose)' : url.pingResult.status === 'redirect' ? 'var(--amber)' : 'var(--cyan)',
                borderColor: url.pingResult.status === 'dead' ? 'rgba(251,113,133,0.3)' : url.pingResult.status === 'redirect' ? 'rgba(251,191,36,0.3)' : 'rgba(34,211,238,0.25)',
                background: url.pingResult.status === 'dead' ? 'rgba(251,113,133,0.08)' : url.pingResult.status === 'redirect' ? 'rgba(251,191,36,0.08)' : 'rgba(34,211,238,0.08)'
              }}
            >
              {url.pingResult.status === 'live' ? '✅ Live' : url.pingResult.status === 'redirect' ? '⚠️ Redirect' : '❌ Dead'}
            </span>
            {url.pingResult.responseTime !== null && (
              <span style={{ color: 'var(--text-secondary)' }}>{url.pingResult.responseTime} ms</span>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{getPingTimeAgo(url.pingResult.checkedAt)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        {/* Copy — CHANGED: now passes url object so Dashboard can check if protected */}
        <div style={{ position: 'relative' }}>
          <motion.button
            className={`icon-btn${copied === url._id ? ' copied' : ''}`}
            whileTap={{ scale: 0.85 }}
            onClick={() => onCopy(link, url._id, url)}
            title="Copy"
          >
            <AnimatePresence mode="wait">
              {copied === url._id
                ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><RiCheckLine /></motion.span>
                : <motion.span key="x" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><RiFileCopyLine /></motion.span>
              }
            </AnimatePresence>
          </motion.button>
          {copied === url._id && (
            <div className="fav-copied-tooltip" style={{ bottom: '130%' }}>Copied!</div>
          )}
        </div>

        {/* Health Ping Button */}
        <button
          className={`icon-btn ping-btn ${isPinging ? 'pinging' : ''}`}
          onClick={handlePing}
          disabled={isPinging}
          title="Ping"
          style={{ position: 'relative' }}
        >
          {isPinging ? (
            <>
              <RiPulseLine className="spin-slow" />
              <div className="radar-ring" />
              <div className="radar-ring" style={{ animationDelay: '0.4s' }} />
              <div className="radar-ring" style={{ animationDelay: '0.8s' }} />
            </>
          ) : (
            <RiPulseLine />
          )}
        </button>

        <button className="icon-btn" onClick={() => onQR(url)} title="QR Code"><RiQrCodeLine /></button>
        <button className="icon-btn" onClick={() => onEdit(url)} title="Edit"><RiEditLine /></button>
        <button className="icon-btn" onClick={() => navigate(`/analytics/${url._id}`)} title="Analytics"><RiBarChartLine /></button>
        <button className="icon-btn danger" onClick={() => onDelete(url)} title="Delete"><RiDeleteBin6Line /></button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   CREATE FORM
───────────────────────────────────────── */
function CreateForm({ onCreated, showToast }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ originalUrl: '', alias: '', expiresAt: '', isPublic: false });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/url', {
        originalUrl: form.originalUrl,
        alias: form.alias.trim() || undefined,
        expiresAt: form.expiresAt || undefined,
        isPublic: form.isPublic,
      });
      onCreated(data);
      setForm({ originalUrl: '', alias: '', expiresAt: '', isPublic: false });
      showToast('Link created!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create', 'error');
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      className="form-panel"
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="form-title">⚡ New Link</div>
      <form onSubmit={handleCreate}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Destination URL *</label>
            <input required className="snip-input" value={form.originalUrl}
              onChange={e => setForm({ ...form, originalUrl: e.target.value })}
              placeholder="https://your-very-long-url.com/goes/here" />
          </div>
          <div>
            <label className="input-label">Custom Alias <span style={{ color: 'var(--text3)', textTransform: 'none' }}>(opt.)</span></label>
            <div className="input-prefix">
              <span className="prefix-tag">{BASE.replace(/^https?:\/\//, '')}/</span>
              <input className="snip-input" value={form.alias}
                onChange={e => setForm({ ...form, alias: e.target.value })}
                placeholder="my-link" />
            </div>
          </div>
          <div>
            <label className="input-label">Expiry <span style={{ color: 'var(--text3)', textTransform: 'none' }}>(opt.)</span></label>
            <input type="datetime-local" className="snip-input" value={form.expiresAt}
              onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <label className="toggle-row" onClick={() => setForm({ ...form, isPublic: !form.isPublic })}>
            <div className="toggle-track" style={{ background: form.isPublic ? 'var(--violet)' : 'rgba(255,255,255,0.1)' }}>
              <div className="toggle-thumb" style={{ transform: form.isPublic ? 'translateX(18px)' : 'translateX(0)' }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Public stats</span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary">
            <RiFlashlightLine /> {loading ? 'Creating…' : 'Shorten'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   FUTURISTIC METRICS PANEL
───────────────────────────────────────── */
function FuturisticMetricsPanel({ totalClicks, urlsCount, activeLinks, publicLinks, isPingingAll, handlePingAll, pingProgress }) {
  const activePercent = urlsCount > 0 ? (activeLinks / urlsCount) * 100 : 0;
  const publicPercent = urlsCount > 0 ? (publicLinks / urlsCount) * 100 : 0;
  const privateLinks = urlsCount - publicLinks;

  return (
    <div className="metrics-panel-container">
      {/* Click Engagement Wheel */}
      <motion.div
        className="metric-card"
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="metric-header">
          <span className="metric-label">Engagement Wheel</span>
          <RiBarChartLine className="metric-icon" style={{ color: 'var(--cyan)' }} />
        </div>
        <div className="metric-body-circle">
          <div className="svg-circle-wrap">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="circle-bg" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                className="circle-progress click-ring"
                initial={{ strokeDasharray: '251.2', strokeDashoffset: '251.2' }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(totalClicks, 10000)) / 10000 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="circle-inner-val">
              <span className="circle-num">{totalClicks.toLocaleString()}</span>
              <span className="circle-lbl">CLICKS</span>
            </div>
          </div>
        </div>
        <div className="metric-footer">
          <span>Target: 10K clicks</span>
        </div>
      </motion.div>

      {/* Link Health Ring */}
      <motion.div
        className="metric-card"
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="metric-header">
          <span className="metric-label">Link Health</span>
          <RiShieldLine className="metric-icon" style={{ color: 'var(--emerald)' }} />
        </div>
        <div className="metric-body-circle">
          <div className="svg-circle-wrap">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="circle-bg" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                className="circle-progress health-ring"
                initial={{ strokeDasharray: '251.2', strokeDashoffset: '251.2' }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * activePercent) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="circle-inner-val">
              <span className="circle-num">{activeLinks}<span className="circle-slash">/</span>{urlsCount}</span>
              <span className="circle-lbl">ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="metric-footer">
          <span>{activePercent.toFixed(0)}% live links</span>
        </div>
      </motion.div>

      {/* Visibility Split Gauge */}
      <motion.div
        className="metric-card"
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="metric-header">
          <span className="metric-label">Accessibility</span>
          <RiGlobalLine className="metric-icon" style={{ color: 'var(--amber)' }} />
        </div>
        <div className="metric-body-slider">
          <div className="slider-stats">
            <div className="slider-stat-col">
              <span className="slider-val">{privateLinks}</span>
              <span className="slider-lbl">Private</span>
            </div>
            <div className="slider-stat-col text-right">
              <span className="slider-val">{publicLinks}</span>
              <span className="slider-lbl">Public</span>
            </div>
          </div>
          <div className="slider-track-wrap">
            <div className="slider-track-bg" />
            <motion.div
              className="slider-track-fill"
              initial={{ width: 0 }}
              animate={{ width: `${publicPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <motion.div
              className="slider-thumb-glow"
              initial={{ left: 0 }}
              animate={{ left: `${publicPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="slider-footer-label">
            <span>{publicPercent.toFixed(0)}% Publicly Shared</span>
          </div>
        </div>
      </motion.div>

      {/* System Telemetry & Quick Ping */}
      <motion.div
        className="metric-card"
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="metric-header">
          <span className="metric-label">System Telemetry</span>
          <RiPulseLine className="metric-icon pulsing-heart" style={{ color: 'var(--violet-l)' }} />
        </div>
        <div className="metric-body-telemetry">
          <div className="telemetry-wave-container">
            <svg viewBox="0 0 120 40" className="telemetry-wave">
              <path
                d="M0,20 Q15,5 30,20 T60,20 T90,20 T120,20"
                fill="none"
                stroke="rgba(232, 160, 173, 0.2)"
                strokeWidth="2"
              />
              <motion.path
                d="M0,20 Q15,5 30,20 T60,20 T90,20 T120,20"
                fill="none"
                stroke="var(--violet)"
                strokeWidth="2"
                strokeDasharray="120"
                initial={{ strokeDashoffset: 120 }}
                animate={{ strokeDashoffset: [120, 0, -120] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
          </div>
          <div className="telemetry-ping-box">
            <button
              className="btn-ping-launch"
              onClick={handlePingAll}
              disabled={isPingingAll || urlsCount === 0}
            >
              {isPingingAll ? (
                <>
                  <RiPulseLine className="spin-slow" style={{ animation: 'spin-slow 2s linear infinite' }} />
                  <span>Checking {pingProgress.current}/{pingProgress.total}</span>
                </>
              ) : (
                <>
                  <RiPulseLine />
                  <span>Ping All Links</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="metric-footer">
          <span>Active check state</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD (main)
───────────────────────────────────────── */
export default function Dashboard() {
  const { urls, fetching, fetchUrls, addNewUrl, updateUrl, deleteUrlState, toggleFavourite, pingUrl } = useUrls();
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteUrl, setDeleteUrl] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isPingingAll, setIsPingingAll] = useState(false);
  const [pingProgress, setPingProgress] = useState({ current: 0, total: 0 });

  // ← NEW: state for ping-to-top tracking
  const [pinnedByPing, setPinnedByPing] = useState(new Set());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Mouse Parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 35;
      const y = (clientY - window.innerHeight / 2) / 35;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
    showToast('Copied!');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/url/${id}`);
      deleteUrlState(id);
      showToast('Deleted');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleSaveEdit = (updated) => {
    updateUrl(updated);
    showToast('Updated!');
  };

  const handlePingAll = async () => {
    if (urls.length === 0 || isPingingAll) return;
    setIsPingingAll(true);
    setPingProgress({ current: 0, total: urls.length });
    let count = 0;
    for (const url of urls) {
      try {
        await pingUrl(url._id);
        // ← NEW: mark each url as pinged-to-top during ping-all too
        setPinnedByPing(prev => new Set([...prev, url._id]));
      } catch (err) {
        console.error('Failed to ping link', url._id, err);
      }
      count++;
      setPingProgress({ current: count, total: urls.length });
    }
    setIsPingingAll(false);
    showToast('All URLs checked!');
  };

  const totalClicks = urls ? urls.reduce((s, u) => s + u.clickCount, 0) : 0;
  const activeLinks = urls ? urls.filter(u => !u.expiresAt || new Date() < new Date(u.expiresAt)).length : 0;
  const publicLinks = urls ? urls.filter(u => u.isPublic).length : 0;

  // ← CHANGED: sort order — pinged first, then favourites, then newest
  const sortedUrls = urls
    ? [...urls].sort((a, b) => {
        if (pinnedByPing.has(a._id) && !pinnedByPing.has(b._id)) return -1;
        if (!pinnedByPing.has(a._id) && pinnedByPing.has(b._id)) return 1;
        if (a.isFavourite && !b.isFavourite) return -1;
        if (!a.isFavourite && b.isFavourite) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    : [];

  const filteredUrls = sortedUrls.filter(url => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' ||
      url.originalUrl.toLowerCase().includes(query) ||
      (url.alias && url.alias.toLowerCase().includes(query)) ||
      url.shortCode.toLowerCase().includes(query);

    let matchesFilter = true;
    const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
    if (activeFilter === 'favourites') {
      matchesFilter = url.isFavourite;
    } else if (activeFilter === 'active') {
      matchesFilter = !isExpired;
    } else if (activeFilter === 'public') {
      matchesFilter = url.isPublic;
    } else if (activeFilter === 'expired') {
      matchesFilter = isExpired;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* Interactive Parallax Blobs */}
      <motion.div className="parallax-blob blob-violet" style={{ x: mouseX, y: mouseY }} />
      <motion.div className="parallax-blob blob-cyan" style={{ x: useTransform(mouseX, x => -x * 1.2), y: useTransform(mouseY, y => -y * 1.2) }} />
      <motion.div className="parallax-blob blob-amber" style={{ x: useTransform(mouseX, x => x * 0.8), y: useTransform(mouseY, y => -y * 0.8) }} />

      <Navbar />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <AnimatePresence>
        {qrUrl && <QRModal url={qrUrl} onClose={() => setQrUrl(null)} />}
        {editUrl && <EditModal url={editUrl} onClose={() => setEditUrl(null)} onSave={handleSaveEdit} showToast={showToast} />}
        {deleteUrl && <DeleteModal url={deleteUrl} onClose={() => setDeleteUrl(null)} onConfirm={handleDelete} />}
        {showBulk && <BulkModal onClose={() => setShowBulk(false)} onDone={fetchUrls} showToast={showToast} />}
      </AnimatePresence>

      <div className="dash-wrap">

        {/* Hero header */}
        <motion.div className="dash-hero" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <div className="dash-title">Dashboard</div>
            <div className="dash-sub">Welcome back, <span>{user?.name}</span></div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button className="btn-ghost" onClick={() => setShowBulk(true)}>
              <RiUploadCloud2Line /> Bulk CSV
            </button>
            <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
              <RiAddLine /> New Link
            </button>
          </div>
        </motion.div>

        {/* Futuristic Metrics Hub */}
        <FuturisticMetricsPanel
          totalClicks={totalClicks}
          urlsCount={urls.length}
          activeLinks={activeLinks}
          publicLinks={publicLinks}
          isPingingAll={isPingingAll}
          handlePingAll={handlePingAll}
          pingProgress={pingProgress}
        />

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <CreateForm
              onCreated={(data) => { addNewUrl(data); setShowForm(false); }}
              showToast={showToast}
            />
          )}
        </AnimatePresence>

        {/* URL List */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div className="list-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span className="list-title">Your Links</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {urls.length > 0 && (
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handlePingAll} disabled={isPingingAll}>
                    {isPingingAll ? 'Pinging...' : 'Ping All'}
                  </button>
                )}
                <span className="pill pill-violet">{urls.length} links</span>
              </div>
            </div>
            {isPingingAll && (
              <div style={{ width: '100%', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <span>Pinging all links...</span>
                  <span>{pingProgress.current} / {pingProgress.total}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(pingProgress.current / pingProgress.total) * 100}%`, height: '100%', background: 'var(--cyan)', transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
              </div>
            )}
          </div>

          {fetching ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg1)' }}>
                  <div className="skel" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="skel" style={{ height: 12, width: '40%' }} />
                    <div className="skel" style={{ height: 10, width: '65%' }} />
                  </div>
                  <div className="skel" style={{ width: 120, height: 32, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : urls.length === 0 ? (
            <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="empty-glyph">🔗</div>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>No links yet</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>Create your first short link to get started</div>
              <button className="btn-primary" onClick={() => setShowForm(true)}><RiAddLine /> Create First Link</button>
            </motion.div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="search-filter-container">
                <div className="search-box">
                  <RiSearchLine className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by URL, alias or short code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button className="search-clear" onClick={() => setSearchQuery('')}>
                      <RiCloseLine />
                    </button>
                  )}
                </div>
                
                <div className="filter-pills">
                  {['all', 'favourites', 'active', 'public', 'expired'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredUrls.length === 0 ? (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '3rem 1.5rem' }}>
                  <div className="empty-glyph" style={{ fontSize: '2.5rem' }}>🔍</div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>No matching links found</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>Try modifying your search query or switching filters</div>
                  <button className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>Reset Search & Filters</button>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <AnimatePresence mode="popLayout">
                    {filteredUrls.map((url, idx) => (
                      <UrlCard
                        key={url._id}
                        url={url}
                        copied={copied}
                        onCopy={handleCopy}
                        onDelete={setDeleteUrl}
                        onQR={setQrUrl}
                        onEdit={setEditUrl}
                        navigate={navigate}
                        index={idx}
                        toggleFavourite={toggleFavourite}
                        pingUrl={pingUrl}
                        onPinned={(id) => setPinnedByPing(prev => new Set([...prev, id]))}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}