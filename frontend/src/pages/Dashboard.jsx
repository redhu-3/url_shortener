// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import Navbar from '../components/Navbar';
// import Toast from '../components/Toast';

// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// export default function Dashboard() {
//   const [urls, setUrls] = useState([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [toast, setToast] = useState(null);
//   const navigate = useNavigate();

//   const showToast = (message, type = 'success') => setToast({ message, type });

//   const fetchUrls = useCallback(async () => {
//     try {
//       const { data } = await api.get('/api/url/user');
//       setUrls(data);
//     } catch {
//       showToast('Failed to load URLs', 'error');
//     } finally {
//       setFetching(false);
//     }
//   }, []);

//   useEffect(() => { fetchUrls(); }, [fetchUrls]);

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/url', { originalUrl: input });
//       setUrls([data, ...urls]);
//       setInput('');
//       showToast('Short URL created!');
//     } catch (err) {
//       showToast(err.response?.data?.message || 'Failed to create URL', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this URL and all its analytics?')) return;
//     try {
//       await api.delete(`/api/url/${id}`);
//       setUrls(urls.filter((u) => u._id !== id));
//       showToast('URL deleted');
//     } catch {
//       showToast('Failed to delete', 'error');
//     }
//   };

//   const handleCopy = (shortCode) => {
//     navigator.clipboard.writeText(`${BASE_URL}/${shortCode}`);
//     showToast('Copied to clipboard!');
//   };

//   const truncate = (str, n = 45) => str.length > n ? str.slice(0, n) + '…' : str;

//   return (
//     <div className="min-h-screen bg-zinc-950">
//       <Navbar />
//       {toast && <Toast {...toast} onClose={() => setToast(null)} />}

//       <div className="max-w-4xl mx-auto px-4 py-10">
//         {/* Create form */}
//         <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
//           <h2 className="text-white font-semibold text-lg mb-4">Shorten a URL</h2>
//           <form onSubmit={handleCreate} className="flex gap-3">
//             <input
//               type="url" value={input} onChange={(e) => setInput(e.target.value)}
//               placeholder="https://your-long-url.com/goes/here"
//               required
//               className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
//             />
//             <button
//               type="submit" disabled={loading}
//               className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
//             >
//               {loading ? 'Creating…' : '⚡ Shorten'}
//             </button>
//           </form>
//         </div>

//         {/* URL List */}
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-white font-semibold text-lg">Your Links</h2>
//             <span className="text-zinc-500 text-sm">{urls.length} links</span>
//           </div>

//           {fetching ? (
//             <div className="text-center py-20 text-zinc-500">Loading…</div>
//           ) : urls.length === 0 ? (
//             <div className="text-center py-20 text-zinc-500">
//               <p className="text-4xl mb-3">🔗</p>
//               <p>No links yet. Create your first one above!</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {urls.map((url) => (
//                 <div key={url._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-violet-400 font-mono font-semibold text-sm">
//                         {BASE_URL}/{url.shortCode}
//                       </span>
//                       <span className="text-zinc-600 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">
//                         {url.clickCount} clicks
//                       </span>
//                     </div>
//                     <p className="text-zinc-500 text-xs truncate">{truncate(url.originalUrl)}</p>
//                     <p className="text-zinc-600 text-xs mt-0.5">
//                       {new Date(url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2 shrink-0">
//                     <button
//                       onClick={() => handleCopy(url.shortCode)}
//                       className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
//                     >
//                       Copy
//                     </button>
//                     <button
//                       onClick={() => navigate(`/analytics/${url._id}`)}
//                       className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
//                     >
//                       Analytics
//                     </button>
//                     <button
//                       onClick={() => handleDelete(url._id)}
//                       className="text-xs bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiLinkM, RiBarChartLine, RiDeleteBin6Line, RiFileCopyLine,
  RiCheckLine, RiAddLine, RiQrCodeLine, RiDownloadLine,
  RiEditLine, RiCloseLine, RiUploadCloud2Line, RiExternalLinkLine,
  RiTimeLine, RiEyeLine, RiGlobalLine, RiShieldLine,
} from 'react-icons/ri';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── helpers ── */
const shortUrl = (url) => `${BASE}/${url.alias || url.shortCode}`;
const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const truncate = (s, n = 50) => s?.length > n ? s.slice(0, n) + '…' : s;

