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
//       {/* Important Fields */}
//       <div style={{ fontSize: 10, marginTop: 6, opacity: 0.65 }}>
//         Priority: {incident.priority} | Severity: {incident.severity}
//         <br />
//         Impact: {incident.impact} | Urgency: {incident.urgency}
//         <br />
//         Category: {incident.category}
//         <br />
//         Opened: {incident.opened_at}
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
//   const [priorityFilter, setPriorityFilter] = useState('ALL')
//   const [severityFilter, setSeverityFilter] = useState('ALL')
//
//   /* =========================
//      Fetch API (MANUAL ONLY)
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
//       let list = []
//
//       if (Array.isArray(data)) list = data
//       else if (Array.isArray(data.result)) list = data.result
//       else if (Array.isArray(data.incidents)) list = data.incidents
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
//   /* ✅ Only initial load (NO auto refresh) */
//   useEffect(() => {
//     fetchIncidents()
//   }, [])
//
//   /* =========================
//      Filtering
//   ========================= */
//   const filtered = incidents.filter((i) => {
//     if (stateFilter !== 'ALL' && i.state !== stateFilter) return false
//     if (priorityFilter !== 'ALL' && i.priority !== priorityFilter) return false
//     if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false
//
//     if (search) {
//       const text =
//         (i.number || '') +
//         (i.short_description || '') +
//         (i.description || '')
//
//       if (!text.toLowerCase().includes(search.toLowerCase())) {
//         return false
//       }
//     }
//
//     return true
//   })
//
//   /* Dynamic filter values */
//   const states = [...new Set(incidents.map((i) => i.state).filter(Boolean))]
//   const priorities = [...new Set(incidents.map((i) => i.priority).filter(Boolean))]
//   const severities = [...new Set(incidents.map((i) => i.severity).filter(Boolean))]
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
//             <option value="ALL">All States</option>
//             {states.map((s) => (
//               <option key={s}>{s}</option>
//             ))}
//           </select>
//
//           {/* Priority */}
//           <select
//             value={priorityFilter}
//             onChange={(e) => setPriorityFilter(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="ALL">All Priority</option>
//             {priorities.map((p) => (
//               <option key={p}>{p}</option>
//             ))}
//           </select>
//
//           {/* Severity */}
//           <select
//             value={severityFilter}
//             onChange={(e) => setSeverityFilter(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="ALL">All Severity</option>
//             {severities.map((s) => (
//               <option key={s}>{s}</option>
//             ))}
//           </select>
//
//           {/* ✅ Manual Refresh */}
//           <button onClick={fetchIncidents} style={btnStyle}>
//             <RefreshCw size={14} />
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

