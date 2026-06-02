// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Chart, registerables } from 'chart.js';
// import api from '../api/axios';
// import Navbar from '../components/Navbar';
// import Toast from '../components/Toast';

// Chart.register(...registerables);

// export default function Analytics() {
//   const { urlId } = useParams();
//   const navigate = useNavigate();
//   const chartRef = useRef(null);
//   const chartInstance = useRef(null);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState(null);

//   useEffect(() => {
//     api.get(`/api/analytics/${urlId}`)
//       .then(({ data }) => setData(data))
//       .catch(() => setToast({ message: 'Failed to load analytics', type: 'error' }))
//       .finally(() => setLoading(false));
//   }, [urlId]);

//   useEffect(() => {
//     if (!data || !chartRef.current) return;
//     if (chartInstance.current) chartInstance.current.destroy();

//     chartInstance.current = new Chart(chartRef.current, {
//       type: 'bar',
//       data: {
//         labels: data.chartData.labels.map((d) => {
//           const dt = new Date(d);
//           return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//         }),
//         datasets: [{
//           label: 'Clicks',
//           data: data.chartData.data,
//           backgroundColor: 'rgba(139,92,246,0.6)',
//           borderColor: 'rgba(139,92,246,1)',
//           borderWidth: 1,
//           borderRadius: 6,
//         }],
//       },
//       options: {
//         responsive: true,
//         plugins: { legend: { display: false } },
//         scales: {
//           x: { ticks: { color: '#71717a' }, grid: { color: '#27272a' } },
//           y: { ticks: { color: '#71717a', stepSize: 1 }, grid: { color: '#27272a' }, beginAtZero: true },
//         },
//       },
//     });
//   }, [data]);

//   const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

//   return (
//     <div className="min-h-screen bg-zinc-950">
//       <Navbar />
//       {toast && <Toast {...toast} onClose={() => setToast(null)} />}

//       <div className="max-w-4xl mx-auto px-4 py-10">
//         <button onClick={() => navigate('/dashboard')} className="text-zinc-500 hover:text-white text-sm mb-6 transition-colors">
//           ← Back to Dashboard
//         </button>

//         {loading ? (
//           <div className="text-center py-20 text-zinc-500">Loading analytics…</div>
//         ) : data ? (
//           <>
//             {/* URL Info */}
//             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
//               <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Short URL</p>
//               <p className="text-violet-400 font-mono font-semibold mb-3">
//                 {BASE_URL}/{data.url.shortCode}
//               </p>
//               <p className="text-zinc-500 text-sm break-all">{data.url.originalUrl}</p>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
//               {[
//                 { label: 'Total Clicks', value: data.totalClicks },
//                 { label: 'Last Visited', value: data.lastVisited ? new Date(data.lastVisited).toLocaleDateString() : 'Never' },
//                 { label: 'Created', value: new Date(data.url.createdAt).toLocaleDateString() },
//               ].map((stat) => (
//                 <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
//                   <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
//                   <p className="text-white font-bold text-xl">{stat.value}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Chart */}
//             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
//               <h3 className="text-white font-semibold mb-4">Clicks — Last 14 Days</h3>
//               <canvas ref={chartRef} height={100} />
//             </div>

//             {/* Recent Visits */}
//             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
//               <h3 className="text-white font-semibold mb-4">Recent Visits</h3>
//               {data.recentVisits.length === 0 ? (
//                 <p className="text-zinc-500 text-sm text-center py-6">No visits yet</p>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
//                         <th className="text-left pb-3">Timestamp</th>
//                         <th className="text-left pb-3">IP</th>
//                         <th className="text-left pb-3">User Agent</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-zinc-800">
//                       {data.recentVisits.map((v) => (
//                         <tr key={v._id} className="text-zinc-400">
//                           <td className="py-2.5 pr-4 whitespace-nowrap">
//                             {new Date(v.timestamp).toLocaleString()}
//                           </td>
//                           <td className="py-2.5 pr-4 font-mono text-xs">{v.ip}</td>
//                           <td className="py-2.5 text-xs truncate max-w-xs">{v.userAgent}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-20 text-zinc-500">No data found.</div>
//         )}
//       </div>
//     </div>
//   );
// }


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