/* ── Skeleton ── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
    <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-3 w-48 rounded" />
      <div className="skeleton h-3 w-72 rounded" />
    </div>
    <div className="skeleton h-8 w-24 rounded-xl" />
  </div>
);

/* ── QR Modal ── */
function QRModal({ url, onClose }) {
  const ref = useRef();
  const link = shortUrl(url);

  const download = () => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${url.alias || url.shortCode}.svg`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-8 max-w-sm w-full text-center"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>QR Code</h3>
          <button onClick={onClose} className="btn btn-secondary p-2 rounded-xl text-sm"><RiCloseLine /></button>
        </div>
        <div ref={ref} className="flex justify-center mb-4 p-4 bg-white rounded-2xl">
          <QRCodeSVG value={link} size={200} level="H"
            imageSettings={{ src: '', width: 0, height: 0 }}
            fgColor="#0a0a0f"
          />
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{link}</p>
        <button onClick={download} className="btn btn-primary w-full gap-2">
          <RiDownloadLine /> Download SVG
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── Edit Modal ── */
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
        alias: form.alias.trim() || null,
        expiresAt: form.expiresAt || null,
        isPublic: form.isPublic,
      };
      const { data } = await api.put(`/api/url/${url._id}`, payload);
      onSave(data);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-8 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Edit Link</h3>
          <button onClick={onClose} className="btn btn-secondary p-2 rounded-xl"><RiCloseLine /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Destination URL</label>
            <input className="input-field" value={form.originalUrl} onChange={(e) => setForm({ ...form, originalUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Custom Alias <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <div className="flex items-center gap-0">
              <span className="input-field rounded-r-none border-r-0 w-auto px-3 text-xs shrink-0" style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>{BASE}/</span>
              <input className="input-field rounded-l-none flex-1" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="my-link" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Expiry Date <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <input type="datetime-local" className="input-field" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
              <div className="w-10 h-5 rounded-full transition-colors" style={{ background: form.isPublic ? 'var(--violet-400)' : 'var(--surface-3)' }} />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: form.isPublic ? 'translateX(20px)' : 'translateX(0)' }} />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-primary)' }}>Public stats page</span> — anyone can view analytics
            </span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn btn-primary flex-1">
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Delete Modal ── */
function DeleteModal({ url, onClose, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-8 max-w-sm w-full text-center"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.25)' }}>
          <RiDeleteBin6Line className="text-2xl" style={{ color: 'var(--rose-400)' }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Delete this link?</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-mono" style={{ color: 'var(--violet-200)' }}>{url.alias || url.shortCode}</span> and all its analytics will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={() => { onConfirm(url._id); onClose(); }} className="btn btn-danger flex-1">Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Bulk Upload Modal ── */
function BulkModal({ onClose, onDone, showToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data.map((r) => ({
          originalUrl: r.url || r.originalUrl || r.URL || '',
          alias: r.alias || r.Alias || '',
          expiresAt: r.expiresAt || r.expires || '',
        })).filter((r) => r.originalUrl));
      },
    });
  };

  const handleSubmit = async () => {
    if (!rows.length) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/url/bulk', { urls: rows });
      setResults(data);
      onDone();
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-8 max-w-xl w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Bulk URL Shortening</h3>
          <button onClick={onClose} className="btn btn-secondary p-2 rounded-xl"><RiCloseLine /></button>
        </div>

        {!results ? (
          <>
            <div
              className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4"
              style={{ borderColor: 'var(--border-normal)' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); fileRef.current.files = e.dataTransfer.files; handleFile({ target: { files: e.dataTransfer.files } }); }}
            >
              <RiUploadCloud2Line className="text-4xl mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold mb-1">Drop CSV file here or click to browse</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                CSV columns: <span className="font-mono">url</span>, <span className="font-mono">alias</span> (optional), <span className="font-mono">expiresAt</span> (optional)
              </p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </div>

            {rows.length > 0 && (
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{rows.length} URLs ready to shorten</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {rows.slice(0, 5).map((r, i) => (
                    <div key={i} className="text-xs font-mono p-2 rounded-lg" style={{ background: 'var(--surface-glass)', color: 'var(--text-secondary)' }}>
                      {truncate(r.originalUrl, 60)} {r.alias && <span style={{ color: 'var(--violet-200)' }}>→ /{r.alias}</span>}
                    </div>
                  ))}
                  {rows.length > 5 && <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>+{rows.length - 5} more</p>}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleSubmit} disabled={loading || !rows.length} className="btn btn-primary flex-1">
                {loading ? 'Processing…' : `Shorten ${rows.length} URLs`}
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4 p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <RiCheckLine className="text-xl" style={{ color: 'var(--emerald-400)' }} />
              <div>
                <p className="font-semibold">{results.created} of {results.results.length} links created</p>
                {results.results.length - results.created > 0 && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{results.results.length - results.created} failed</p>
                )}
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1 mb-4">
              {results.results.map((r, i) => (
                <div key={i} className="text-xs p-2 rounded-lg flex items-center justify-between gap-2" style={{ background: r.error ? 'rgba(251,113,133,0.08)' : 'var(--surface-glass)' }}>
                  <span className="font-mono truncate" style={{ color: r.error ? 'var(--rose-400)' : 'var(--text-secondary)' }}>{truncate(r.originalUrl, 45)}</span>
                  {r.error ? <span style={{ color: 'var(--rose-400)' }}>{r.error}</span> : <span className="font-mono shrink-0" style={{ color: 'var(--violet-200)' }}>/{r.alias || r.shortCode}</span>}
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn btn-primary w-full">Done</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── URL Card ── */
function UrlCard({ url, onCopy, onDelete, onQR, onEdit, navigate, copied }) {
  const link = shortUrl(url);
  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
  const isExpiringSoon = url.expiresAt && !isExpired && (new Date(url.expiresAt) - new Date()) < 1000 * 60 * 60 * 24 * 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="url-row p-4 flex items-center gap-4"
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <RiLinkM style={{ color: 'var(--violet-300)', fontSize: '1.1rem' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="font-mono font-semibold text-sm transition-colors hover:underline"
            style={{ color: 'var(--violet-200)' }}
          >
            {link.replace(/^https?:\/\//, '')}
          </a>
          {url.alias && <span className="badge badge-violet">alias</span>}
          {url.isPublic && <span className="badge badge-cyan"><RiGlobalLine className="text-xs" /> public</span>}
          {isExpired && <span className="badge" style={{ background: 'rgba(251,113,133,0.12)', color: 'var(--rose-400)', border: '1px solid rgba(251,113,133,0.25)' }}>expired</span>}
          {isExpiringSoon && !isExpired && <span className="badge badge-amber"><RiTimeLine className="text-xs" /> expires soon</span>}
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{truncate(url.originalUrl, 60)}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(url.createdAt)}</span>
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <RiBarChartLine className="text-xs" /> {url.clickCount.toLocaleString()} clicks
          </span>
          {url.expiresAt && !isExpired && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--amber-400)' }}>
              <RiTimeLine className="text-xs" /> expires {fmt(url.expiresAt)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onCopy(link, url._id)}
          className="btn btn-secondary px-3 py-2 text-xs gap-1.5 rounded-xl"
          title="Copy"
        >
          <AnimatePresence mode="wait">
            {copied === url._id
              ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><RiCheckLine style={{ color: 'var(--emerald-400)' }} /></motion.span>
              : <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><RiFileCopyLine /></motion.span>
            }
          </AnimatePresence>
          {copied === url._id ? 'Copied!' : 'Copy'}
        </motion.button>

        <button onClick={() => onQR(url)} className="btn btn-secondary px-3 py-2 text-xs rounded-xl" title="QR Code">
          <RiQrCodeLine />
        </button>
        <button onClick={() => onEdit(url)} className="btn btn-secondary px-3 py-2 text-xs rounded-xl" title="Edit">
          <RiEditLine />
        </button>
        <button onClick={() => navigate(`/analytics/${url._id}`)} className="btn btn-secondary px-3 py-2 text-xs rounded-xl" title="Analytics">
          <RiBarChartLine />
        </button>
        {url.isPublic && (
          <a href={`/stats/${url.alias || url.shortCode}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary px-3 py-2 text-xs rounded-xl" title="Public stats">
            <RiEyeLine />
          </a>
        )}
        <button onClick={() => onDelete(url)} className="btn btn-danger px-3 py-2 text-xs rounded-xl" title="Delete">
          <RiDeleteBin6Line />
        </button>
      </div>
    </motion.div>
  );
}