//
//
// import { useEffect, useMemo, useRef, useState } from 'react'
// import { Loader, RefreshCw } from 'lucide-react'
//
// const API_URL = 'http://localhost:8080/incidents'
//
// /* =========================
//    Hard-coded services
// ========================= */
// const SERVICES = [
//   'api-gateway',
//   'auth-service',
//   'payment-service',
//   'inventory-service',
//   'notification-service',
//   'db-proxy',
// ]
//
// /* =========================
//    Hard-coded patch updates
//    (No repo names, no extra mentions)
// ========================= */
// const PATCHES_BY_SERVICE = {
//   'db-proxy': [
//     {
//       seq: 1,
//       ts: '2026-05-14T11:12:40+05:30',
//       type: 'PATCH_PROPOSED',
//       service: 'db-proxy',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-dbplatform',
//       summary: 'Propose raising memory limit to avoid repeated OOMKills',
//       details: { from: '512Mi', to: '1024Mi', reason: 'OOMKilled x3 in 6m' },
//     },
//     {
//       seq: 2,
//       ts: '2026-05-14T11:18:30+05:30',
//       type: 'PATCH_APPLIED',
//       service: 'db-proxy',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'kubectl-breakglass',
//       summary: 'Applied live patch to deployment',
//       details: {
//         cluster: 'aks-prod-scus-01',
//         namespace: 'platform',
//         resource: 'deployment/db-proxy',
//         resourceVersionBefore: '9011221',
//         resourceVersionAfter: '9011307',
//         rollout: { started: '11:18:34', completed: '11:21:05' },
//         changes: [
//           'limits.memory: 512Mi → 1024Mi',
//           'DBP_MAX_PENDING: 1200 → 900',
//         ],
//       },
//     },
//     {
//       seq: 3,
//       ts: '2026-05-14T11:21:40+05:30',
//       type: 'PATCH_VERIFIED',
//       service: 'db-proxy',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'incident-commander',
//       summary: 'OOMKills stopped; pool saturation reduced; connections stabilized',
//       details: { oomKillsLast10m: 0, pendingQueue: 'normal', p95Latency: 'improving' },
//     },
//   ],
//
//   'auth-service': [
//     {
//       seq: 1,
//       ts: '2026-05-14T11:00:22+05:30',
//       type: 'CONFIG_PATCH_APPLIED',
//       service: 'auth-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'argo-sync',
//       summary: 'Cache TTL reduced (rotation window)',
//       details: { key: 'AUTH_JWKS_CACHE_TTL_SECONDS', from: '300', to: '30' },
//     },
//     {
//       seq: 2,
//       ts: '2026-05-14T11:22:10+05:30',
//       type: 'PATCH_PROPOSED',
//       service: 'auth-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-identity',
//       summary: 'Propose increasing cache TTL to mitigate refresh storm',
//       details: { key: 'AUTH_JWKS_CACHE_TTL_SECONDS', from: '30', to: '180' },
//     },
//     {
//       seq: 3,
//       ts: '2026-05-14T11:26:10+05:30',
//       type: 'PATCH_APPLIED',
//       service: 'auth-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'argo-sync',
//       summary: 'Config patched; rollout restart triggered',
//       details: { key: 'AUTH_JWKS_CACHE_TTL_SECONDS', from: '30', to: '180', podsRestarted: 10 },
//     },
//     {
//       seq: 4,
//       ts: '2026-05-14T11:29:40+05:30',
//       type: 'PATCH_VERIFIED',
//       service: 'auth-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'incident-commander',
//       summary: 'Auth 5xx reduced; token validation stable',
//       details: { auth5xx: '1.2%', timeouts: 'baseline' },
//     },
//   ],
//
//   'api-gateway': [
//     {
//       seq: 1,
//       ts: '2026-05-14T10:49:40+05:30',
//       type: 'FEATURE_FLAG_PATCH',
//       service: 'api-gateway',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'ops-console',
//       summary: 'Enable upstream timeout guardrails',
//       details: { flag: 'EDGE_TIMEOUT_GUARDRAILS', from: 'off', to: 'on' },
//     },
//     {
//       seq: 2,
//       ts: '2026-05-14T11:09:55+05:30',
//       type: 'MITIGATION',
//       service: 'api-gateway',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-edge',
//       summary: 'Reduce retry burst and extend upstream timeout briefly',
//       details: { retries: '2 → 1', upstreamTimeoutMs: '800 → 1200', note: 'temporary during recovery' },
//     },
//     {
//       seq: 3,
//       ts: '2026-05-14T11:33:05+05:30',
//       type: 'PATCH_VERIFIED',
//       service: 'api-gateway',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'incident-commander',
//       summary: 'Gateway latency and error rate back to baseline',
//       details: { gatewayP95: '185ms', errorRate: 'normal' },
//     },
//   ],
//
//   'payment-service': [
//     {
//       seq: 1,
//       ts: '2026-05-14T11:10:20+05:30',
//       type: 'MITIGATION',
//       service: 'payment-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-payments',
//       summary: 'Temporarily raise circuit-breaker threshold to reduce cascading failures',
//       details: { cbThreshold: 'default → relaxed', duration: '15m' },
//     },
//     {
//       seq: 2,
//       ts: '2026-05-14T11:27:30+05:30',
//       type: 'PATCH_VERIFIED',
//       service: 'payment-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-payments',
//       summary: 'Payment requests stabilized after upstream recovery',
//       details: { failureRate: 'baseline', timeouts: 'baseline' },
//     },
//   ],
//
//   'inventory-service': [
//     {
//       seq: 1,
//       ts: '2026-05-14T11:14:15+05:30',
//       type: 'PATCH_PROPOSED',
//       service: 'inventory-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-supply',
//       summary: 'Propose increasing worker concurrency during incident window',
//       details: { workers: '8 → 14', reason: 'backlog protection' },
//     },
//     {
//       seq: 2,
//       ts: '2026-05-14T11:20:55+05:30',
//       type: 'PATCH_APPLIED',
//       service: 'inventory-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'argo-sync',
//       summary: 'Applied concurrency increase',
//       details: { workers: '8 → 14', rollout: 'rolling' },
//     },
//   ],
//
//   'notification-service': [
//     {
//       seq: 1,
//       ts: '2026-05-14T11:16:45+05:30',
//       type: 'MITIGATION',
//       service: 'notification-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-messaging',
//       summary: 'Throttle non-critical notifications to keep critical path clear',
//       details: { throttle: 'non-critical', duration: '20m' },
//     },
//     {
//       seq: 2,
//       ts: '2026-05-14T11:31:10+05:30',
//       type: 'PATCH_VERIFIED',
//       service: 'notification-service',
//       incidentId: 'INC-2026-0514-001',
//       actor: 'oncall-messaging',
//       summary: 'Queue depth recovered; consumer lag normal',
//       details: { lag: 'baseline' },
//     },
//   ],
// }
//
// /* =========================
//    Incident Card (unchanged)
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
//         <div style={{ fontSize: 10, opacity: 0.7 }}>{incident.state}</div>
//       </div>
//
//       {/* Description */}
//       <div style={{ fontSize: 11, marginTop: 5, opacity: 0.8 }}>
//         {incident.description}
//       </div>
//
//       {/* Important Fields */}
//       <div style={{ fontSize: 10, marginTop: 6, opacity: 0.65 }}>
//         Priority: {incident.priority} | Severity: {incident.severity}
//         <br />
//         Impact: {incident.impact} | Urgency: {incident.urgency}
//         <br />
//         Category: {incident.category}
//         <br />
//         Opened: {incident.opened_at}
//       </div>
//     </div>
//   )
// }
//
// /* =========================
//    Patch Card
// ========================= */
// function PatchRow({ patch }) {
//   const type = (patch.type || '').toUpperCase()
//
//   const color =
//     type.includes('APPLIED')
//       ? '#00d4ff'
//       : type.includes('PROPOSED')
//       ? '#ff9f40'
//       : type.includes('VERIFIED')
//       ? '#00d48a'
//       : type.includes('FAILED')
//       ? '#ff3355'
//       : '#999'
//
//   return (
//     <div
//       style={{
//         padding: '10px',
//         marginBottom: 8,
//         background: '#1a1a1a',
//         border: `1px solid ${color}55`,
//         borderLeft: `4px solid ${color}`,
//         borderRadius: 6,
//         color: '#fff',
//       }}
//     >
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <div style={{ fontSize: 11, fontWeight: 700, color }}>
//           {type || 'PATCH'}
//         </div>
//         <div style={{ fontSize: 10, opacity: 0.65 }}>{patch.ts}</div>
//       </div>
//
//       <div style={{ fontSize: 11, marginTop: 6, opacity: 0.9 }}>
//         {patch.summary}
//       </div>
//
//       <div style={{ fontSize: 10, marginTop: 6, opacity: 0.65 }}>
//         By: {patch.actor || 'system'}
//         {patch.incidentId ? ` | ${patch.incidentId}` : ''}
//       </div>
//
//       {/* Compact details (optional) */}
//       {patch.details && (
//         <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6, lineHeight: 1.35 }}>
//           {renderDetails(patch.details)}
//         </div>
//       )}
//     </div>
//   )
// }
//
// function renderDetails(details) {
//   // Render nicely without blowing up UI
//   if (!details) return null
//   if (typeof details === 'string') return details
//
//   // If it's an array, join
//   if (Array.isArray(details)) {
//     return details.map((x, idx) => <div key={idx}>• {String(x)}</div>)
//   }
//
//   // Object: show key lines
//   return Object.entries(details).map(([k, v]) => {
//     if (v && typeof v === 'object') {
//       return (
//         <div key={k} style={{ marginTop: 4 }}>
//           <div style={{ color: '#00d4ff', opacity: 0.85 }}>{k}:</div>
//           <div style={{ marginLeft: 10 }}>{renderDetails(v)}</div>
//         </div>
//       )
//     }
//     return (
//       <div key={k}>
//         • {k}: {String(v)}
//       </div>
//     )
//   })
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
//   const [priorityFilter, setPriorityFilter] = useState('ALL')
//   const [severityFilter, setSeverityFilter] = useState('ALL')
//
//   // Right panel
//   const [rightTab, setRightTab] = useState('PATCHES') // PATCHES | DETAILS
//   const [selectedService, setSelectedService] = useState('api-gateway')
//   const [live, setLive] = useState(true)
//
//   // Patches state (hard-coded + realtime simulation)
//   const [patches, setPatches] = useState(PATCHES_BY_SERVICE['api-gateway'] || [])
//   const liveTimerRef = useRef(null)
//
//   /* =========================
//      Fetch API (MANUAL ONLY)
//   ========================= */
//   const fetchIncidents = async () => {
//     try {
//       setLoading(true)
//
//       const res = await fetch(API_URL)
//       if (!res.ok) throw new Error(`HTTP status: ${res.status}`)
//
//       const data = await res.json()
//
//       let list = []
//       if (Array.isArray(data)) list = data
//       else if (Array.isArray(data.result)) list = data.result
//       else if (Array.isArray(data.incidents)) list = data.incidents
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
//   /* ✅ Only initial load (NO auto refresh) */
//   useEffect(() => {
//     fetchIncidents()
//   }, [])
//
//   /* =========================
//      Filtering
//   ========================= */
//   const filtered = incidents.filter((i) => {
//     if (stateFilter !== 'ALL' && i.state !== stateFilter) return false
//     if (priorityFilter !== 'ALL' && i.priority !== priorityFilter) return false
//     if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false
//
//     if (search) {
//       const text = (i.number || '') + (i.short_description || '') + (i.description || '')
//       if (!text.toLowerCase().includes(search.toLowerCase())) return false
//     }
//
//     return true
//   })
//
//   /* Dynamic filter values */
//   const states = [...new Set(incidents.map((i) => i.state).filter(Boolean))]
//   const priorities = [...new Set(incidents.map((i) => i.priority).filter(Boolean))]
//   const severities = [...new Set(incidents.map((i) => i.severity).filter(Boolean))]
//
//   /* =========================
//      Update patches when service changes
//   ========================= */
//   useEffect(() => {
//     setPatches(PATCHES_BY_SERVICE[selectedService] || [])
//   }, [selectedService])
//
//   /* =========================
//      Simulated real-time patch updates
//      - Adds a new patch event periodically when LIVE is on
// ========================= */
//   useEffect(() => {
//     // Clear old timer
//     if (liveTimerRef.current) {
//       clearInterval(liveTimerRef.current)
//       liveTimerRef.current = null
//     }
//
//     // Only run on PATCHES tab + live enabled
//     if (!live || rightTab !== 'PATCHES') return
//
//     liveTimerRef.current = setInterval(() => {
//       setPatches((prev) => {
//         const lastSeq = prev.reduce((m, p) => Math.max(m, p.seq || 0), 0)
//         const now = new Date()
//         const pad = (n) => String(n).padStart(2, '0')
//         const ts =
//           `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
//           `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}+05:30`
//
//         const simulated = {
//           seq: lastSeq + 1,
//           ts,
//           type: 'PATCH_UPDATE',
//           service: selectedService,
//           incidentId: 'INC-2026-0514-001',
//           actor: 'live-monitor',
//           summary: 'Live patch status update received',
//           details: { note: 'stream update', status: 'ok' },
//         }
//
//         // Keep list from growing forever
//         const next = [...prev, simulated]
//         return next.length > 60 ? next.slice(next.length - 60) : next
//       })
//     }, 8000)
//
//     return () => {
//       if (liveTimerRef.current) {
//         clearInterval(liveTimerRef.current)
//         liveTimerRef.current = null
//       }
//     }
//   }, [live, rightTab, selectedService])
//
//   const serviceOptions = useMemo(() => SERVICES, [])
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
//         <span style={{ fontSize: 12, color: '#00d4ff' }}>INCIDENT DASHBOARD</span>
//
//         <span style={{ fontSize: 10, opacity: 0.6 }}>{filtered.length} items</span>
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
//             <option value="ALL">All States</option>
//             {states.map((s) => (
//               <option key={s}>{s}</option>
//             ))}
//           </select>
//
//           {/* Priority */}
//           <select
//             value={priorityFilter}
//             onChange={(e) => setPriorityFilter(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="ALL">All Priority</option>
//             {priorities.map((p) => (
//               <option key={p}>{p}</option>
//             ))}
//           </select>
//
//           {/* Severity */}
//           <select
//             value={severityFilter}
//             onChange={(e) => setSeverityFilter(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="ALL">All Severity</option>
//             {severities.map((s) => (
//               <option key={s}>{s}</option>
//             ))}
//           </select>
//
//           {/* ✅ Manual Refresh */}
//           <button onClick={fetchIncidents} style={btnStyle} title="Refresh incidents">
//             <RefreshCw size={14} />
//           </button>
//         </div>
//       </div>
//
//       {/* BODY: Left list + Right panel */}
//       <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
//         {/* LEFT LIST */}
//         <div
//           style={{
//             flex: 1,
//             overflowY: 'auto',
//             padding: 12,
//             background: '#0d0d0d',
//           }}
//         >
//           {loading ? (
//             <Loader />
//           ) : filtered.length === 0 ? (
//             <div style={{ color: 'red', padding: 20 }}>No incidents received 🚨</div>
//           ) : (
//             filtered.map((item) => (
//               <IncidentRow key={item.sys_id || item.id || item.number} incident={item} />
//             ))
//           )}
//         </div>
//
//         {/* RIGHT PANEL */}
//         <div
//           style={{
//             width: 360,
//             borderLeft: '1px solid #333',
//             background: '#101010',
//             display: 'flex',
//             flexDirection: 'column',
//             minHeight: 0,
//           }}
//         >
//           {/* Right header + tabs */}
//           <div
//             style={{
//               padding: '10px 12px',
//               borderBottom: '1px solid #333',
//               background: '#111',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//             }}
//           >
//             <button
//               onClick={() => setRightTab('PATCHES')}
//               style={{
//                 ...tabBtnStyle,
//                 borderColor: rightTab === 'PATCHES' ? '#00d4ff55' : '#333',
//                 color: rightTab === 'PATCHES' ? '#00d4ff' : '#aaa',
//                 background: rightTab === 'PATCHES' ? '#00d4ff22' : 'transparent',
//               }}
//             >
//               PATCHES
//             </button>
//
//
//
//             <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
//               <button
//                 onClick={() => setLive((v) => !v)}
//                 style={{
//                   ...btnStyle,
//                   padding: '4px 8px',
//                   borderColor: live ? '#00d48a55' : '#ff335555',
//                   color: live ? '#00d48a' : '#ff3355',
//                   background: live ? '#00d48a22' : '#ff335522',
//                   opacity: rightTab === 'PATCHES' ? 1 : 0.55,
//                 }}
//                 disabled={rightTab !== 'PATCHES'}
//                 title="Toggle live patch updates"
//               >
//                 {live ? 'LIVE' : 'PAUSED'}
//               </button>
//             </div>
//           </div>
//
//           {/* Service dropdown (only in PATCHES tab) */}
//           {rightTab === 'PATCHES' && (
//             <div
//               style={{
//                 padding: 12,
//                 borderBottom: '1px solid #222',
//                 display: 'flex',
//                 gap: 8,
//                 alignItems: 'center',
//               }}
//             >
//               <select
//                 value={selectedService}
//                 onChange={(e) => setSelectedService(e.target.value)}
//                 style={{ ...inputStyle, flex: 1 }}
//               >
//                 {serviceOptions.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//
//               <button
//                 onClick={() => setPatches(PATCHES_BY_SERVICE[selectedService] || [])}
//                 style={btnStyle}
//                 title="Reset to base patch list"
//               >
//                 <RefreshCw size={14} />
//               </button>
//             </div>
//           )}
//
//           {/* Right content */}
//           <div style={{ flex: 1, overflowY: 'auto', padding: 12, minHeight: 0 }}>
//             {rightTab === 'PATCHES' ? (
//               patches.length === 0 ? (
//                 <div style={{ color: '#aaa', fontSize: 11, padding: 8 }}>
//                   No patch updates for <span style={{ color: '#00d4ff' }}>{selectedService}</span>
//                 </div>
//               ) : (
//                 patches
//                   .slice()
//                   .sort((a, b) => (b.seq || 0) - (a.seq || 0))
//                   .map((p) => (
//                     <PatchRow key={`${p.service}-${p.seq}-${p.ts}`} patch={p} />
//                   ))
//               )
//             ) : (
//               <div style={{ color: '#fff' }}>
//                 <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>
//                   Selected service context
//                 </div>
//
//                 <div
//                   style={{
//                     padding: 10,
//                     background: '#1a1a1a',
//                     border: '1px solid #333',
//                     borderRadius: 6,
//                     fontSize: 11,
//                     opacity: 0.85,
//                     lineHeight: 1.5,
//                   }}
//                 >
//                   <div>
//                     Service: <span style={{ color: '#00d4ff' }}>{selectedService}</span>
//                   </div>
//                   <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
//                     This panel is kept minimal to preserve layout. If your incident payload
//                     includes a service field, we can show linked incidents here as well.
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//
//           {/* Footer */}
//           <div
//             style={{
//               padding: '8px 12px',
//               borderTop: '1px solid #222',
//               fontSize: 10,
//               opacity: 0.7,
//               background: '#0f0f0f',
//               color: '#fff',
//               display: 'flex',
//               justifyContent: 'space-between',
//             }}
//           >
//             <span>Service: {selectedService}</span>
//             <span>{live && rightTab === 'PATCHES' ? 'Realtime on' : 'Realtime off'}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
//
// /* =========================
//    Styles (same look)
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
//   borderRadius: 4,
// }
//
// const tabBtnStyle = {
//   padding: '6px 10px',
//   border: '1px solid #333',
//   borderRadius: 6,
//   background: 'transparent',
//   cursor: 'pointer',
//   fontSize: 10,
//   letterSpacing: 0.4,
// }


