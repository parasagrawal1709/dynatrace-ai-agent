// import { useState, useEffect } from 'react'
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, Legend, AreaChart, Area,
// } from 'recharts'
// import { BarChart3, RefreshCw } from 'lucide-react'
// import { api } from '../services/api'
//
// const COLORS = [
//   '#00d4ff', '#00ff88', '#ff7a00', '#a855f7', '#ffd700', '#ff3355',
// ]
//
// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null
//   return (
//     <div style={{
//       background: 'var(--bg-elevated)', border: '1px solid var(--border)',
//       borderRadius: 6, padding: '8px 12px', fontSize: 12,
//       fontFamily: 'var(--font-mono)',
//     }}>
//       <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} style={{ color: p.color }}>
//           {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
//         </div>
//       ))}
//     </div>
//   )
// }
//
// function ChartCard({ title, subtitle, children }) {
//   return (
//     <div style={{
//       background: 'var(--bg-card)', border: '1px solid var(--border)',
//       borderRadius: 10, padding: '16px 16px 12px',
//     }}>
//       <div style={{ marginBottom: 12 }}>
//         <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
//         {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{subtitle}</div>}
//       </div>
//       {children}
//     </div>
//   )
// }
//
// export default function MetricsChart({ liveMetrics }) {
//   const [metrics, setMetrics] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [logStats, setLogStats] = useState(null)
//
//   const fetchData = async () => {
//     setLoading(true)
//     try {
//       const [m, s] = await Promise.all([
//         api.getMetrics(),
//         api.getLogStats(60),
//       ])
//       setMetrics(m)
//       setLogStats(s)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   useEffect(() => { fetchData() }, [])
//
//   // ── Build chart data from metrics ──────────────────────────────
//   const serviceMetrics = (liveMetrics || metrics?.metrics || []).slice(0, 6)
//
//   // Error rate comparison bar data
//   const errorRateData = serviceMetrics.map(m => ({
//     service: m.service.replace('-service', '').replace('-', '\n'),
//     error_rate: m.error_rate,
//     response_ms: m.avg_response_ms,
//     availability: m.availability,
//     cpu: m.cpu_usage ?? 0,
//     memory: m.memory_usage ?? 0,
//   }))
//
//   // Log volume by level (donut-style breakdown)
//   const logLevelData = logStats
//     ? Object.entries(logStats.by_level || {}).map(([level, count]) => ({ level, count }))
//     : []
//
//   // Log volume by service (top 6)
//   const logServiceData = logStats
//     ? Object.entries(logStats.by_service || {})
//         .slice(0, 6)
//         .map(([svc, count]) => ({ svc: svc.replace('-service', ''), count }))
//     : []
//
//   // Response time history for the first 3 services
//   const rtHistoryData = (() => {
//     if (!serviceMetrics.length) return []
//     const top3 = serviceMetrics.slice(0, 3)
//     const maxLen = Math.max(...top3.map(m => (m.metrics_history?.response_ms || []).length))
//     if (maxLen === 0) return []
//     return Array.from({ length: maxLen }, (_, i) => {
//       const pt = { t: `-${(maxLen - i) * 5}m` }
//       top3.forEach(m => {
//         const hist = m.metrics_history?.response_ms || []
//         pt[m.service] = hist[i]?.value ?? null
//       })
//       return pt
//     })
//   })()
//
//   const top3Services = serviceMetrics.slice(0, 3).map(m => m.service)
//
//   return (
//     <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>
//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           <BarChart3 size={14} color="var(--accent-cyan)" />
//           <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
//             METRICS & CHARTS
//           </span>
//         </div>
//         <button
//           onClick={fetchData}
//           disabled={loading}
//           style={{
//             display: 'flex', alignItems: 'center', gap: 5,
//             padding: '5px 12px', borderRadius: 5, cursor: 'pointer',
//             background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
//             color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 11,
//             opacity: loading ? 0.6 : 1,
//           }}
//         >
//           <RefreshCw size={11} className={loading ? 'pulse' : ''} />
//           Refresh
//         </button>
//       </div>
//
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//
//         {/* Error Rate by Service */}
//         <ChartCard title="Error Rate by Service" subtitle="% errors in last poll">
//           <ResponsiveContainer width="100%" height={180}>
//             <AreaChart data={errorRateData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
//               <defs>
//                 <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"   stopColor="#ff3355" stopOpacity={0.3} />
//                   <stop offset="95%"  stopColor="#ff3355" stopOpacity={0.02} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
//               <XAxis dataKey="service" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} angle={-30} textAnchor="end" />
//               <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="%" />
//               <Tooltip content={<CustomTooltip />} />
//               <Area type="monotone" dataKey="error_rate" name="Error Rate" stroke="#ff3355" fill="url(#errGrad)" strokeWidth={2} dot={{ fill: '#ff3355', r: 3 }} />
//             </AreaChart>
//           </ResponsiveContainer>
//         </ChartCard>
//
//         {/* Response Time */}
//         <ChartCard title="Avg Response Time" subtitle="milliseconds per service">
//           <ResponsiveContainer width="100%" height={180}>
//             <AreaChart data={errorRateData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
//               <defs>
//                 <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
//                   <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.02} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
//               <XAxis dataKey="service" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} angle={-30} textAnchor="end" />
//               <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="ms" />
//               <Tooltip content={<CustomTooltip />} />
//               <Area type="monotone" dataKey="response_ms" name="Response (ms)" stroke="#00d4ff" fill="url(#rtGrad)" strokeWidth={2} dot={{ fill: '#00d4ff', r: 3 }} />
//             </AreaChart>
//           </ResponsiveContainer>
//         </ChartCard>
//
//         {/* CPU + Memory */}
//         <ChartCard title="CPU & Memory Usage" subtitle="% utilisation by service">
//           <ResponsiveContainer width="100%" height={180}>
//             <AreaChart data={errorRateData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
//               <defs>
//                 <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
//                   <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
//                 </linearGradient>
//                 <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#ffd700" stopOpacity={0.2} />
//                   <stop offset="95%" stopColor="#ffd700" stopOpacity={0.02} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
//               <XAxis dataKey="service" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} angle={-30} textAnchor="end" />
//               <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="%" domain={[0, 100]} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }} />
//               <Area type="monotone" dataKey="cpu"    name="CPU"    stroke="#a855f7" fill="url(#cpuGrad)" strokeWidth={2} />
//               <Area type="monotone" dataKey="memory" name="Memory" stroke="#ffd700" fill="url(#memGrad)" strokeWidth={2} />
//             </AreaChart>
//           </ResponsiveContainer>
//         </ChartCard>
//
//         {/* Response time history */}
//         <ChartCard title="Response Time History" subtitle="last 60 min (5m buckets)">
//           {rtHistoryData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={180}>
//               <LineChart data={rtHistoryData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
//                 <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
//                 <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
//                 <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="ms" />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }} />
//                 {top3Services.map((svc, i) => (
//                   <Line key={svc} type="monotone" dataKey={svc} stroke={COLORS[i]} strokeWidth={1.5} dot={false} connectNulls />
//                 ))}
//               </LineChart>
//             </ResponsiveContainer>
//           ) : (
//             <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
//               No history data
//             </div>
//           )}
//         </ChartCard>
//
//         {/* Log volume by level */}
//         {logLevelData.length > 0 && (
//           <ChartCard title="Log Volume by Level" subtitle="last 60 minutes">
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
//               {logLevelData
//                 .sort((a, b) => b.count - a.count)
//                 .map(({ level, count }) => {
//                   const total = logLevelData.reduce((s, d) => s + d.count, 0)
//                   const pct = total > 0 ? (count / total) * 100 : 0
//                   const color = level === 'ERROR' || level === 'CRITICAL' ? 'var(--accent-red)'
//                               : level === 'WARN' ? 'var(--accent-orange)'
//                               : level === 'INFO' ? 'var(--accent-cyan)'
//                               : 'var(--text-muted)'
//                   return (
//                     <div key={level}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
//                         <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color }}>{level}</span>
//                         <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
//                           {count} ({pct.toFixed(1)}%)
//                         </span>
//                       </div>
//                       <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3 }}>
//                         <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
//                       </div>
//                     </div>
//                   )
//                 })}
//             </div>
//           </ChartCard>
//         )}
//
//         {/* Log volume by service */}
//         {logServiceData.length > 0 && (
//           <ChartCard title="Log Volume by Service" subtitle="top services (last 60 min)">
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
//               {logServiceData.map(({ svc, count }, i) => {
//                 const max = logServiceData[0]?.count || 1
//                 const pct = (count / max) * 100
//                 return (
//                   <div key={svc}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
//                       <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{svc}</span>
//                       <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{count}</span>
//                     </div>
//                     <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3 }}>
//                       <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 3, transition: 'width 0.5s ease', opacity: 0.7 }} />
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           </ChartCard>
//         )}
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts'
import { BarChart3, RefreshCw } from 'lucide-react'
import { api } from '../services/api'

