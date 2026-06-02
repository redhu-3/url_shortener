import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  RiLinkM, RiBarChartLine, RiDeleteBin6Line, RiFileCopyLine,
  RiCheckLine, RiAddLine, RiQrCodeLine, RiDownloadLine,
  RiEditLine, RiCloseLine, RiUploadCloud2Line, RiExternalLinkLine,
  RiTimeLine, RiGlobalLine, RiShieldLine,
  RiFlashlightLine, RiArrowRightLine, RiMenuLine,
} from 'react-icons/ri';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const shortUrl = (url) => `${BASE}/${url.alias || url.shortCode}`;
const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const truncate = (s, n = 50) => s?.length > n ? s.slice(0, n) + '…' : s;
import './Dashboard.css';

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */


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

      // Draw white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 1024, 1024);

      // Draw QR code image with padding
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
      const { data } = await api.put(`/api/url/${url._id}`, {
        originalUrl: form.originalUrl,
        alias: form.alias.trim() || null,
        expiresAt: form.expiresAt || null,
        isPublic: form.isPublic,
      });
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
    } catch {
      return false;
    }
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

          if (!originalUrl) {
            status = 'invalid';
            errorMsg = 'URL is empty';
          } else if (!isValidUrlStr(originalUrl)) {
            status = 'invalid';
            errorMsg = 'Invalid URL format';
          } else if (seenUrls.has(originalUrl)) {
            status = 'duplicate';
            errorMsg = 'Duplicate URL in CSV';
          } else if (alias && seenAliases.has(alias)) {
            status = 'duplicate';
            errorMsg = 'Duplicate Alias in CSV';
          }

          if (originalUrl && status === 'valid') {
            seenUrls.add(originalUrl);
          }
          if (alias && status === 'valid') {
            seenAliases.add(alias);
          }

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
    } finally {
      setLoading(false);
    }
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
                          <td style={{ padding: '0.5rem 0.75rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-m)' }} title={r.originalUrl}>
                            {r.originalUrl}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', color: 'var(--violet-l)', fontFamily: 'var(--font-m)' }}>
                            {r.alias ? `/${r.alias}` : '-'}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            {r.status === 'valid' ? (
                              <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>Valid</span>
                            ) : (
                              <span className="badge badge-violet" style={{ fontSize: '0.6rem', color: 'var(--rose)', borderColor: 'rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)' }} title={r.errorMsg}>
                                {r.errorMsg}
                              </span>
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

/* ─────────────────────────────────────────
   URL CARD
───────────────────────────────────────── */
function UrlCard({ url, onCopy, onDelete, onQR, onEdit, navigate, copied }) {
  const link = shortUrl(url);
  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
  const isSoon = url.expiresAt && !isExpired && (new Date(url.expiresAt) - Date.now()) < 864e5 * 3;

  return (
    <motion.div
      className="url-item"
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      <div className="url-icon"><RiLinkM /></div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.1rem' }}>
          <a className="url-shortcode" href={link} target="_blank" rel="noopener noreferrer">
            {link.replace(/^https?:\/\//, '')}
          </a>
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
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <motion.button
          className={`icon-btn${copied === url._id ? ' copied' : ''}`}
          whileTap={{ scale: 0.85 }}
          onClick={() => onCopy(link, url._id)}
          title="Copy"
        >
          <AnimatePresence mode="wait">
            {copied === url._id
              ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><RiCheckLine /></motion.span>
              : <motion.span key="x" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><RiFileCopyLine /></motion.span>
            }
          </AnimatePresence>
        </motion.button>
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
   DASHBOARD (main)
───────────────────────────────────────── */
export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteUrl, setDeleteUrl] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchUrls = useCallback(async () => {
    try {
      const { data } = await api.get('/api/url/user');
      setUrls(data);
    } catch { showToast('Failed to load URLs', 'error'); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    showToast('Copied!');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/url/${id}`);
      setUrls(prev => prev.filter(u => u._id !== id));
      showToast('Deleted');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleSaveEdit = (updated) => {
    setUrls(prev => prev.map(u => u._id === updated._id ? updated : u));
    showToast('Updated!');
  };

  const totalClicks = urls.reduce((s, u) => s + u.clickCount, 0);
  const activeLinks = urls.filter(u => !u.expiresAt || new Date() < new Date(u.expiresAt)).length;
  const publicLinks = urls.filter(u => u.isPublic).length;

  return (
    <>
      {/* ambient blobs */}
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

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

        {/* Stats ribbon */}
        <div className="stats-ribbon">
          <StatCell label="Total Links"   value={urls.length}                    icon={<RiLinkM />}        color="var(--violet-l)" />
          <StatCell label="Total Clicks"  value={totalClicks.toLocaleString()}   icon={<RiBarChartLine />} color="var(--cyan)"     />
          <StatCell label="Active"        value={activeLinks}                    icon={<RiShieldLine />}   color="var(--emerald)"  />
          <StatCell label="Public"        value={publicLinks}                    icon={<RiGlobalLine />}   color="var(--amber)"    />
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <CreateForm
              onCreated={(data) => { setUrls(prev => [data, ...prev]); setShowForm(false); }}
              showToast={showToast}
            />
          )}
        </AnimatePresence>

        {/* URL List */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div className="list-header">
            <span className="list-title">Your Links</span>
            <span className="pill pill-violet">{urls.length} links</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <AnimatePresence mode="popLayout">
                {urls.map(url => (
                  <UrlCard key={url._id} url={url} copied={copied}
                    onCopy={handleCopy} onDelete={setDeleteUrl}
                    onQR={setQrUrl} onEdit={setEditUrl} navigate={navigate}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
