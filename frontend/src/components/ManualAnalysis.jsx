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
// import { useState, useEffect } from 'react'
// import { RefreshCcw, Loader, AlertTriangle } from 'lucide-react'
//
// /* ✅ HARD-CODED CONFIG (DEV ONLY) */
// const CONFIG = {
//   baseUrl: 'https://dev388065.service-now.com', // 🔥 replace
//   username: 'admin',
//   password: '=uq3nB-HrVH3',
// }
//
// /* ✅ INCIDENT ROW */
// function IncidentRow({ incident }) {
//   const color =
//     incident.severity === 'CRITICAL' || incident.severity === 'HIGH'
//       ? 'var(--accent-red)'
//       : incident.severity === 'MEDIUM'
//       ? 'var(--accent-orange)'
//       : 'var(--accent-cyan)'
//
//   return (
//     <div
//       style={{
//         padding: '10px 12px',
//         marginBottom: 8,
//         background: 'var(--bg-card)',
//         border: `1px solid ${color}33`,
//         borderLeft: `3px solid ${color}`,
//         borderRadius: 6,
//       }}
//     >
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <span style={{ fontSize: 12, fontWeight: 600, color }}>
//           {incident.severity} — {incident.title}
//         </span>
//         <span
//           style={{
//             fontSize: 10,
//             color: 'var(--text-muted)',
//             fontFamily: 'var(--font-mono)',
//           }}
//         >
//           {incident.status}
//         </span>
//       </div>
//
//       <div
//         style={{
//           fontSize: 11,
//           color: 'var(--text-secondary)',
//           marginTop: 4,
//         }}
//       >
//         {incident.description}
//       </div>
//     </div>
//   )
// }
//
// /* ✅ MAIN COMPONENT */
// export default function IncidentDashboard() {
//   const [incidents, setIncidents] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [severityFilter, setSeverityFilter] = useState('ALL')
//   const [lastUpdated, setLastUpdated] = useState(null)
//
//   /* ✅ FETCH FROM SERVICE */
//   const fetchIncidents = async () => {
//     setLoading(true)
//     setError(null)
//
//     try {
//       const res = await fetch(`${CONFIG.baseUrl}/incidents`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//
//           // ✅ Basic Auth
//           Authorization:
//             'Basic ' +
//             btoa(`${CONFIG.username}:${CONFIG.password}`),
//         },
//       })
//
//       if (!res.ok) throw new Error('Failed to fetch incidents')
//
//       const data = await res.json()
//
//       setIncidents(data)
//       setLastUpdated(new Date())
//
//     } catch (e) {
//       setError(e.message)
//
//       // ✅ fallback to fake data if API not working
//       setIncidents(generateFakeIncidents())
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   /* ✅ AUTO REFRESH */
//   useEffect(() => {
//     fetchIncidents()
//     const interval = setInterval(fetchIncidents, 10000)
//     return () => clearInterval(interval)
//   }, [])
//
//   /* ✅ FILTER */
//   const filteredIncidents =
//     severityFilter === 'ALL'
//       ? incidents
//       : incidents.filter(i => i.severity === severityFilter)
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//       }}
//     >
//       {/* ✅ HEADER */}
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           padding: '10px 16px',
//           borderBottom: '1px solid var(--border)',
//           background: 'var(--bg-elevated)',
//           gap: 10,
//         }}
//       >
//         <AlertTriangle size={14} color="var(--accent-purple)" />
//
//         <span
//           style={{
//             fontSize: 11,
//             fontFamily: 'var(--font-mono)',
//             color: 'var(--text-muted)',
//             letterSpacing: '0.1em',
//           }}
//         >
//           INCIDENT MONITOR
//         </span>
//
//         {/* ✅ FILTER */}
//         <select
//           value={severityFilter}
//           onChange={(e) => setSeverityFilter(e.target.value)}
//           style={{
//             ...btnStyle('muted'),
//             padding: '5px 8px',
//           }}
//         >
//           <option value="ALL">All</option>
//           <option value="CRITICAL">Critical</option>
//           <option value="HIGH">High</option>
//           <option value="MEDIUM">Medium</option>
//           <option value="LOW">Low</option>
//         </select>
//
//         {/* ✅ COUNT */}
//         <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
//           {filteredIncidents.length} incidents
//         </span>
//
//         {/* ✅ LAST REFRESH */}
//         {lastUpdated && (
//           <span
//             style={{
//               fontSize: 10,
//               color: 'var(--text-muted)',
//               fontFamily: 'var(--font-mono)',
//             }}
//           >
//             Last: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//
//         {/* ✅ REFRESH BUTTON */}
//         <div style={{ marginLeft: 'auto' }}>
//           <button
//             onClick={fetchIncidents}
//             disabled={loading}
//             style={{
//               ...btnStyle('purple'),
//               opacity: loading ? 0.6 : 1,
//             }}
//           >
//             {loading ? (
//               <>
//                 <Loader size={10} className="pulse" /> Refreshing…
//               </>
//             ) : (
//               <>
//                 <RefreshCcw size={10} /> Refresh
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//
//       {/* ✅ CONTENT */}
//       <div
//         style={{
//           flex: 1,
//           overflowY: 'auto',
//           padding: 16,
//           background: 'var(--bg-card)',
//         }}
//       >
//         {loading && (
//           <div style={{ textAlign: 'center', padding: 40 }}>
//             <Loader className="pulse" />
//           </div>
//         )}
//
//         {error && (
//           <div
//             style={{
//               padding: 12,
//               background: 'rgba(255,51,85,0.1)',
//               border: '1px solid rgba(255,51,85,0.3)',
//               borderRadius: 6,
//               color: 'var(--accent-red)',
//               fontSize: 12,
//             }}
//           >
//             ⚠ {error} (showing fallback data)
//           </div>
//         )}
//
//         {filteredIncidents.map((incident, i) => (
//           <IncidentRow key={i} incident={incident} />
//         ))}
//       </div>
//     </div>
//   )
// }
//
// /* ✅ BUTTON STYLE */
// function btnStyle(accent) {
//   const colors = {
//     purple: {
//       bg: 'rgba(168,85,247,0.12)',
//       border: 'rgba(168,85,247,0.35)',
//       color: 'var(--accent-purple)',
//     },
//     muted: {
//       bg: 'var(--bg-card)',
//       border: 'var(--border)',
//       color: 'var(--text-muted)',
//     },
//   }
//
//   const c = colors[accent]
//
//   return {
//     display: 'flex',
//     alignItems: 'center',
//     gap: 6,
//     padding: '6px 12px',
//     borderRadius: 6,
//     cursor: 'pointer',
//     background: c.bg,
//     border: `1px solid ${c.border}`,
//     color: c.color,
//     fontFamily: 'var(--font-mono)',
//     fontSize: 11,
//   }
// }
//
// /* ✅ FALLBACK MOCK DATA */
// function generateFakeIncidents() {
//   return [
//     {
//       title: 'Payment outage',
//       description: 'Connection pool exhausted',
//       severity: 'CRITICAL',
//       status: 'OPEN',
//     },
//     {
//       title: 'API latency spike',
//       description: 'Response > 4.8s',
//       severity: 'HIGH',
//       status: 'OPEN',
//     },
//     {
//       title: 'JWT auth failures',
//       description: 'Invalid signatures detected',
//       severity: 'MEDIUM',
//       status: 'INVESTIGATING',
//     },
//   ]
// }