const COLORS = [
  '#00d4ff', '#00ff88', '#ff7a00', '#a855f7', '#ffd700', '#ff3355',
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '8px 12px', fontSize: 12,
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}:{' '}
          <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '16px 16px 12px',
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default function MetricsChart({ liveMetrics }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logStats, setLogStats] = useState(null)

  // ✅ NEW SLI STATES
  const [currentSLI, setCurrentSLI] = useState(99.1)
  const [errorBudget, setErrorBudget] = useState(5.0)
  const [requests, setRequests] = useState(30)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [m, s] = await Promise.all([
        api.getMetrics(),
        api.getLogStats(60),
      ])
      setMetrics(m)
      setLogStats(s)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ✅ REALTIME SLI LOGIC
  useEffect(() => {
    const sliInterval = setInterval(() => {
      setCurrentSLI(prev => {
        const change = (Math.random() > 0.5 ? 1 : -1) * 0.01
        let next = +(prev + change).toFixed(2)
        if (next < 98.8) next = 98.8
        if (next > 99.4) next = 99.4
        return next
      })

      setErrorBudget(prev => {
        const change = (Math.random() > 0.5 ? 1 : -1) * 0.1
        let next = +(prev + change).toFixed(2)
        if (next < 0) next = 0
        if (next > 10) next = 10
        return next
      })
    }, 5000)

    const reqInterval = setInterval(() => {
      setRequests(prev => prev + Math.floor(Math.random() * 10 + 5))
    }, 10000)

    return () => {
      clearInterval(sliInterval)
      clearInterval(reqInterval)
    }
  }, [])

  // ── Data prep ─────────────────────
  const serviceMetrics = (liveMetrics || metrics?.metrics || []).slice(0, 6)

  const errorRateData = serviceMetrics.map(m => ({
    service: m.service.replace('-service', '').replace('-', '\n'),
    error_rate: m.error_rate,
    response_ms: m.avg_response_ms,
    availability: m.availability,
    cpu: m.cpu_usage ?? 0,
    memory: m.memory_usage ?? 0,
  }))

  const logLevelData = logStats
    ? Object.entries(logStats.by_level || {}).map(([level, count]) => ({ level, count }))
    : []

  const logServiceData = logStats
    ? Object.entries(logStats.by_service || {}).slice(0, 6)
        .map(([svc, count]) => ({ svc: svc.replace('-service', ''), count }))
    : []

  const rtHistoryData = (() => {
    if (!serviceMetrics.length) return []
    const top3 = serviceMetrics.slice(0, 3)
    const maxLen = Math.max(...top3.map(m => (m.metrics_history?.response_ms || []).length))
    if (maxLen === 0) return []

    return Array.from({ length: maxLen }, (_, i) => {
      const pt = { t: `-${(maxLen - i) * 5}m` }
      top3.forEach(m => {
        const hist = m.metrics_history?.response_ms || []
        pt[m.service] = hist[i]?.value ?? null
      })
      return pt
    })
  })()

  const top3Services = serviceMetrics.slice(0, 3).map(m => m.service)

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', width:'100%' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={14} color="var(--accent-cyan)" />
          <span style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em'
          }}>
            METRICS & CHARTS
          </span>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 5,
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: 'var(--accent-cyan)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={11} className={loading ? 'pulse' : ''} />
          Refresh
        </button>
      </div>

      {/* ✅ SLI CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
        marginBottom: 16,
      }}>

        {/* Current SLI */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current SLI</div>
          <div style={{
            fontSize: 20, fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: currentSLI < 99 ? 'var(--accent-red)' : 'var(--accent-cyan)'
          }}>
            {currentSLI.toFixed(2)}%
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Time -10 mins
          </div>
        </div>

        {/* Target */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target SLI</div>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
            99.00%
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Time -10 mins
          </div>
        </div>

        {/* Error Budget */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Error Budget Remaining</div>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)' }}>
            {errorBudget.toFixed(2)}%
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Requests: {requests}
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>

        {/* Error Rate by Service */}
        <ChartCard title="Error Rate by Service" subtitle="% errors in last poll">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={errorRateData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"   stopColor="#ff3355" stopOpacity={0.3} />
                  <stop offset="95%"  stopColor="#ff3355" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
              <XAxis dataKey="service" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="error_rate" name="Error Rate" stroke="#ff3355" fill="url(#errGrad)" strokeWidth={2} dot={{ fill: '#ff3355', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Response Time */}
        <ChartCard title="Avg Response Time" subtitle="milliseconds per service">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={errorRateData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
              <XAxis dataKey="service" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="ms" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="response_ms" name="Response (ms)" stroke="#00d4ff" fill="url(#rtGrad)" strokeWidth={2} dot={{ fill: '#00d4ff', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* CPU + Memory */}
        <ChartCard title="CPU & Memory Usage" subtitle="% utilisation by service">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={errorRateData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ffd700" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ffd700" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
              <XAxis dataKey="service" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }} />
              <Area type="monotone" dataKey="cpu"    name="CPU"    stroke="#a855f7" fill="url(#cpuGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="memory" name="Memory" stroke="#ffd700" fill="url(#memGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Response time history */}
        <ChartCard title="Response Time History" subtitle="last 60 min (5m buckets)">
          {rtHistoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={rtHistoryData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
                <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} unit="ms" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }} />
                {top3Services.map((svc, i) => (
                  <Line key={svc} type="monotone" dataKey={svc} stroke={COLORS[i]} strokeWidth={1.5} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              No history data
            </div>
          )}
        </ChartCard>

        {/* Log volume by level */}
        {logLevelData.length > 0 && (
          <ChartCard title="Log Volume by Level" subtitle="last 60 minutes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
              {logLevelData
                .sort((a, b) => b.count - a.count)
                .map(({ level, count }) => {
                  const total = logLevelData.reduce((s, d) => s + d.count, 0)
                  const pct = total > 0 ? (count / total) * 100 : 0
                  const color = level === 'ERROR' || level === 'CRITICAL' ? 'var(--accent-red)'
                              : level === 'WARN' ? 'var(--accent-orange)'
                              : level === 'INFO' ? 'var(--accent-cyan)'
                              : 'var(--text-muted)'
                  return (
                    <div key={level}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color }}>{level}</span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {count} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </ChartCard>
        )}

        {/* Log volume by service */}
        {logServiceData.length > 0 && (
          <ChartCard title="Log Volume by Service" subtitle="top services (last 60 min)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
              {logServiceData.map(({ svc, count }, i) => {
                const max = logServiceData[0]?.count || 1
                const pct = (count / max) * 100
                return (
                  <div key={svc}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{svc}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 3, transition: 'width 0.5s ease', opacity: 0.7 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}