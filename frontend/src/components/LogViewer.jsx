import { useState, useRef, useEffect } from 'react'
import { Search, Filter, Download } from 'lucide-react'

const LEVEL_STYLES = {
  ERROR:    { color: 'var(--accent-red)',    bg: 'rgba(255,51,85,0.06)' },
  CRITICAL: { color: 'var(--accent-red)',    bg: 'rgba(255,51,85,0.10)' },
  WARN:     { color: 'var(--accent-orange)', bg: 'rgba(255,122,0,0.06)' },
  INFO:     { color: 'var(--accent-cyan)',   bg: 'transparent' },
  DEBUG:    { color: 'var(--text-muted)',    bg: 'transparent' },
}

function LogRow({ log }) {
  const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO
  const ts = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '75px 60px 150px 1fr',
      gap: 8,
      padding: '3px 12px',
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      lineHeight: 1.5,
      background: style.bg,
      borderBottom: '1px solid rgba(29,45,69,0.3)',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{ts}</span>
      <span style={{ color: style.color, fontWeight: 600 }}>{log.level}</span>
      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {log.service}
      </span>
      <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{log.message}</span>
    </div>
  )
}

export default function LogViewer({ logs }) {
  const [filter, setFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [autoScroll, setAutoScroll] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const filtered = logs.filter(l => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false
    if (filter && !l.message.toLowerCase().includes(filter.toLowerCase()) &&
        !l.service.toLowerCase().includes(filter.toLowerCase())) return false
    return true
  })

  const exportLogs = () => {
    const text = filtered.map(l =>
      `${l.timestamp} [${l.level}] ${l.service}: ${l.message}`
    ).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `logs-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter logs …"
            style={{
              width: '100%', padding: '5px 10px 5px 28px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 4, color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none',
            }}
          />
        </div>

        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          style={{
            padding: '5px 8px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4,
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
            fontSize: 12, outline: 'none', cursor: 'pointer',
          }}
        >
          {['ALL', 'ERROR', 'CRITICAL', 'WARN', 'INFO', 'DEBUG'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          style={{
            padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
            background: autoScroll ? 'rgba(0,212,255,0.12)' : 'var(--bg-card)',
            border: `1px solid ${autoScroll ? 'var(--accent-cyan)' : 'var(--border)'}`,
            color: autoScroll ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 11,
          }}
        >
          {autoScroll ? '⏬ AUTO' : '⏸ PAUSED'}
        </button>

        <button
          onClick={exportLogs}
          style={{
            padding: '5px 8px', borderRadius: 4, cursor: 'pointer',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
          }}
          title="Export logs"
        >
          <Download size={12} />
        </button>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          {filtered.length}/{logs.length}
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '75px 60px 150px 1fr',
        gap: 8, padding: '4px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)', flexShrink: 0,
      }}>
        {['TIME', 'LEVEL', 'SERVICE', 'MESSAGE'].map(h => (
          <span key={h} style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Log rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            No logs match your filter.
          </div>
        ) : (
          filtered.map((log, i) => <LogRow key={log.id ?? i} log={log} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}



//
// import { useState, useRef, useEffect } from 'react'
// import {
//   Search,
//   Download,
//   Brain,
//   AlertTriangle,
// } from 'lucide-react'
//
// const sampleLogs = [
//   {
//     id: 1,
//     timestamp: '2026-05-07T10:14:22.981Z',
//     level: 'ERROR',
//     service: 'api-gateway',
//     message: `
// 2026-05-07T10:14:22.981Z INFO [api-gateway]
// traceId=8fd2a7c1b9a94d22
// upstreamService=inventory-service
// upstreamLatencyMs=402
// retryCount=3
// circuitBreakerState=OPEN
// responseStatus=502
// errorCode=UPSTREAM_SERVICE_UNAVAILABLE
// failureReason="inventory-service did not respond within timeout threshold"
// message="Gateway failed to route request due to upstream service instability"
// `
//   },
//
//   {
//     id: 2,
//     timestamp: '2026-05-07T10:16:03.127Z',
//     level: 'WARN',
//     service: 'auth-service',
//     message: `
// 2026-05-07T10:16:03.127Z WARN [auth-service]
// tokenValidationStatus=FAILED
// failureReason="JWT signature mismatch"
// riskScore=91
// threatCategory=POTENTIAL_TOKEN_TAMPERING
// responseStatus=401
// message="Authentication request blocked due to invalid JWT signature validation"
// `
//   },
//
//   {
//     id: 3,
//     timestamp: '2026-05-07T10:19:44.512Z',
//     level: 'ERROR',
//     service: 'payment-service',
//     message: `
// 2026-05-07T10:19:44.512Z ERROR [payment-service]
// paymentProvider=Stripe
// externalApiLatencyMs=5221
// timeoutThresholdMs=5000
// providerResponseCode=504
// providerStatus=TIMEOUT
// rollbackStatus=SUCCESS
// responseStatus=FAILED
// errorCode=PAYMENT_PROVIDER_TIMEOUT
// message="Payment authorization failed because external provider exceeded SLA timeout"
// `
//   },
//
//   {
//     id: 4,
//     timestamp: '2026-05-07T10:23:11.008Z',
//     level: 'CRITICAL',
//     service: 'inventory-service',
//     message: `
// 2026-05-07T10:23:11.008Z ERROR [inventory-service]
// transactionIsolation=SERIALIZABLE
// lockWaitMs=2201
// deadlockDetected=true
// sqlState=40P01
// cacheMiss=true
// threadPoolUtilization=92%
// cpuUsagePercent=87
// message="Inventory reservation transaction aborted because of database deadlock conflict"
// `
//   },
//
//   {
//     id: 5,
//     timestamp: '2026-05-07T10:25:51.771Z',
//     level: 'WARN',
//     service: 'notification-service',
//     message: `
// 2026-05-07T10:25:51.771Z WARN [notification-service]
// provider=SendGrid
// smtpProviderStatus=THROTTLED
// emailQueueDepth=18821
// processingDelayMs=9211
// messagesProcessedPerMinute=811
// messagesIncomingPerMinute=4412
// deliveryStatus=DELAYED
// message="Email delivery delayed because provider rate limits exceeded configured thresholds"
// `
//   },
//
//   {
//     id: 6,
//     timestamp: '2026-05-07T10:28:12.993Z',
//     level: 'CRITICAL',
//     service: 'db-proxy',
//     message: `
// 2026-05-07T10:28:12.993Z ERROR [db-proxy]
// activeConnections=498
// maxConnections=500
// waitingRequests=71
// avgQueryLatencyMs=1882
// slowQueriesDetected=91
// cpuUsagePercent=94
// errorCode=DB_CONN_POOL_EXHAUSTED
// message="Database proxy exhausted all available connections causing request rejection"
// `
//   },
//
//   {
//     id: 7,
//     timestamp: '2026-05-07T10:31:09.412Z',
//     level: 'WARN',
//     service: 'api-gateway',
//     message: `
// 2026-05-07T10:31:09.412Z WARN [api-gateway]
// requestsPerSecond=18422
// blockedRequests=17201
// attackVector=HTTP_FLOOD
// targetEndpoint=/api/v1/login
// wafAction=BLOCK
// botDetectionScore=98
// responseCode=429
// message="Web Application Firewall mitigated abnormal HTTP flood attack traffic"
// `
//   },
//
//   {
//     id: 8,
//     timestamp: '2026-05-07T10:41:17.302Z',
//     level: 'CRITICAL',
//     service: 'notification-service',
//     message: `
// 2026-05-07T10:41:17.302Z ERROR [notification-service]
// consumerLag=882911
// messagesIncomingPerSecond=811
// messagesProcessedPerSecond=92
// rebalanceCount=14
// heapUsagePercent=91
// gcPauseMs=712
// cpuUsagePercent=96
// alertSeverity=CRITICAL
// message="Kafka consumer lag crossed critical threshold due to insufficient processing throughput"
// `
//   }
// ]
//
// const LEVEL_STYLES = {
//   ERROR: {
//     color: 'var(--accent-red)',
//     bg: 'rgba(255,51,85,0.06)',
//   },
//
//   CRITICAL: {
//     color: 'var(--accent-red)',
//     bg: 'rgba(255,51,85,0.10)',
//   },
//
//   WARN: {
//     color: 'var(--accent-orange)',
//     bg: 'rgba(255,122,0,0.06)',
//   },
//
//   INFO: {
//     color: 'var(--accent-cyan)',
//     bg: 'transparent',
//   },
//
//   DEBUG: {
//     color: 'var(--text-muted)',
//     bg: 'transparent',
//   },
// }
//
// function generateAnalysis(message) {
//   const msg = message.toLowerCase()
//
//   // API Gateway
//   if (
//     msg.includes('upstream service instability') ||
//     msg.includes('upstream_service_unavailable')
//   ) {
//     return {
//       title: 'API Gateway Upstream Failure',
//       severity: 'CRITICAL',
//
//       summary:
//         'Gateway could not communicate with inventory-service causing order API failures.',
//
//       rca: [
//         'Inventory-service latency exceeded timeout threshold.',
//         'Retry amplification increased backend pressure.',
//         'Circuit breaker entered OPEN state.',
//       ],
//
//       impact: [
//         'Users unable to place orders.',
//         'Checkout requests returned 502 errors.',
//         'Potential cascading microservice failures.',
//       ],
//
//       prediction: [
//         'Inventory pods may restart repeatedly.',
//         'Database contention may worsen.',
//         'Retry storms could overload backend systems.',
//       ],
//
//       actions: [
//         'Scale inventory-service horizontally.',
//         'Reduce retry count temporarily.',
//         'Investigate DB contention and locks.',
//         'Enable graceful degradation fallback.',
//       ],
//     }
//   }
//
//   // Auth attack
//   if (
//     msg.includes('jwt signature mismatch') ||
//     msg.includes('token tampering')
//   ) {
//     return {
//       title: 'Suspicious Authentication Attempt',
//       severity: 'HIGH',
//
//       summary:
//         'Authentication system detected possible JWT tampering attempt.',
//
//       rca: [
//         'JWT signature validation failed.',
//         'High anomaly risk score detected.',
//         'Repeated login attempts observed.',
//       ],
//
//       impact: [
//         'Potential credential abuse attempts.',
//         'Risk of unauthorized account access.',
//       ],
//
//       prediction: [
//         'Credential stuffing attacks may increase.',
//         'Attackers may probe MFA bypass vulnerabilities.',
//       ],
//
//       actions: [
//         'Block suspicious IP temporarily.',
//         'Enable advanced anomaly detection.',
//         'Rotate JWT signing keys if compromise suspected.',
//       ],
//     }
//   }
//
//   // Payment timeout
//   if (
//     msg.includes('payment authorization failed') ||
//     msg.includes('payment_provider_timeout')
//   ) {
//     return {
//       title: 'Payment Provider Timeout',
//       severity: 'HIGH',
//
//       summary:
//         'External payment provider exceeded SLA timeout causing payment failures.',
//
//       rca: [
//         'Stripe API latency crossed timeout threshold.',
//         'Synchronous authorization caused thread blocking.',
//       ],
//
//       impact: [
//         'Checkout failures observed.',
//         'Potential revenue loss.',
//         'Customer dissatisfaction risk.',
//       ],
//
//       prediction: [
//         'Cart abandonment may increase.',
//         'Duplicate payment retries possible.',
//       ],
//
//       actions: [
//         'Add secondary provider failover.',
//         'Enable async reconciliation.',
//         'Tune timeout policies.',
//       ],
//     }
//   }
//
//   // Deadlock
//   if (
//     msg.includes('deadlock') ||
//     msg.includes('database deadlock conflict')
//   ) {
//     return {
//       title: 'Database Deadlock Detected',
//       severity: 'CRITICAL',
//
//       summary:
//         'Concurrent inventory transactions caused database lock contention.',
//
//       rca: [
//         'SERIALIZABLE isolation increased contention.',
//         'Concurrent reservations created row locks.',
//         'Retry logic amplified DB pressure.',
//       ],
//
//       impact: [
//         'Inventory reservation failures.',
//         'Order processing delays.',
//         'Increased API latency.',
//       ],
//
//       prediction: [
//         'DB pool exhaustion may occur.',
//         'Thread starvation likely under peak load.',
//       ],
//
//       actions: [
//         'Reduce transaction scope.',
//         'Use optimistic locking.',
//         'Tune SQL queries and indexes.',
//       ],
//     }
//   }
//
//   // Notification queue
//   if (
//     msg.includes('rate limits exceeded') ||
//     msg.includes('delivery delayed')
//   ) {
//     return {
//       title: 'Notification Queue Backlog',
//       severity: 'HIGH',
//
//       summary:
//         'Notification throughput exceeded provider processing capacity.',
//
//       rca: [
//         'SendGrid throttled outbound emails.',
//         'Incoming traffic exceeded worker throughput.',
//       ],
//
//       impact: [
//         'Users receiving delayed emails.',
//         'Queue backlog increasing rapidly.',
//       ],
//
//       prediction: [
//         'Dead letter queue may grow further.',
//         'Email delays could become severe.',
//       ],
//
//       actions: [
//         'Scale notification workers.',
//         'Add secondary email provider.',
//         'Enable adaptive throttling.',
//       ],
//     }
//   }
//
//   // DB pool
//   if (
//     msg.includes('db_conn_pool_exhausted') ||
//     msg.includes('available connections')
//   ) {
//     return {
//       title: 'Database Connection Pool Exhaustion',
//       severity: 'CRITICAL',
//
//       summary:
//         'Database proxy exhausted all available connections.',
//
//       rca: [
//         'Slow queries held connections too long.',
//         'Connection pool saturation reached critical threshold.',
//       ],
//
//       impact: [
//         'Applications unable to acquire DB connections.',
//         'Request failures across services.',
//       ],
//
//       prediction: [
//         'Authentication and inventory failures may spread.',
//         'Potential DB failover risk.',
//       ],
//
//       actions: [
//         'Kill slow-running queries.',
//         'Increase read replicas.',
//         'Optimize connection pooling strategy.',
//       ],
//     }
//   }
//
//   // DDoS
//   if (
//     msg.includes('http flood') ||
//     msg.includes('waf')
//   ) {
//     return {
//       title: 'DDoS Attack Mitigated',
//       severity: 'HIGH',
//
//       summary:
//         'Web Application Firewall detected and mitigated HTTP flood attack.',
//
//       rca: [
//         'Traffic exceeded normal baseline significantly.',
//         'Automated bot traffic targeted login endpoint.',
//       ],
//
//       impact: [
//         'Potential login latency spikes.',
//         'Increased edge traffic processing load.',
//       ],
//
//       prediction: [
//         'Attackers may evolve toward distributed botnets.',
//         'Credential stuffing attacks may follow.',
//       ],
//
//       actions: [
//         'Enable geo restrictions.',
//         'Strengthen bot fingerprinting.',
//         'Increase CDN edge protections.',
//       ],
//     }
//   }
//
//   // Kafka lag
//   if (
//     msg.includes('consumer lag') ||
//     msg.includes('insufficient processing throughput')
//   ) {
//     return {
//       title: 'Kafka Consumer Lag Spike',
//       severity: 'CRITICAL',
//
//       summary:
//         'Kafka consumers unable to process incoming traffic fast enough.',
//
//       rca: [
//         'Processing throughput lower than incoming events.',
//         'High GC pauses degraded JVM performance.',
//       ],
//
//       impact: [
//         'Notification delays.',
//         'Massive event backlog accumulation.',
//       ],
//
//       prediction: [
//         'Consumer rebalance storms may occur.',
//         'DLQ overflow risk increasing.',
//       ],
//
//       actions: [
//         'Scale consumers horizontally.',
//         'Increase Kafka partitions.',
//         'Tune JVM heap and GC settings.',
//       ],
//     }
//   }
//
//   return {
//     title: 'General System Analysis',
//     severity: 'INFO',
//
//     summary: 'Log analyzed successfully.',
//
//     rca: ['No major anomaly detected.'],
//
//     impact: ['Minimal impact observed.'],
//
//     prediction: ['System expected to remain stable.'],
//
//     actions: ['Continue monitoring.'],
//   }
// }
//
// function LogRow({ log }) {
//   const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO
//
//   const ts = new Date(log.timestamp).toLocaleTimeString(
//     'en-US',
//     { hour12: false }
//   )
//
//   return (
//     <div
//       style={{
//         display: 'grid',
//         gridTemplateColumns: '75px 80px 170px 1fr',
//         gap: 8,
//         padding: '6px 12px',
//         fontSize: 12,
//         fontFamily: 'var(--font-mono)',
//         lineHeight: 1.5,
//         background: style.bg,
//         borderBottom: '1px solid rgba(29,45,69,0.3)',
//       }}
//     >
//       <span style={{ color: 'var(--text-muted)' }}>
//         {ts}
//       </span>
//
//       <span
//         style={{
//           color: style.color,
//           fontWeight: 700,
//         }}
//       >
//         {log.level}
//       </span>
//
//       <span style={{ color: 'var(--text-secondary)' }}>
//         {log.service}
//       </span>
//
//       <pre
//         style={{
//           margin: 0,
//           whiteSpace: 'pre-wrap',
//           color: 'var(--text-primary)',
//           fontFamily: 'var(--font-mono)',
//         }}
//       >
//         {log.message}
//       </pre>
//     </div>
//   )
// }
//
// function Section({ title, items }) {
//   return (
//     <div style={{ marginBottom: 16 }}>
//       <div
//         style={{
//           fontSize: 12,
//           fontWeight: 700,
//           color: 'var(--accent-cyan)',
//           marginBottom: 6,
//         }}
//       >
//         {title}
//       </div>
//
//       <ul
//         style={{
//           margin: 0,
//           paddingLeft: 18,
//           color: 'var(--text-secondary)',
//           fontSize: 12,
//           lineHeight: 1.8,
//         }}
//       >
//         {items.map((item, idx) => (
//           <li key={idx}>{item}</li>
//         ))}
//       </ul>
//     </div>
//   )
// }
//
// function AnalysisPanel({ analysis }) {
//   if (!analysis) return null
//
//   return (
//     <div
//       style={{
//         marginTop: 12,
//         background: 'var(--bg-elevated)',
//         border: '1px solid var(--border)',
//         borderRadius: 10,
//         padding: 18,
//       }}
//     >
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 10,
//           marginBottom: 18,
//         }}
//       >
//         <Brain
//           size={18}
//           color="var(--accent-cyan)"
//         />
//
//         <span
//           style={{
//             fontSize: 15,
//             fontWeight: 700,
//             color: 'var(--text-primary)',
//           }}
//         >
//           {analysis.title}
//         </span>
//       </div>
//
//       <Section
//         title="Summary"
//         items={[analysis.summary]}
//       />
//
//       <Section
//         title="Root Cause Analysis"
//         items={analysis.rca}
//       />
//
//       <Section
//         title="Business Impact"
//         items={analysis.impact}
//       />
//
//       <Section
//         title="Prediction"
//         items={analysis.prediction}
//       />
//
//       <Section
//         title="Recommended Actions"
//         items={analysis.actions}
//       />
//     </div>
//   )
// }
//
// export default function LogViewer() {
//   const [logs] = useState(sampleLogs)
//
//   const [filter, setFilter] = useState('')
//
//   const [analysisLoading, setAnalysisLoading] =
//     useState(false)
//
//   const [analysisResult, setAnalysisResult] =
//     useState(null)
//
//   const bottomRef = useRef(null)
//
//   useEffect(() => {
//     if (bottomRef.current) {
//       bottomRef.current.scrollIntoView({
//         behavior: 'smooth',
//       })
//     }
//   }, [logs])
//
//   const filtered = logs.filter(log => {
//     if (!filter) return true
//
//     return log.message
//       .toLowerCase()
//       .includes(filter.toLowerCase())
//   })
//
//   const runAnalysis = () => {
//   if (!filtered.length) return
//
//   setAnalysisLoading(true)
//   setAnalysisResult(null)
//
//   setTimeout(() => {
//     const latestLog = filtered[filtered.length - 1]
//
//     const analysis = generateAnalysis(
//       latestLog.message
//     )
//
//     setAnalysisResult(analysis)
//
//     setAnalysisLoading(false)
//   }, 6000)
// }
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//         background: 'var(--bg-primary)',
//       }}
//     >
//       {/* Toolbar */}
//
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 10,
//           padding: '12px 16px',
//           background: 'var(--bg-elevated)',
//           borderBottom: '1px solid var(--border)',
//         }}
//       >
//         <div
//           style={{
//             position: 'relative',
//             flex: 1,
//           }}
//         >
//           <Search
//             size={12}
//             style={{
//               position: 'absolute',
//               left: 10,
//               top: '50%',
//               transform: 'translateY(-50%)',
//               color: 'var(--text-muted)',
//             }}
//           />
//
//           <input
//             value={filter}
//             onChange={e =>
//               setFilter(e.target.value)
//             }
//             placeholder="Filter logs using message..."
//             style={{
//               width: '100%',
//               padding: '6px 10px 6px 28px',
//               background: 'var(--bg-card)',
//               border: '1px solid var(--border)',
//               borderRadius: 6,
//               color: 'var(--text-primary)',
//               fontFamily: 'var(--font-mono)',
//               fontSize: 12,
//               outline: 'none',
//             }}
//           />
//         </div>
//
//         <button
//           onClick={runAnalysis}
//           disabled={analysisLoading}
//           style={{
//             padding: '7px 12px',
//             borderRadius: 6,
//             border:
//               '1px solid var(--accent-cyan)',
//             background:
//               'rgba(0,212,255,0.08)',
//             color: 'var(--accent-cyan)',
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//             fontSize: 12,
//             fontWeight: 700,
//           }}
//         >
//           {analysisLoading ? (
//             <>
//               <AlertTriangle size={14} />
//               Analysing...
//             </>
//           ) : (
//             <>
//               <Brain size={14} />
//               Run Analysis
//             </>
//           )}
//         </button>
//
//         <button
//           style={{
//             padding: '7px 10px',
//             borderRadius: 6,
//             cursor: 'pointer',
//             background: 'var(--bg-card)',
//             border: '1px solid var(--border)',
//             color: 'var(--text-muted)',
//             display: 'flex',
//             alignItems: 'center',
//             gap: 4,
//           }}
//         >
//           <Download size={13} />
//         </button>
//       </div>
//
//       {/* Logs */}
//
//       <div
//         style={{
//           flex: 1,
//           overflowY: 'auto',
//         }}
//       >
//         {filtered.map(log => (
//           <LogRow
//             key={log.id}
//             log={log}
//           />
//         ))}
//
//         <div ref={bottomRef} />
//       </div>
//
//       {/* Analysis */}
//
//       {analysisResult && (
//         <AnalysisPanel
//           analysis={analysisResult}
//         />
//       )}
//     </div>
//   )
// }