import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import {
  RiArrowLeftLine, RiBarChartLine, RiGlobalLine, RiSmartphoneLine,
  RiComputerLine, RiTimeLine, RiFileCopyLine, RiCheckLine,
  RiFireLine, RiCalendarLine, RiBrainLine,
} from 'react-icons/ri';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './Analytics.css';

Chart.register(...registerables);

const BASE = import.meta.env.VITE_API_URL || 'https://url-shortener-1-mxet.onrender.com';

/* ── Skeleton ── */
const Sk = ({ className }) => <div className={`skeleton ${className}`} />;

/* ── Donut chart component ── */
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

  if (!data?.length) return <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>No data yet</p>;

  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="donut-chart-wrap">
      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
        <canvas ref={ref} />
      </div>
      <div className="donut-legend">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="donut-legend-item">
            <div className="donut-legend-dot" style={{ background: colors[i] }} />
            <span className="donut-legend-label">{d.name}</span>
            <span className="donut-legend-pct">{Math.round(d.count / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar chart (daily clicks) ── */
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
            grad.addColorStop(0, 'rgba(124,58,237,0.8)');
            grad.addColorStop(1, 'rgba(124,58,237,0.1)');
            return grad;
          },
          borderColor: 'rgba(124,58,237,0.9)',
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
            borderColor: 'rgba(124,58,237,0.4)',
            borderWidth: 1,
            titleColor: '#f0f0f8',
            bodyColor: '#9898b8',
          },
        },
        scales: {
          x: { ticks: { color: '#4a4a6a', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#4a4a6a', stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true },
        },
      },
    });
    return () => inst.current?.destroy();
  }, [chartData]);

  return <canvas ref={ref} height={80} />;
}

/* ── Timeline item ── */
function TimelineItem({ visit, isLast }) {
  return (
    <div className="timeline-item">
      <div className="timeline-track">
        <div className="timeline-bullet" />
        {!isLast && <div className="timeline-connector" />}
      </div>
      <div className="timeline-content">
        <div className="timeline-header">
          <span className="timeline-time">
            {new Date(visit.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="badge badge-violet">{visit.device}</span>
          <span className="badge badge-cyan">{visit.browser}</span>
        </div>
        <div className="timeline-meta">
          <span className="timeline-meta-item"><RiGlobalLine /> {visit.country} · {visit.city}</span>
          <span>{visit.os}</span>
        </div>
      </div>
    </div>
  );
}

/* ══ ANALYTICS PAGE ══ */
export default function Analytics() {
  const { urlId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/api/analytics/${urlId}`)
      .then(({ data }) => setData(data))
      .catch(() => setToast({ message: 'Failed to load analytics', type: 'error' }))
      .finally(() => setLoading(false));
  }, [urlId]);

  const shortLink = data ? `${BASE}/${data.url.alias || data.url.shortCode}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const donut_colors_browser  = ['#8b5cf6','#22d3ee','#34d399','#fbbf24','#fb7185','#a78bfa'];
  const donut_colors_os       = ['#06b6d4','#8b5cf6','#34d399','#fbbf24','#fb7185'];
  const donut_colors_device   = ['#8b5cf6','#22d3ee','#34d399'];
  const donut_colors_country  = ['#34d399','#8b5cf6','#22d3ee','#fbbf24','#fb7185','#a78bfa'];

  const maxDay = data ? Math.max(...data.chartData.data) : 0;
  const bestDay = data ? data.chartData.labels[data.chartData.data.indexOf(maxDay)] : null;

  return (
    <div className="landing-wrap">
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="analytics-container">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="back-btn"
        >
          <RiArrowLeftLine /> Back to Dashboard
        </motion.button>

        {loading ? (
          <div className="space-y-6">
            <Sk className="h-28 rounded-2xl" />
            <div className="grid grid-cols-3 gap-4"><Sk className="h-24 rounded-2xl" /><Sk className="h-24 rounded-2xl" /><Sk className="h-24 rounded-2xl" /></div>
            <Sk className="h-64 rounded-2xl" />
          </div>
        ) : data ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* URL info card */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="url-info-header">
                <div className="url-info-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-violet">Analytics</span>
                    {data.url.isPublic && <span className="badge badge-cyan"><RiGlobalLine style={{ fontSize: '0.75rem' }} /> Public</span>}
                  </div>
                  <a href={shortLink} target="_blank" rel="noopener noreferrer" className="url-info-shortlink">
                    {shortLink.replace(/^https?:\/\//, '')}
                  </a>
                  <p className="url-info-originallink">{data.url.originalUrl}</p>
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

            {/* Stat cards */}
            <div className="analytics-stats-grid">
              {[
                { label: 'Total Clicks', val: data.totalClicks.toLocaleString(), icon: <RiBarChartLine />, color: 'var(--violet-l)' },
                { label: 'Last Visited', val: data.lastVisited ? new Date(data.lastVisited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never', icon: <RiTimeLine />, color: 'var(--cyan)' },
                { label: 'Peak Day Clicks', val: maxDay, icon: <RiFireLine />, color: 'var(--rose)' },
                { label: 'Tracking Days', val: '30', icon: <RiCalendarLine />, color: 'var(--amber)' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
                  <div className="stat-card-label-wrap">
                    <span className="stat-card-title">{s.label}</span>
                    <span style={{ color: s.color, fontSize: '1rem', display: 'inline-flex' }}>{s.icon}</span>
                  </div>
                  <div className="stat-card-val" style={{ color: s.color }}>{s.val}</div>
                </motion.div>
              ))}
            </div>

            {/* Daily chart */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="chart-header-row">
                <h2 style={{ fontFamily: 'var(--font-d)', fontWeight: 750, fontSize: '1.1rem' }}>Clicks — Last 30 Days</h2>
                {bestDay && (
                  <span className="badge badge-violet" style={{ fontSize: '0.72rem' }}>
                    <RiFireLine /> Peak: {new Date(bestDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({maxDay})
                  </span>
                )}
              </div>
              <DailyChart chartData={data.chartData} />
            </div>

            {/* Breakdown row */}
            <div className="breakdown-grid">
              {[
                { title: 'Browsers', key: 'browsers', colors: donut_colors_browser, icon: <RiBrainLine /> },
                { title: 'Operating Systems', key: 'os', colors: donut_colors_os, icon: <RiComputerLine /> },
                { title: 'Devices', key: 'devices', colors: donut_colors_device, icon: <RiSmartphoneLine /> },
                { title: 'Countries', key: 'countries', colors: donut_colors_country, icon: <RiGlobalLine /> },
              ].map((chart, i) => (
                <motion.div key={chart.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}>{chart.icon}</span>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-d)' }}>{chart.title}</h3>
                  </div>
                  <DonutChart data={data.breakdown[chart.key]} colors={chart.colors} />
                </motion.div>
              ))}
            </div>

            {/* Visit timeline */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-d)', fontWeight: 750, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recent Visit Timeline</h2>
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

          </motion.div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>No data found.</div>
        )}
      </div>
    </div>
  );
}