import { useEffect, useMemo, useState } from 'react'
import { Loader, RefreshCw } from 'lucide-react'

const API_URL = 'http://localhost:8080/incidents'

/* =========================
   Hard-coded services
========================= */
const SERVICES = [
  'api-gateway',
  'auth-service',
  'payment-service',
  'inventory-service',
  'notification-service',
  'db-proxy',
]

/* =========================
   Hard-coded Knowledge Base
   Map service -> KB articles
   (api-gateway + notification-service intentionally have NO mapping)
========================= */
const KB_BY_SERVICE = {
  'auth-service': [
    {
      title: 'Runbook: auth-service OutOfMemoryError (heap 98%)',
      number: 'KB0010019',
      sys_id: 'ca888d4b8374835033d96160ceaad3ae',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010019',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=ca888d4b8374835033d96160ceaad3ae',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=ca888d4b8374835033d96160ceaad3ae',
    },
    {
      title: 'Runbook: JWT key rotation mismatch (kid not found)',
      number: 'KB0010020',
      sys_id: '9688058b8374835033d96160ceaad374',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010020',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=9688058b8374835033d96160ceaad374',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=9688058b8374835033d96160ceaad374',
    },
    {
      title: 'Runbook: invalid JWT signature from suspicious IP',
      number: 'KB0010021',
      sys_id: '2e8841038374835033d96160ceaad354',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010021',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=2e8841038374835033d96160ceaad354',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=2e8841038374835033d96160ceaad354',
    },
    {
      title: 'Runbook: bcrypt cost mismatch during password verification',
      number: 'KB0010022',
      sys_id: '4b88058b8374835033d96160ceaad3b5',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010022',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=4b88058b8374835033d96160ceaad3b5',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=4b88058b8374835033d96160ceaad3b5',
    },
  ],

  'payment-service': [
    {
      title: 'Runbook: AML ruleset compile error',
      number: 'KB0010023',
      sys_id: '4388458b8374835033d96160ceaad37a',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010023',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=4388458b8374835033d96160ceaad37a',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=4388458b8374835033d96160ceaad37a',
    },
    {
      title: 'Runbook: Saga compensation (payment succeeded, inventory reservation failed)',
      number: 'KB0010028',
      sys_id: 'a098c58b8374835033d96160ceaad308',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010028',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=a098c58b8374835033d96160ceaad308',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=a098c58b8374835033d96160ceaad308',
    },
    {
      title: 'Runbook: Risk engine timeout → SAFE_MODE',
      number: 'KB0010029',
      sys_id: 'b498c58b8374835033d96160ceaad337',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010029',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=b498c58b8374835033d96160ceaad337',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=b498c58b8374835033d96160ceaad337',
    },
    {
      title: 'Runbook: Circuit breaker OPEN for payment-gateway',
      number: 'KB0010030',
      sys_id: 'c598c58b8374835033d96160ceaad341',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010030',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=c598c58b8374835033d96160ceaad341',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=c598c58b8374835033d96160ceaad341',
    },
    {
      title: 'Runbook: Payment capture timeout (45s)',
      number: 'KB0010031',
      sys_id: '5998c58b8374835033d96160ceaad389',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010031',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=5998c58b8374835033d96160ceaad389',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=5998c58b8374835033d96160ceaad389',
    },
    {
      title: 'Runbook: payment-service 503 from inventory-service',
      number: 'KB0010032',
      sys_id: 'e998c58b8374835033d96160ceaad3d1',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010032',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=e998c58b8374835033d96160ceaad3d1',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=e998c58b8374835033d96160ceaad3d1',
    },
    {
      title: 'Runbook: Idempotency key replay detected (cached result)',
      number: 'KB0010033',
      sys_id: '8298098b8374835033d96160ceaad33f',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010033',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=8298098b8374835033d96160ceaad33f',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=8298098b8374835033d96160ceaad33f',
    },
  ],

  'inventory-service': [
    {
      title: 'Runbook: Inventory cache stale (lastRefresh=18m)',
      number: 'KB0010025',
      sys_id: 'fb88458b8374835033d96160ceaad3d8',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010025',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=fb88458b8374835033d96160ceaad3d8',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=fb88458b8374835033d96160ceaad3d8',
    },
  ],

  'db-proxy': [
    {
      title: 'Runbook: Slow SQL update detected (~9s)',
      number: 'KB0010024',
      sys_id: 'ab88458b8374835033d96160ceaad3ce',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010024',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=ab88458b8374835033d96160ceaad3ce',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=ab88458b8374835033d96160ceaad3ce',
    },
    {
      title: 'Runbook: Replication lag high (12.4s, reads switched to primary)',
      number: 'KB0010026',
      sys_id: '0898458b8374835033d96160ceaad3fb',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010026',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=0898458b8374835033d96160ceaad3fb',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=0898458b8374835033d96160ceaad3fb',
    },
    {
      title: 'Runbook: Database connection refused (db-primary:5432)',
      number: 'KB0010027',
      sys_id: '1898858b8374835033d96160ceaad35c',
      portal:
        'https://dev388065.service-now.com/sp?id=kb_article_view&sysparm_article=KB0010027',
      form:
        'https://dev388065.service-now.com/kb_knowledge.do?sys_id=1898858b8374835033d96160ceaad35c',
      view:
        'https://dev388065.service-now.com/kb_view.do?sys_kb_id=1898858b8374835033d96160ceaad35c',
    },
  ],
}