import { useState, useEffect } from 'react'
import { RefreshCcw, Loader, AlertTriangle } from 'lucide-react'

/* ✅ CONFIG — ServiceNow Instance */
const CONFIG = {
  baseUrl: 'https://dev388065.service-now.com', // 🔥 change
  username: 'admin', // 🔥 change
  password: '=uq3nB-HrVH3', // 🔥 change
}

/* ✅ INCIDENT ROW — SHOW EVERYTHING */
function IncidentRow({ incident }) {
  const severity = incident.priority || incident.severity || 'LOW'

  const color =
    severity === '1' || severity === 'CRITICAL' || severity === 'HIGH'
      ? 'var(--accent-red)'
      : severity === '2' || severity === 'MEDIUM'
      ? 'var(--accent-orange)'
      : 'var(--accent-cyan)'

  return (
    <div
      style={{
        padding: '10px 12px',
        marginBottom: 8,
        background: 'var(--bg-card)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 6,
      }}
    >
      {/* ✅ HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>
          {incident.number} — {incident.short_description}
        </span>

        <span
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          {incident.state}
        </span>
      </div>

      {/* ✅ DESCRIPTION */}
      {incident.description && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
            marginTop: 4,
            marginBottom: 6,
          }}
        >
          {incident.description}
        </div>
      )}

      {/* ✅ SHOW ALL FIELDS */}
      <div
        style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          marginTop: 4,
        }}
      >
        {Object.entries(incident).map(([key, value]) => {
          if (
            key === 'number' ||
            key === 'short_description' ||
            key === 'description'
          )
            return null

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                marginBottom: 2,
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ minWidth: 130 }}>{key}:</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {value?.display_value || value?.value || String(value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ✅ MAIN COMPONENT */
export default function IncidentDashboard() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [lastUpdated, setLastUpdated] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /* ✅ FETCH INCIDENTS FROM SERVICENOW */
//   const fetchIncidents = async () => {
//     setLoading(true)
//     setError(null)
//
//     try {
//       const res = await fetch(
//         `${CONFIG.baseUrl}/api/now/table/incident?sysparm_limit=100`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization:
//               'Basic ' +
//               btoa(`${CONFIG.username}:${CONFIG.password}`),
//           },
//         }
//       )
//
//       if (!res.ok) throw new Error('ServiceNow fetch failed')
//
//       const data = await res.json()
//
//       setIncidents(data.result || [])
//       setLastUpdated(new Date())
//
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }

const fetchIncidents = async () => {
  setLoading(true)
  setError(null)

  try {
    const targetUrl = `${CONFIG.baseUrl}/api/now/table/incident`

    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization':
          'Basic ' + btoa(`${CONFIG.username}:${CONFIG.password}`),
        'Accept': 'application/json',
      },
    })

    if (!res.ok) throw new Error('Failed to fetch from ServiceNow')

    const data = await res.json()

    setIncidents(data.result || [])
    setLastUpdated(new Date())

  } catch (e) {
    setError(e.message)
  } finally {
    setLoading(false)
  }
}




  /* ✅ AUTO REFRESH (10s) */
  useEffect(() => {
    fetchIncidents()
    const interval = setInterval(fetchIncidents, 10000)
    return () => clearInterval(interval)
  }, [])

  /* ✅ FILTER */
  const filteredIncidents =
    severityFilter === 'ALL'
      ? incidents
      : incidents.filter(
          (i) =>
            i.priority === severityFilter ||
            i.severity === severityFilter
        )

  /* ✅ PAGINATION */
  const totalPages = Math.ceil(filteredIncidents.length / pageSize)

  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [severityFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ✅ HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          gap: 10,
        }}
      >
        <AlertTriangle size={14} color="var(--accent-purple)" />

        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          SERVICENOW INCIDENTS
        </span>

        {/* ✅ FILTER */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={btnStyle('muted')}
        >
          <option value="ALL">All</option>
          <option value="1">P1</option>
          <option value="2">P2</option>
          <option value="3">P3</option>
          <option value="4">P4</option>
        </select>

        {/* ✅ COUNT */}
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {filteredIncidents.length} incidents
        </span>

        {/* ✅ LAST REFRESH */}
        {lastUpdated && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Last: {lastUpdated.toLocaleTimeString()}
          </span>
        )}

        {/* ✅ REFRESH BUTTON */}
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={fetchIncidents}
            disabled={loading}
            style={{
              ...btnStyle('purple'),
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader size={10} /> Refreshing…
              </>
            ) : (
              <>
                <RefreshCcw size={10} /> Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* ✅ CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          background: 'var(--bg-card)',
        }}
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <Loader className="pulse" />
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 10,
              background: 'rgba(255,0,0,0.1)',
              border: '1px solid red',
              borderRadius: 6,
              color: 'red',
              fontSize: 12,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {paginatedIncidents.map((incident, i) => (
          <IncidentRow key={i} incident={incident} />
        ))}

        {/* ✅ PAGINATION */}
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 10 }}>
            Page {currentPage} / {totalPages || 1}
          </span>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={btnStyle('muted')}
            >
              Prev
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              style={btnStyle('muted')}
            >
              Next
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            style={btnStyle('muted')}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  )
}

/* ✅ BUTTON STYLE */
function btnStyle(accent) {
  const colors = {
    purple: {
      bg: 'rgba(168,85,247,0.12)',
      border: 'rgba(168,85,247,0.35)',
      color: 'var(--accent-purple)',
    },
    muted: {
      bg: 'var(--bg-card)',
      border: 'var(--border)',
      color: 'var(--text-muted)',
    },
  }

  const c = colors[accent]

  return {
    padding: '5px 10px',
    borderRadius: 5,
    cursor: 'pointer',
    background: c.bg,
    border: `1px solid ${c.border}`,
    color: c.color,
    fontSize: 11,
  }
}
