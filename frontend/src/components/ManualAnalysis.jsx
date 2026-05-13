// // import { useState } from 'react'
// // import { ClipboardPaste, Play, Loader, Trash2, Lightbulb } from 'lucide-react'
// // import { api } from '../services/api'
// //
// // const SAMPLE_LOGS = `ERROR payment-service: Connection pool exhausted — waited 30000ms
// // WARN  api-gateway: Response time threshold exceeded: 4823ms (limit: 2000ms)
// // ERROR payment-service: HTTP 503 from downstream inventory-service after 5000ms
// // ERROR auth-service: JWT verification failed — invalid signature from IP 10.0.1.42
// // ERROR payment-service: Retry attempt 3/3 for POST /charge — giving up
// // WARN  db-proxy: Slow query detected: SELECT * FROM orders WHERE status='pending' took 12430ms
// // ERROR payment-service: OutOfMemoryError: Java heap space — heap at 98%
// // INFO  api-gateway: Deployment v2.4.1 completed successfully
// // WARN  notification-service: Email queue depth: 1842 — approaching limit (2000)
// // ERROR db-proxy: Connection refused to primary — failover initiated`
// //
// // function IssueRow({ issue }) {
// //   const color = issue.severity === 'CRITICAL' || issue.severity === 'HIGH'
// //     ? 'var(--accent-red)'
// //     : issue.severity === 'MEDIUM'
// //     ? 'var(--accent-orange)'
// //     : 'var(--accent-cyan)'
// //
// //   return (
// //     <div style={{
// //       padding: '8px 12px', marginBottom: 6,
// //       background: 'var(--bg-card)',
// //       border: `1px solid ${color}33`,
// //       borderLeft: `3px solid ${color}`,
// //       borderRadius: 6,
// //     }}>
// //       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
// //         <span style={{ fontSize: 12, fontWeight: 600, color }}>{issue.severity} — {issue.title}</span>
// //         <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
// //           {Math.round(issue.confidence * 100)}% confidence
// //         </span>
// //       </div>
// //       <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{issue.description}</div>
// //       {issue.recommendation && (
// //         <div style={{ fontSize: 11, color: 'var(--accent-green)' }}>
// //           ✓ {issue.recommendation}
// //         </div>
// //       )}
// //     </div>
// //   )
// // }
// //
// // export default function ManualAnalysis() {
// //   const [logText, setLogText]     = useState('')
// //   const [result,  setResult]      = useState(null)
// //   const [loading, setLoading]     = useState(false)
// //   const [error,   setError]       = useState(null)
// //
// //   const runAnalysis = async () => {
// //     const lines = logText.split('\n').map(l => l.trim()).filter(Boolean)
// //     if (lines.length === 0) return
// //
// //     setLoading(true)
// //     setError(null)
// //     setResult(null)
// //
// //     try {
// //       const data = await api.runAnalysis({
// //         log_lines: lines,
// //         include_metrics: true,
// //         include_problems: false,
// //       })
// //       setResult(data)
// //     } catch (e) {
// //       setError(e.message || 'Analysis failed. Is your ANTHROPIC_API_KEY set?')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }
// //
// //   const loadSample = () => setLogText(SAMPLE_LOGS)
// //   const clearAll   = () => { setLogText(''); setResult(null); setError(null) }
// //
// //   const lineCount = logText.split('\n').filter(l => l.trim()).length
// //
// //   return (
// //     <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
// //       {/* Header toolbar */}
// //       <div style={{
// //         display: 'flex', alignItems: 'center', gap: 10,
// //         padding: '10px 16px',
// //         background: 'var(--bg-elevated)',
// //         borderBottom: '1px solid var(--border)',
// //         flexShrink: 0,
// //       }}>
// //         <ClipboardPaste size={13} color="var(--accent-purple)" />
// //         <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
// //           PASTE &amp; ANALYSE
// //         </span>
// //         <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
// //           {lineCount > 0 ? `${lineCount} lines` : ''}
// //         </span>
// //
// //         <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
// //           <button onClick={loadSample} style={btnStyle('cyan')}>
// //             <Lightbulb size={10} /> Sample logs
// //           </button>
// //           <button onClick={clearAll} style={btnStyle('muted')}>
// //             <Trash2 size={10} /> Clear
// //           </button>
// //           <button
// //             onClick={runAnalysis}
// //             disabled={loading || lineCount === 0}
// //             style={{
// //               ...btnStyle('purple'),
// //               opacity: (loading || lineCount === 0) ? 0.5 : 1,
// //               cursor: (loading || lineCount === 0) ? 'not-allowed' : 'pointer',
// //             }}
// //           >
// //             {loading
// //               ? <><Loader size={10} className="pulse" /> Analysing …</>
// //               : <><Play  size={10} /> Run AI Analysis</>
// //             }
// //           </button>
// //         </div>
// //       </div>
// //
// //       <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
// //         {/* Input pane */}
// //         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
// //           <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '6px 12px', background: 'var(--bg-elevated)', letterSpacing: '0.08em' }}>
// //             INPUT — paste raw log lines (one per line)
// //           </div>
// //           <textarea
// //             value={logText}
// //             onChange={e => setLogText(e.target.value)}
// //             placeholder={"Paste log lines here…\n\nExample:\n  ERROR payment-service: Connection pool exhausted\n  WARN api-gateway: High response time 4823ms"}
// //             style={{
// //               flex: 1, padding: '12px 14px', resize: 'none',
// //               background: 'var(--bg-base)',
// //               border: 'none', outline: 'none',
// //               color: 'var(--text-primary)',
// //               fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7,
// //             }}
// //             spellCheck={false}
// //           />
// //         </div>
// //
// //         {/* Results pane */}
// //         <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'var(--bg-card)' }}>
// //           {!result && !error && !loading && (
// //             <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8 }}>
// //               Paste logs on the left and click<br />"Run AI Analysis"<br /><br />
// //               Claude will detect issues, predict problems,<br />and give you actionable recommendations.
// //             </div>
// //           )}
// //
// //           {loading && (
// //             <div style={{ textAlign: 'center', padding: 40, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
// //               <Loader size={24} className="pulse" style={{ margin: '0 auto 12px', display: 'block' }} />
// //               Claude is analysing your logs…
// //             </div>
// //           )}
// //
// //           {error && (
// //             <div style={{
// //               padding: '12px 14px', borderRadius: 8,
// //               background: 'rgba(255,51,85,0.08)', border: '1px solid rgba(255,51,85,0.3)',
// //               color: 'var(--accent-red)', fontSize: 12, fontFamily: 'var(--font-mono)',
// //             }}>
// //               ⚠ {error}
// //             </div>
// //           )}
// //
// //           {result && (
// //             <div>
// //               {/* Summary */}
// //               {result.summary && (
// //                 <div style={{ padding: '10px 12px', marginBottom: 14, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8 }}>
// //                   <div style={{ fontSize: 10, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>SUMMARY</div>
// //                   <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>{result.summary}</div>
// //                 </div>
// //               )}
// //
// //               {/* Issues */}
// //               {result.issues_detected?.length > 0 && (
// //                 <div style={{ marginBottom: 12 }}>
// //                   <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
// //                     ISSUES FOUND ({result.issues_detected.length})
// //                   </div>
// //                   {result.issues_detected.map((issue, i) => <IssueRow key={i} issue={issue} />)}
// //                 </div>
// //               )}
// //
// //               {/* Recommendations */}
// //               {result.recommendations?.length > 0 && (
// //                 <div>
// //                   <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
// //                     RECOMMENDATIONS
// //                   </div>
// //                   {result.recommendations.map((r, i) => (
// //                     <div key={i} style={{ fontSize: 12, color: 'var(--text-primary)', padding: '5px 10px', marginBottom: 4, background: 'rgba(0,255,136,0.04)', borderRadius: 4, borderLeft: '2px solid var(--accent-green)' }}>
// //                       {r}
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //
// //               <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
// //                 Analysed {result.analyzed_log_count} log entries · {result.model_used}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
// //
// // function btnStyle(accent) {
// //   const colors = {
// //     cyan:   { bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.25)',   color: 'var(--accent-cyan)'   },
// //     purple: { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.35)', color: 'var(--accent-purple)' },
// //     muted:  { bg: 'var(--bg-card)',          border: 'var(--border)',          color: 'var(--text-muted)'    },
// //   }
// //   const c = colors[accent] || colors.muted
// //   return {
// //     display: 'flex', alignItems: 'center', gap: 5,
// //     padding: '5px 12px', borderRadius: 5, cursor: 'pointer',
// //     background: c.bg, border: `1px solid ${c.border}`,
// //     color: c.color, fontFamily: 'var(--font-mono)', fontSize: 11,
// //   }
// // }
//
//
// import { useEffect, useState } from 'react'
// import { Loader, RefreshCw } from 'lucide-react'
//
// const API_URL = 'http://localhost:8080/incidents'
//
// /* =========================
//    Incident Row Card
// ========================= */
// function IncidentRow({ incident }) {
//   const getColor = () => {
//     if (incident.priority?.includes('1')) return 'var(--accent-red)'
//     if (incident.priority?.includes('2')) return 'var(--accent-orange)'
//     return 'var(--accent-cyan)'
//   }
//
//   const color = getColor()
//
//   return (
//     <div style={{
//       padding: '8px 12px',
//       marginBottom: 6,
//       background: 'var(--bg-card)',
//       border: `1px solid ${color}33`,
//       borderLeft: `3px solid ${color}`,
//       borderRadius: 6,
//     }}>
//       {/* Top Row */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         marginBottom: 3
//       }}>
//         <span style={{
//           fontSize: 12,
//           fontWeight: 600,
//           color
//         }}>
//           {incident.number} — {incident.short_description}
//         </span>
//
//         <span style={{
//           fontSize: 10,
//           fontFamily: 'var(--font-mono)',
//           color: 'var(--text-muted)'
//         }}>
//           {incident.state}
//         </span>
//       </div>
//
//       {/* Description */}
//       <div style={{
//         fontSize: 11,
//         color: 'var(--text-secondary)',
//         marginBottom: 4
//       }}>
//         {incident.description}
//       </div>
//
//       {/* Meta */}
//       <div style={{
//         display: 'flex',
//         gap: 10,
//         fontSize: 10,
//         fontFamily: 'var(--font-mono)',
//         color: 'var(--text-muted)'
//       }}>
//         <span>Priority: {incident.priority}</span>
//         <span>Severity: {incident.severity}</span>
//         <span>Opened: {incident.opened_at}</span>
//       </div>
//     </div>
//   )
// }
//
//
// /* =========================
//    Main Component
// ========================= */
// export default function IncidentsDashboard() {
//   const [incidents, setIncidents] = useState([])
//   const [filtered, setFiltered] = useState([])
//   const [loading, setLoading] = useState(true)
//
//   const [stateFilter, setStateFilter] = useState('ALL')
//   const [priorityFilter, setPriorityFilter] = useState('ALL')
//   const [search, setSearch] = useState('')
//
//   /* =========================
//      Fetch Data
//   ========================= */
//   const fetchIncidents = async () => {
//     try {
//       const res = await fetch(API_URL)
//       const data = await res.json()
//       setIncidents(data.result || [])
//       setLoading(false)
//     } catch (e) {
//       console.error(e)
//       setLoading(false)
//     }
//   }
//
//   /* =========================
//      Poll every 10s
//   ========================= */
//   useEffect(() => {
//     fetchIncidents()
//     const interval = setInterval(fetchIncidents, 10000)
//     return () => clearInterval(interval)
//   }, [])
//
//   /* =========================
//      Filtering Logic
//   ========================= */
//   useEffect(() => {
//     let data = [...incidents]
//
//     if (stateFilter !== 'ALL') {
//       data = data.filter(i => i.state === stateFilter)
//     }
//
//     if (priorityFilter !== 'ALL') {
//       data = data.filter(i => i.priority === priorityFilter)
//     }
//
//     if (search) {
//       data = data.filter(i =>
//         i.number.toLowerCase().includes(search.toLowerCase()) ||
//         i.short_description?.toLowerCase().includes(search.toLowerCase())
//       )
//     }
//
//     // Sort latest first
//     data.sort((a, b) => new Date(b.opened_at) - new Date(a.opened_at))
//
//     setFiltered(data)
//   }, [incidents, stateFilter, priorityFilter, search])
//
//
//   return (
//     <div style={{
//       display: 'flex',
//       flexDirection: 'column',
//       height: '100%',
//       overflow: 'hidden'
//     }}>
//
//       {/* =========================
//          HEADER BAR (same style)
//       ========================= */}
//       <div style={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: 10,
//         padding: '10px 16px',
//         background: 'var(--bg-elevated)',
//         borderBottom: '1px solid var(--border)',
//         flexShrink: 0,
//       }}>
//         <span style={{
//           fontSize: 11,
//           color: 'var(--text-muted)',
//           fontFamily: 'var(--font-mono)',
//           letterSpacing: '0.1em'
//         }}>
//           INCIDENT MONITOR
//         </span>
//
//         <span style={{
//           fontSize: 10,
//           color: 'var(--text-muted)',
//           fontFamily: 'var(--font-mono)'
//         }}>
//           {filtered.length} items
//         </span>
//
//         {/* RIGHT CONTROLS */}
//         <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
//
//           {/* Search */}
//           <input
//             placeholder="Search..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             style={inputStyle}
//           />
//
//           {/* State Filter */}
//           <select
//             value={stateFilter}
//             onChange={e => setStateFilter(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="ALL">All States</option>
//             <option value="New">New</option>
//             <option value="In Progress">In Progress</option>
//             <option value="Resolved">Resolved</option>
//           </select>
//
//           {/* Priority Filter */}
//           <select
//             value={priorityFilter}
//             onChange={e => setPriorityFilter(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="ALL">All Priority</option>
//             <option value="1 - Critical">Critical</option>
//             <option value="2 - High">High</option>
//             <option value="3 - Moderate">Moderate</option>
//           </select>
//
//           {/* Refresh */}
//           <button onClick={fetchIncidents} style={btnStyle}>
//             <RefreshCw size={12} />
//           </button>
//         </div>
//       </div>
//
//
//       {/* =========================
//          LIST AREA
//       ========================= */}
//       <div style={{
//         flex: 1,
//         overflowY: 'auto',
//         padding: 16,
//         background: 'var(--bg-base)'
//       }}>
//         {loading ? (
//           <div style={{
//             textAlign: 'center',
//             padding: 40,
//             color: 'var(--accent-purple)',
//             fontFamily: 'var(--font-mono)',
//             fontSize: 12
//           }}>
//             <Loader className="pulse" />
//           </div>
//         ) : filtered.length === 0 ? (
//           <div style={{
//             textAlign: 'center',
//             padding: 40,
//             color: 'var(--text-muted)',
//             fontFamily: 'var(--font-mono)',
//             fontSize: 12
//           }}>
//             No incidents found
//           </div>
//         ) : (
//           filtered.map(i => (
//             <IncidentRow key={i.sys_id} incident={i} />
//           ))
//         )}
//       </div>
//     </div>
//   )
// }
//
//
// /* =========================
//    Styles (same design tokens)
// ========================= */
// const inputStyle = {
//   background: 'var(--bg-card)',
//   border: '1px solid var(--border)',
//   color: 'var(--text-primary)',
//   fontSize: 11,
//   padding: '5px 8px',
//   borderRadius: 4,
//   fontFamily: 'var(--font-mono)',
// }
//
// const btnStyle = {
//   display: 'flex',
//   alignItems: 'center',
//   padding: '5px 10px',
//   borderRadius: 5,
//   cursor: 'pointer',
//   background: 'rgba(0,212,255,0.08)',
//   border: '1px solid rgba(0,212,255,0.25)',
//   color: 'var(--accent-cyan)',
// }
//
// import { useEffect, useState } from 'react'
// import { Loader, RefreshCw } from 'lucide-react'
//
// const API_URL = 'http://localhost:8080/incidents'
//
// /* =========================
//    Incident Card
// ========================= */
// function IncidentRow({ incident }) {
//   const color =
//     incident.priority?.includes('1')
//       ? '#ff3355'
//       : incident.priority?.includes('2')
//       ? '#ff9f40'
//       : '#00d4ff'
//
//   return (
//     <div
//       style={{
//         padding: '10px',
//         marginBottom: 8,
//         background: '#1e1e1e',
//         border: `1px solid ${color}55`,
//         borderLeft: `4px solid ${color}`,
//         borderRadius: 6,
//         color: '#fff',
//       }}
//     >
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <div style={{ fontSize: 12, fontWeight: 600 }}>
//           {incident.number} — {incident.short_description}
//         </div>
//
//         <div style={{ fontSize: 10, opacity: 0.7 }}>
//           {incident.state}
//         </div>
//       </div>
//
//       {/* Description */}
//       <div style={{ fontSize: 11, marginTop: 5, opacity: 0.8 }}>
//         {incident.description}
//       </div>
//
//       {/* Metadata */}
//       <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6 }}>
//         Priority: {incident.priority} | Severity: {incident.severity}
//       </div>
//     </div>
//   )
// }
//
// /* =========================
//    Main Component
// ========================= */
// export default function IncidentsDashboard() {
//   const [incidents, setIncidents] = useState([])
//   const [loading, setLoading] = useState(true)
//
//   const [search, setSearch] = useState('')
//   const [stateFilter, setStateFilter] = useState('ALL')
//
//   /* =========================
//      Fetch API (FIXED)
//   ========================= */
//   const fetchIncidents = async () => {
//     try {
//       setLoading(true)
//
//       const res = await fetch(API_URL)
//
//       if (!res.ok) {
//         throw new Error(`HTTP status: ${res.status}`)
//       }
//
//       const data = await res.json()
//
//       console.log('FULL API RESPONSE:', data)
//
//       // ---- Robust parsing ----
//       let list = []
//
//       if (Array.isArray(data)) {
//         list = data
//       } else if (Array.isArray(data.result)) {
//         list = data.result
//       } else if (Array.isArray(data.incidents)) {
//         list = data.incidents
//       } else {
//         console.warn('Unexpected API format ❗', data)
//       }
//
//       console.log('FINAL INCIDENT LIST:', list)
//
//       setIncidents(list)
//     } catch (err) {
//       console.error('FETCH ERROR:', err)
//       setIncidents([])
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   /* =========================
//      Poll every 10s
//   ========================= */
//   useEffect(() => {
//     fetchIncidents()
//     const i = setInterval(fetchIncidents, 10000)
//     return () => clearInterval(i)
//   }, [])
//
//   /* =========================
//      Filtering
//   ========================= */
//   const filtered = incidents.filter((i) => {
//     if (stateFilter !== 'ALL' && i.state !== stateFilter) return false
//
//     if (search) {
//       const text =
//         (i.number || '') + (i.short_description || '')
//       if (!text.toLowerCase().includes(search.toLowerCase())) {
//         return false
//       }
//     }
//
//     return true
//   })
//
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//       {/* HEADER */}
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 10,
//           padding: '10px 16px',
//           background: '#111',
//           borderBottom: '1px solid #333',
//         }}
//       >
//         <span style={{ fontSize: 12, color: '#00d4ff' }}>
//           INCIDENT DASHBOARD
//         </span>
//
//         <span style={{ fontSize: 10, opacity: 0.6 }}>
//           {filtered.length} items
//         </span>
//
//         <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
//           {/* Search */}
//           <input
//             placeholder="Search..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             style={inputStyle}
//           />
//
//           {/* State filter */}
//           <select
//             value={stateFilter}
//             onChange={(e) => setStateFilter(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="ALL">All</option>
//             <option value="New">New</option>
//           </select>
//
//           {/* Refresh */}
//           <button onClick={fetchIncidents} style={btnStyle}>
//             <RefreshCw size={12} />
//           </button>
//         </div>
//       </div>
//
//       {/* LIST */}
//       <div
//         style={{
//           flex: 1,
//           overflowY: 'auto',
//           padding: 12,
//           background: '#0d0d0d',
//         }}
//       >
//         {loading ? (
//           <Loader />
//         ) : filtered.length === 0 ? (
//           <div style={{ color: 'red', padding: 20 }}>
//             No incidents received 🚨
//           </div>
//         ) : (
//           filtered.map((item) => (
//             <IncidentRow key={item.sys_id || item.id} incident={item} />
//           ))
//         )}
//       </div>
//     </div>
//   )
// }
//
// /* =========================
//    Styles
// ========================= */
// const inputStyle = {
//   background: '#222',
//   border: '1px solid #444',
//   color: '#fff',
//   fontSize: 11,
//   padding: '4px 8px',
//   borderRadius: 4,
// }
//
// const btnStyle = {
//   padding: '4px 8px',
//   background: '#00d4ff22',
//   border: '1px solid #00d4ff55',
//   color: '#00d4ff',
//   cursor: 'pointer',
// }