/* =========================
   Incident Card (unchanged)
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
        <div style={{ fontSize: 10, opacity: 0.7 }}>{incident.state}</div>
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
   Knowledge Base Card
========================= */
function KnowledgeBaseRow({ kb }) {
  return (
    <div
      style={{
        padding: '10px',
        marginBottom: 8,
        background: '#1a1a1a',
        border: '1px solid #00d4ff55',
        borderLeft: '4px solid #00d4ff',
        borderRadius: 6,
        color: '#fff',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700 }}>
        {kb.number} — {kb.title}
      </div>

      <div style={{ fontSize: 10, marginTop: 6, opacity: 0.75 }}>
        sys_id: {kb.sys_id}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <a href={kb.portal} target="_blank" rel="noreferrer" style={linkBtnStyle}>
          Portal
        </a>
        <a href={kb.form} target="_blank" rel="noreferrer" style={linkBtnStyle}>
          Form
        </a>
        <a href={kb.view} target="_blank" rel="noreferrer" style={linkBtnStyle}>
          View
        </a>
      </div>
    </div>
  )
}

/* =========================
   Main Component
========================= */
export default function ManualAnalysis() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  // Right panel
  const [rightTab, setRightTab] = useState('KNOWLEDGE_BASE') // KNOWLEDGE_BASE | DETAILS
  const [selectedService, setSelectedService] = useState('api-gateway')

  // KB state
  const [kbItems, setKbItems] = useState(KB_BY_SERVICE['api-gateway'] || [])

  /* =========================
     Fetch API (MANUAL ONLY)
  ========================= */
  const fetchIncidents = async () => {
    try {
      setLoading(true)

      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`HTTP status: ${res.status}`)

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
      const text = (i.number || '') + (i.short_description || '') + (i.description || '')
      if (!text.toLowerCase().includes(search.toLowerCase())) return false
    }

    return true
  })

  /* Dynamic filter values */
  const states = [...new Set(incidents.map((i) => i.state).filter(Boolean))]
  const priorities = [...new Set(incidents.map((i) => i.priority).filter(Boolean))]
  const severities = [...new Set(incidents.map((i) => i.severity).filter(Boolean))]

  /* =========================
     Update KB list when service changes
  ========================= */
  useEffect(() => {
    setKbItems(KB_BY_SERVICE[selectedService] || [])
  }, [selectedService])

  const serviceOptions = useMemo(() => SERVICES, [])

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
        <span style={{ fontSize: 12, color: '#00d4ff' }}>INCIDENT DASHBOARD</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{filtered.length} items</span>

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
          <button onClick={fetchIncidents} style={btnStyle} title="Refresh incidents">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* BODY: Left list + Right panel */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* LEFT LIST */}
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
            <div style={{ color: 'red', padding: 20 }}>No incidents received 🚨</div>
          ) : (
            filtered.map((item) => (
              <IncidentRow key={item.sys_id || item.id || item.number} incident={item} />
            ))
          )}
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            width: 360,
            borderLeft: '1px solid #333',
            background: '#101010',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {/* Right header + tabs */}
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #333',
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button
              onClick={() => setRightTab('KNOWLEDGE_BASE')}
              style={{
                ...tabBtnStyle,
                borderColor: rightTab === 'KNOWLEDGE_BASE' ? '#00d4ff55' : '#333',
                color: rightTab === 'KNOWLEDGE_BASE' ? '#00d4ff' : '#aaa',
                background: rightTab === 'KNOWLEDGE_BASE' ? '#00d4ff22' : 'transparent',
              }}
            >
              KNOWLEDGE BASE
            </button>