/* ══ DASHBOARD ══ */
export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteUrl, setDeleteUrl] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ originalUrl: '', alias: '', expiresAt: '', isPublic: false });
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        alias: form.alias.trim() || undefined,
        expiresAt: form.expiresAt || undefined,
        isPublic: form.isPublic,
      };
      const { data } = await api.post('/api/url', payload);
      setUrls([data, ...urls]);
      setForm({ originalUrl: '', alias: '', expiresAt: '', isPublic: false });
      setShowForm(false);
      showToast('Link created!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create', 'error');
    } finally { setLoading(false); }
  };

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    showToast('Copied to clipboard!');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/url/${id}`);
      setUrls((prev) => prev.filter((u) => u._id !== id));
      showToast('Link deleted');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleSaveEdit = (updated) => {
    setUrls((prev) => prev.map((u) => u._id === updated._id ? updated : u));
    showToast('Link updated!');
  };

  // Stats
  const totalClicks = urls.reduce((s, u) => s + u.clickCount, 0);
  const activeLinks = urls.filter((u) => !u.expiresAt || new Date() < new Date(u.expiresAt)).length;
  const publicLinks = urls.filter((u) => u.isPublic).length;

  return (
    <div className="noise" style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <AnimatePresence>
        {qrUrl && <QRModal url={qrUrl} onClose={() => setQrUrl(null)} />}
        {editUrl && <EditModal url={editUrl} onClose={() => setEditUrl(null)} onSave={handleSaveEdit} showToast={showToast} />}
        {deleteUrl && <DeleteModal url={deleteUrl} onClose={() => setDeleteUrl(null)} onConfirm={handleDelete} />}
        {showBulk && <BulkModal onClose={() => setShowBulk(false)} onDone={fetchUrls} showToast={showToast} />}
      </AnimatePresence>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.2rem' }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Welcome back, <span style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBulk(true)} className="btn btn-secondary gap-2 text-sm px-4 py-2.5">
              <RiUploadCloud2Line /> Bulk Upload
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary gap-2 text-sm px-4 py-2.5"
            >
              <RiAddLine /> New Link
            </motion.button>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Links', val: urls.length, icon: <RiLinkM />, color: 'var(--violet-300)' },
            { label: 'Total Clicks', val: totalClicks.toLocaleString(), icon: <RiBarChartLine />, color: 'var(--cyan-400)' },
            { label: 'Active Links', val: activeLinks, icon: <RiShieldLine />, color: 'var(--emerald-400)' },
            { label: 'Public Pages', val: publicLinks, icon: <RiGlobalLine />, color: 'var(--amber-400)' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ color: s.color, fontSize: '1.1rem' }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.val}</div>
            </motion.div>
          ))}
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6 mb-6 overflow-hidden"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Create New Link</h3>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Destination URL *</label>
                    <input required className="input-field" value={form.originalUrl} onChange={(e) => setForm({ ...form, originalUrl: e.target.value })} placeholder="https://your-long-url.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Custom Alias <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                    <div className="flex">
                      <span className="input-field rounded-r-none border-r-0 px-3 w-auto text-xs shrink-0 flex items-center" style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                        {BASE.replace(/^https?:\/\//, '')}/
                      </span>
                      <input className="input-field rounded-l-none flex-1" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="my-link" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Expiry Date <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                    <input type="datetime-local" className="input-field" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-violet-500" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Make stats public</span>
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary px-4 py-2 text-sm">Cancel</button>
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn btn-primary px-6 py-2 text-sm">
                      {loading ? 'Creating…' : '⚡ Create'}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* URL List */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>Your Links</h2>
            <span className="badge badge-violet">{urls.length} links</span>
          </div>

          {fetching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : urls.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <RiLinkM className="text-3xl" style={{ color: 'var(--violet-300)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No links yet</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Create your first short link to get started</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2">
                <RiAddLine /> Create First Link
              </button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {urls.map((url) => (
                  <UrlCard
                    key={url._id}
                    url={url}
                    copied={copied}
                    onCopy={handleCopy}
                    onDelete={setDeleteUrl}
                    onQR={setQrUrl}
                    onEdit={setEditUrl}
                    navigate={navigate}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}