Chart.register(...registerables);

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Skeleton ── */
const Sk = ({ className }) => <div className={`skeleton ${className}`} />;

/* ── Donut chart component ── */
function DonutChart({ data, colors, title }) {
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
    <div className="flex items-center gap-6">
      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
        <canvas ref={ref} />
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
            <span className="text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
            <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-primary)' }}>{Math.round(d.count / total * 100)}%</span>
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
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--violet-400)' }} />
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: 'var(--border-subtle)' }} />}
      </div>
      <div className="pb-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {new Date(visit.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="badge badge-violet">{visit.device}</span>
          <span className="badge badge-cyan">{visit.browser}</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><RiGlobalLine /> {visit.country} · {visit.city}</span>
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
    <div className="noise" style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* URL info card */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-violet">Analytics</span>
                    {data.url.isPublic && <span className="badge badge-cyan"><RiGlobalLine className="text-xs" /> Public</span>}
                  </div>
                  <a href={shortLink} target="_blank" rel="noopener noreferrer"
                    className="font-mono font-bold text-lg transition-colors hover:underline block mb-1"
                    style={{ color: 'var(--violet-200)', fontFamily: 'monospace' }}
                  >
                    {shortLink.replace(/^https?:\/\//, '')}
                  </a>
                  <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{data.url.originalUrl}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.93 }} onClick={handleCopy} className="btn btn-secondary gap-2 text-sm px-4 py-2.5">
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><RiCheckLine style={{ color: 'var(--emerald-400)' }} /></motion.span>
                        : <motion.span key="f" initial={{ scale: 0 }} animate={{ scale: 1 }}><RiFileCopyLine /></motion.span>
                      }
                    </AnimatePresence>
                    {copied ? 'Copied!' : 'Copy URL'}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Clicks', val: data.totalClicks.toLocaleString(), icon: <RiBarChartLine />, color: 'var(--violet-300)' },
                { label: 'Last Visited', val: data.lastVisited ? new Date(data.lastVisited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never', icon: <RiTimeLine />, color: 'var(--cyan-400)' },
                { label: 'Peak Day Clicks', val: maxDay, icon: <RiFireLine />, color: 'var(--rose-400)' },
                { label: 'Tracking Days', val: '30', icon: <RiCalendarLine />, color: 'var(--amber-400)' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                    <span style={{ color: s.color, fontSize: '1rem' }}>{s.icon}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                </motion.div>
              ))}
            </div>

            {/* Daily chart */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Clicks — Last 30 Days</h2>
                {bestDay && (
                  <span className="badge badge-violet text-xs">
                    <RiFireLine /> Peak: {new Date(bestDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({maxDay})
                  </span>
                )}
              </div>
              <DailyChart chartData={data.chartData} />
            </div>

            {/* Breakdown row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Browsers', key: 'browsers', colors: donut_colors_browser, icon: <RiBrainLine /> },
                { title: 'Operating Systems', key: 'os', colors: donut_colors_os, icon: <RiComputerLine /> },
                { title: 'Devices', key: 'devices', colors: donut_colors_device, icon: <RiSmartphoneLine /> },
                { title: 'Countries', key: 'countries', colors: donut_colors_country, icon: <RiGlobalLine /> },
              ].map((chart, i) => (
                <motion.div key={chart.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span style={{ color: 'var(--text-secondary)' }}>{chart.icon}</span>
                    <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{chart.title}</h3>
                  </div>
                  <DonutChart data={data.breakdown[chart.key]} colors={chart.colors} />
                </motion.div>
              ))}
            </div>

            {/* Visit timeline */}
            <div className="glass-card p-6">
              <h2 className="mb-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Recent Visit Timeline</h2>
              {data.recentVisits.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>No visits recorded yet</p>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-2">
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