{/*             <button */}
{/*               onClick={() => setRightTab('DETAILS')} */}
{/*               style={{ */}
{/*                 ...tabBtnStyle, */}
{/*                 borderColor: rightTab === 'DETAILS' ? '#00d4ff55' : '#333', */}
{/*                 color: rightTab === 'DETAILS' ? '#00d4ff' : '#aaa', */}
{/*                 background: rightTab === 'DETAILS' ? '#00d4ff22' : 'transparent', */}
{/*               }} */}
{/*             > */}
{/*               DETAILS */}
{/*             </button> */}
          </div>

          {/* Service dropdown (only in KB tab) */}
          {rightTab === 'KNOWLEDGE_BASE' && (
            <div
              style={{
                padding: 12,
                borderBottom: '1px solid #222',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              >
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setKbItems(KB_BY_SERVICE[selectedService] || [])}
                style={btnStyle}
                title="Reset KB list"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}

          {/* Right content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, minHeight: 0 }}>
            {rightTab === 'KNOWLEDGE_BASE' ? (
              kbItems.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 11, padding: 8 }}>
                  No Knowledge Base articles for{' '}
                  <span style={{ color: '#00d4ff' }}>{selectedService}</span>
                </div>
              ) : (
                kbItems.map((kb) => (
                  <KnowledgeBaseRow key={`${kb.number}-${kb.sys_id}`} kb={kb} />
                ))
              )
            ) : (
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>
                  Selected service context
                </div>

                <div
                  style={{
                    padding: 10,
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: 6,
                    fontSize: 11,
                    opacity: 0.85,
                    lineHeight: 1.5,
                  }}
                >
                  <div>
                    Service: <span style={{ color: '#00d4ff' }}>{selectedService}</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
                    This panel is kept minimal to preserve layout. If your incident payload
                    includes a service field, we can show linked incidents here as well.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid #222',
              fontSize: 10,
              opacity: 0.7,
              background: '#0f0f0f',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Service: {selectedService}</span>
            <span>{rightTab === 'KNOWLEDGE_BASE' ? 'KB view' : 'Details view'}</span>
          </div>
        </div>
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
  borderRadius: 4,
}

const tabBtnStyle = {
  padding: '6px 10px',
  border: '1px solid #333',
  borderRadius: 6,
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 10,
  letterSpacing: 0.4,
}

const linkBtnStyle = {
  padding: '4px 8px',
  background: '#00d4ff22',
  border: '1px solid #00d4ff55',
  color: '#00d4ff',
  cursor: 'pointer',
  borderRadius: 4,
  fontSize: 10,
  textDecoration: 'none',
}