import { useEffect, useState } from 'react'
import { Loader, RefreshCw } from 'lucide-react'

const API_URL = 'http://localhost:8080/incidents'

/* =========================
   Incident Card
========================= */
function IncidentRow({ incident }) {
  const color =
    incident.priority?.includes('1')
      ? '#ff3355'
      : incident.priority?.includes('2')
      ? '#ff9f40'
      : '#00d4ff'

  return (
    <div
      style={{
        padding: '10px',
        marginBottom: 8,
        background: '#1e1e1e',
        border: `1px solid ${color}55`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 6,
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>
          {incident.number} — {incident.short_description}
        </div>
        <div style={{ fontSize: 10, opacity: 0.7 }}>
          {incident.state}
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 11, marginTop: 5, opacity: 0.8 }}>
        {incident.description}
      </div>

      {/* Important Fields */}
      <div style={{ fontSize: 10, marginTop: 6, opacity: 0.65 }}>
        Priority: {incident.priority} | Severity: {incident.severity}
        <br />
        Impact: {incident.impact} | Urgency: {incident.urgency}
        <br />
        Category: {incident.category}
        <br />
        Opened: {incident.opened_at}
      </div>
    </div>
  )
}

/* =========================
   Main Component
========================= */
export default function IncidentsDashboard() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  /* =========================
     Fetch API (MANUAL ONLY)
  ========================= */
  const fetchIncidents = async () => {
    try {
      setLoading(true)

      const res = await fetch(API_URL)

      if (!res.ok) {
        throw new Error(`HTTP status: ${res.status}`)
      }

      const data = await res.json()

      let list = []

      if (Array.isArray(data)) list = data
      else if (Array.isArray(data.result)) list = data.result
      else if (Array.isArray(data.incidents)) list = data.incidents

      setIncidents(list)
    } catch (err) {
      console.error('FETCH ERROR:', err)
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }

  /* ✅ Only initial load (NO auto refresh) */
  useEffect(() => {
    fetchIncidents()
  }, [])

  /* =========================
     Filtering
  ========================= */
  const filtered = incidents.filter((i) => {
    if (stateFilter !== 'ALL' && i.state !== stateFilter) return false
    if (priorityFilter !== 'ALL' && i.priority !== priorityFilter) return false
    if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false

    if (search) {
      const text =
        (i.number || '') +
        (i.short_description || '') +
        (i.description || '')

      if (!text.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
    }

    return true
  })

  /* Dynamic filter values */
  const states = [...new Set(incidents.map((i) => i.state).filter(Boolean))]
  const priorities = [...new Set(incidents.map((i) => i.priority).filter(Boolean))]
  const severities = [...new Set(incidents.map((i) => i.severity).filter(Boolean))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          background: '#111',
          borderBottom: '1px solid #333',
        }}
      >
        <span style={{ fontSize: 12, color: '#00d4ff' }}>
          INCIDENT DASHBOARD
        </span>

        <span style={{ fontSize: 10, opacity: 0.6 }}>
          {filtered.length} items
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {/* Search */}
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          {/* State filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="ALL">All States</option>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="ALL">All Priority</option>
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="ALL">All Severity</option>
            {severities.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* ✅ Manual Refresh */}
          <button onClick={fetchIncidents} style={btnStyle}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* LIST */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          background: '#0d0d0d',
        }}
      >
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div style={{ color: 'red', padding: 20 }}>
            No incidents received 🚨
          </div>
        ) : (
          filtered.map((item) => (
            <IncidentRow key={item.sys_id || item.id} incident={item} />
          ))
        )}
      </div>
    </div>
  )
}

/* =========================
   Styles
========================= */
const inputStyle = {
  background: '#222',
  border: '1px solid #444',
  color: '#fff',
  fontSize: 11,
  padding: '4px 8px',
  borderRadius: 4,
}

const btnStyle = {
  padding: '4px 8px',
  background: '#00d4ff22',
  border: '1px solid #00d4ff55',
  color: '#00d4ff',
  cursor: 'pointer',
}