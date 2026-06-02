import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import {
  RiArrowLeftLine, RiBarChartLine, RiGlobalLine, RiSmartphoneLine,
  RiComputerLine, RiTimeLine, RiFileCopyLine, RiCheckLine,
  RiFireLine, RiCalendarLine, RiBrainLine, RiShareLine
} from 'react-icons/ri';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './PublicStats.css';

Chart.register(...registerables);

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Skeleton ── */
const Sk = ({ className }) => <div className={`skeleton ${className}`} />;

/* ── Donut Chart ── */
function DonutChart({ data, colors }) {
  const ref = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    if (!data?.length || !ref.current) return;
    if (inst.current) inst.current.destroy();
    const total = data.reduce((s, d) => s + d.count, 0);
    inst.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.name),
        datasets: [{
          data: data.map((d) => d.count),
          backgroundColor: colors,
          borderColor: '#111118',
          borderWidth: 3,
          hoverBorderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / total * 100)}%)`,
            },
            backgroundColor: '#1a1a26',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#f0f0f8',
            bodyColor: '#9898b8',
          },
        },
      },
    });
    return () => inst.current?.destroy();
  }, [data, colors]);

  if (!data?.length) return <p className="text-center text-xs py-6" style={{ color: 'var(--text-muted)' }}>No data yet</p>;

  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="donut-chart-wrap-public">
      <div style={{ width: 100, height: 100, flexShrink: 0 }}>
        <canvas ref={ref} />
      </div>
      <div className="donut-legend-public">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="donut-legend-item-public">
            <div className="donut-legend-dot-public" style={{ background: colors[i] }} />
            <span className="donut-legend-label-public">{d.name}</span>
            <span className="donut-legend-pct-public">{Math.round(d.count / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Click trend chart ── */
function DailyChart({ chartData }) {
  const ref = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    if (!chartData || !ref.current) return;
    if (inst.current) inst.current.destroy();

    const labels = chartData.labels.map((d) =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    inst.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Clicks',
          data: chartData.data,
          backgroundColor: (ctx) => {
            const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
            grad.addColorStop(0, 'rgba(34,211,238,0.8)');
            grad.addColorStop(1, 'rgba(34,211,238,0.05)');
            return grad;
          },
          borderColor: 'rgba(34,211,238,0.9)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a26',
            borderColor: 'rgba(34,211,238,0.4)',
            borderWidth: 1,
            titleColor: '#f0f0f8',
            bodyColor: '#9898b8',
          },
        },
        scales: {
          x: { ticks: { color: '#4a4a6a', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { ticks: { color: '#4a4a6a', stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true },
        },
      },
    });
    return () => inst.current?.destroy();
  }, [chartData]);

  return <canvas ref={ref} height={70} />;
}

/* ── Timeline row ── */
function TimelineItem({ visit, isLast }) {
  return (
    <div className="timeline-item-public">
      <div className="timeline-track-public">
        <div className="timeline-bullet-public" />
        {!isLast && <div className="timeline-connector-public" />}
      </div>
      <div className="timeline-content-public">
        <div className="timeline-header-public">
          <span className="timeline-time-public">
            {new Date(visit.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="badge badge-violet">{visit.device}</span>
          <span className="badge badge-cyan">{visit.browser}</span>
        </div>
        <div className="timeline-meta-public">
          <span className="timeline-meta-item-public"><RiGlobalLine /> {visit.country} · {visit.city}</span>
          <span>{visit.os}</span>
          {visit.referrer && visit.referrer !== 'Direct' && (
            <span style={{ color: 'var(--violet-l)' }}>via {visit.referrer}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicStats() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get(`/api/url/public/stats/${shortCode}`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Not found or not public'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  const shortLink = data ? `${BASE}/${data.url.alias || data.url.shortCode}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setToast({ message: 'Copied Short URL!', type: 'success' });
  };

  const donut_colors_browser  = ['#8b5cf6','#22d3ee','#34d399','#fbbf24','#fb7185','#a78bfa'];
  const donut_colors_os       = ['#06b6d4','#8b5cf6','#34d399','#fbbf24','#fb7185'];
  const donut_colors_device   = ['#8b5cf6','#22d3ee','#34d399'];
  const donut_colors_country  = ['#34d399','#8b5cf6','#22d3ee','#fbbf24','#fb7185','#a78bfa'];
  const donut_colors_referrer = ['#fb7185','#fbbf24','#34d399','#22d3ee','#8b5cf6','#a78bfa'];

  const maxDay = data ? Math.max(...data.chartData.data) : 0;
  const bestDay = data ? data.chartData.labels[data.chartData.data.indexOf(maxDay)] : null;

  return (
    <div className="landing-wrap">
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ambient blobs */}
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <div className="public-stats-container">
        {/* Back */}
        <button
          onClick={() => navigate('/public-links')}
          className="back-btn-public"
        >
          <RiArrowLeftLine /> Back to Public Links
        </button>

        {loading ? (
          <div className="space-y-6">
            <Sk className="h-28 rounded-2xl" />
            <div className="grid grid-cols-4 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <Sk className="h-24 rounded-2xl" />
              <Sk className="h-24 rounded-2xl" />
              <Sk className="h-24 rounded-2xl" />
              <Sk className="h-24 rounded-2xl" />
            </div>
            <Sk className="h-64 rounded-2xl" />
          </div>
        ) : error ? (
          <div className="glass-card p-10 max-w-sm w-full text-center" style={{ margin: '4rem auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Link not found</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <Link to="/public-links" className="btn btn-primary w-full justify-center">Go to Public Links</Link>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Header info */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="public-info-header">
                <div className="public-info-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-violet">Public Stats</span>
                    <span className="badge badge-cyan"><RiGlobalLine style={{ fontSize: '0.75rem' }} /> Community Link</span>
                  </div>
                  <a href={shortLink} target="_blank" rel="noopener noreferrer" className="public-info-shortlink">
                    {shortLink.replace(/^https?:\/\//, '')}
                  </a>
                  <p className="public-info-originallink">{data.url.originalUrl}</p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <motion.button whileTap={{ scale: 0.93 }} onClick={handleCopy} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'inline-flex', marginRight: '4px' }}><RiCheckLine style={{ color: 'var(--emerald)' }} /></motion.span>
                        : <motion.span key="f" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'inline-flex', marginRight: '4px' }}><RiFileCopyLine /></motion.span>
                      }
                    </AnimatePresence>
                    {copied ? 'Copied!' : 'Copy URL'}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* KPI statistics cards */}
            <div className="public-stats-grid-4">
              {[
                { label: 'Total Clicks', val: data.totalClicks.toLocaleString(), icon: <RiBarChartLine />, color: 'var(--violet-l)' },
                { label: 'Last Visited', val: data.lastVisited ? new Date(data.lastVisited).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never', icon: <RiTimeLine />, color: 'var(--cyan)' },
                { label: 'Created Date', val: new Date(data.url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: <RiCalendarLine />, color: 'var(--emerald)' },
                { label: 'Peak Day Clicks', val: maxDay, icon: <RiFireLine />, color: 'var(--rose)' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
                  <div className="stat-card-label-wrap">
                    <span className="stat-card-title">{s.label}</span>
                    <span style={{ color: s.color, fontSize: '0.9rem', display: 'inline-flex' }}>{s.icon}</span>
                  </div>
                  <div className="stat-card-val" style={{ color: s.color, fontSize: '1.4rem' }}>{s.val}</div>
                </motion.div>
              ))}
            </div>

            {/* click trend chart */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="chart-header-row">
                <h2 style={{ fontFamily: 'var(--font-d)', fontWeight: 750, fontSize: '1.1rem' }}>Clicks Trend — Last 30 Days</h2>
                {bestDay && (
                  <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                    <RiFireLine /> Peak: {new Date(bestDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({maxDay})
                  </span>
                )}
              </div>
              <DailyChart chartData={data.chartData} />
            </div>

            {/* Breakdown statistics */}
            <h2 className="section-subtitle-public">Breakdowns & Analytics</h2>
            <div className="public-breakdown-grid">
              {[
                { title: 'Browsers', key: 'browsers', colors: donut_colors_browser, icon: <RiBrainLine /> },
                { title: 'Operating Systems', key: 'os', colors: donut_colors_os, icon: <RiComputerLine /> },
                { title: 'Devices', key: 'devices', colors: donut_colors_device, icon: <RiSmartphoneLine /> },
                { title: 'Countries', key: 'countries', colors: donut_colors_country, icon: <RiGlobalLine /> },
                { title: 'Referrers', key: 'referrers', colors: donut_colors_referrer, icon: <RiShareLine /> },
              ].map((chart, i) => (
                <motion.div key={chart.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}>{chart.icon}</span>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-d)' }}>{chart.title}</h3>
                  </div>
                  <DonutChart data={data.breakdown[chart.key]} colors={chart.colors} />
                </motion.div>
              ))}
            </div>

            {/* Recent Visit history */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-d)', fontWeight: 750, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recent Visitor History</h2>
              {data.recentVisits.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>No visits recorded yet</p>
              ) : (
                <div className="timeline-wrap">
                  {data.recentVisits.map((v, i) => (
                    <TimelineItem key={v._id} visit={v} isLast={i === data.recentVisits.length - 1} />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center pt-2 pb-6">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Want to shorten your own URLs and track custom stats?</p>
              <Link to="/register" className="btn btn-primary inline-flex" style={{ padding: '0.65rem 1.4rem' }}>
                Create Free Account
              </Link>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}