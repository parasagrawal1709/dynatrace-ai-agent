// import { useState } from 'react'
// import { AlertTriangle, CheckCircle, Info, Zap, Brain, Shield, RefreshCw } from 'lucide-react'
// import { api } from '../services/api'
//
// const SEVERITY_CONFIG = {
//   CRITICAL: { color: 'var(--accent-red)',    icon: AlertTriangle, bg: 'rgba(255,51,85,0.08)'  },
//   HIGH:     { color: 'var(--accent-red)',    icon: AlertTriangle, bg: 'rgba(255,51,85,0.05)'  },
//   MEDIUM:   { color: 'var(--accent-orange)', icon: Zap,           bg: 'rgba(255,122,0,0.06)'  },
//   LOW:      { color: 'var(--accent-yellow)', icon: Info,          bg: 'rgba(255,215,0,0.05)'  },
//   INFO:     { color: 'var(--accent-cyan)',   icon: Info,          bg: 'rgba(0,212,255,0.04)'  },
// }
//
// const CATEGORY_ICONS = {
//   PERFORMANCE:   '⚡',
//   AVAILABILITY:  '🔴',
//   ERROR_RATE:    '❌',
//   MEMORY:        '🧠',
//   CPU:           '🖥️',
//   DATABASE:      '🗄️',
//   NETWORK:       '🌐',
//   SECURITY:      '🔐',
//   DEPENDENCY:    '🔗',
//   CONFIGURATION: '⚙️',
// }
//
// function IssueCard({ issue }) {
//   const [expanded, setExpanded] = useState(false)
//   const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.INFO
//   const Icon = cfg.icon
//
//   return (
//     <div
//       onClick={() => setExpanded(!expanded)}
//       style={{
//         background: cfg.bg,
//         border: `1px solid ${cfg.color}33`,
//         borderLeft: `3px solid ${cfg.color}`,
//         borderRadius: 8, padding: '12px 14px',
//         cursor: 'pointer',
//         marginBottom: 8,
//         transition: 'all 0.2s',
//       }}
//     >
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//         <div style={{ flex: 1 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
//             <Icon size={13} color={cfg.color} />
//             <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>
//               {issue.severity}
//             </span>
//             <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//               {CATEGORY_ICONS[issue.category]} {issue.category}
//             </span>
//           </div>
//           <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
//             {issue.title}
//           </div>
//           <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
//             {issue.description}
//           </div>
//         </div>
//         <div style={{
//           marginLeft: 12, textAlign: 'center', minWidth: 44,
//           padding: '4px 8px', borderRadius: 4,
//           background: 'rgba(0,0,0,0.3)',
//           border: '1px solid var(--border)',
//         }}>
//           <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: cfg.color }}>
//             {Math.round(issue.confidence * 100)}%
//           </div>
//           <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CONF</div>
//         </div>
//       </div>
//
//       {expanded && (
//         <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
//           {issue.evidence?.length > 0 && (
//             <div style={{ marginBottom: 10 }}>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>
//                 EVIDENCE
//               </div>
//               {issue.evidence.map((e, i) => (
//                 <div key={i} style={{
//                   fontFamily: 'var(--font-mono)', fontSize: 11,
//                   color: 'var(--text-secondary)', background: 'var(--bg-base)',
//                   padding: '3px 8px', borderRadius: 3, marginBottom: 2,
//                   borderLeft: '2px solid var(--border-glow)',
//                 }}>
//                   {e}
//                 </div>
//               ))}
//             </div>
//           )}
//           {issue.recommendation && (
//             <div style={{
//               padding: '8px 12px', borderRadius: 4,
//               background: 'rgba(0,255,136,0.06)',
//               border: '1px solid rgba(0,255,136,0.15)',
//             }}>
//               <div style={{ fontSize: 10, color: 'var(--accent-green)', letterSpacing: '0.1em', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>
//                 ✓ RECOMMENDATION
//               </div>
//               <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{issue.recommendation}</div>
//             </div>
//           )}
//           {issue.impact && (
//             <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
//               <strong style={{ color: 'var(--text-secondary)' }}>Impact:</strong> {issue.impact}
//             </div>
//           )}
//           {issue.services?.length > 0 && (
//             <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
//               {issue.services.map(s => (
//                 <span key={s} style={{
//                   fontSize: 10, fontFamily: 'var(--font-mono)',
//                   padding: '2px 6px', borderRadius: 3,
//                   background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
//                   border: '1px solid var(--border)',
//                 }}>
//                   {s}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
//
// export default function AnalysisPanel({ analysis }) {
//   const [running, setRunning] = useState(false)
//   const [localAnalysis, setLocalAnalysis] = useState(null)
//
//   const current = localAnalysis || analysis
//
//   const triggerAnalysis = async () => {
//     setRunning(true)
//     try {
//       const result = await api.runAnalysis({ minutes: 15, include_metrics: true, include_problems: true })
//       setLocalAnalysis(result)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setRunning(false)
//     }
//   }
//
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 16 }}>
//       {/* Trigger button */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           <Brain size={14} color="var(--accent-purple)" />
//           <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
//             AI ANALYSIS
//           </span>
//         </div>
//         <button
//           onClick={triggerAnalysis}
//           disabled={running}
//           style={{
//             display: 'flex', alignItems: 'center', gap: 6,
//             padding: '6px 14px', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer',
//             background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)',
//             color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: 12,
//             opacity: running ? 0.6 : 1,
//           }}
//         >
//           <RefreshCw size={11} className={running ? 'pulse' : ''} />
//           {running ? 'Analysing …' : 'Run Analysis'}
//         </button>
//       </div>
//
//       {!current ? (
//         <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
//           No analysis yet. Click "Run Analysis" or wait for the automatic cycle.
//         </div>
//       ) : (
//         <>
//           {/* Summary */}
//           {current.summary && (
//             <div style={{
//               padding: '12px 14px', marginBottom: 14,
//               background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
//               borderRadius: 8,
//             }}>
//               <div style={{ fontSize: 10, color: 'var(--accent-purple)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
//                 EXECUTIVE SUMMARY
//               </div>
//               <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{current.summary}</div>
//             </div>
//           )}
//
//           {/* Root cause */}
//           {current.root_cause && (
//             <div style={{
//               padding: '10px 14px', marginBottom: 14,
//               background: 'rgba(255,122,0,0.06)', border: '1px solid rgba(255,122,0,0.2)',
//               borderRadius: 8,
//             }}>
//               <div style={{ fontSize: 10, color: 'var(--accent-orange)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
//                 ROOT CAUSE HYPOTHESIS
//               </div>
//               <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{current.root_cause}</div>
//             </div>
//           )}
//
//           {/* Issues */}
//           {current.issues?.length > 0 && (
//             <div style={{ marginBottom: 14 }}>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
//                 DETECTED ISSUES ({current.issues.length})
//               </div>
//               {current.issues.map((issue, i) => <IssueCard key={issue.id ?? i} issue={issue} />)}
//             </div>
//           )}
//
//           {/* Anomalies */}
//           {current.anomalies?.length > 0 && (
//             <div style={{ marginBottom: 14 }}>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
//                 ANOMALIES
//               </div>
//               {current.anomalies.map((a, i) => (
//                 <div key={i} style={{
//                   fontSize: 12, color: 'var(--text-secondary)',
//                   padding: '6px 10px', marginBottom: 4,
//                   background: 'var(--bg-card)', borderRadius: 4,
//                   borderLeft: '2px solid var(--accent-orange)',
//                   fontFamily: 'var(--font-mono)',
//                 }}>
//                   {a}
//                 </div>
//               ))}
//             </div>
//           )}
//
//           {/* Recommendations */}
//           {current.recommendations?.length > 0 && (
//             <div>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
//                 RECOMMENDATIONS
//               </div>
//               {current.recommendations.map((r, i) => (
//                 <div key={i} style={{
//                   display: 'flex', alignItems: 'flex-start', gap: 8,
//                   padding: '6px 10px', marginBottom: 4,
//                   background: 'rgba(0,255,136,0.04)', borderRadius: 4,
//                   border: '1px solid rgba(0,255,136,0.1)',
//                 }}>
//                   <CheckCircle size={12} color="var(--accent-green)" style={{ marginTop: 2, flexShrink: 0 }} />
//                   <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{r}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   )
// }

//
// import { useState } from 'react'
// import {
//   AlertTriangle,
//   CheckCircle,
//   Info,
//   Zap,
//   Brain,
//   RefreshCw,
// } from 'lucide-react'
//
// const SEVERITY_CONFIG = {
//   CRITICAL: {
//     color: 'var(--accent-red)',
//     icon: AlertTriangle,
//     bg: 'rgba(255,51,85,0.08)',
//   },
//   HIGH: {
//     color: 'var(--accent-red)',
//     icon: AlertTriangle,
//     bg: 'rgba(255,51,85,0.05)',
//   },
//   MEDIUM: {
//     color: 'var(--accent-orange)',
//     icon: Zap,
//     bg: 'rgba(255,122,0,0.06)',
//   },
//   LOW: {
//     color: 'var(--accent-yellow)',
//     icon: Info,
//     bg: 'rgba(255,215,0,0.05)',
//   },
//   INFO: {
//     color: 'var(--accent-cyan)',
//     icon: Info,
//     bg: 'rgba(0,212,255,0.04)',
//   },
// }
//
// const CATEGORY_ICONS = {
//   PERFORMANCE: '⚡',
//   AVAILABILITY: '🔴',
//   ERROR_RATE: '❌',
//   MEMORY: '🧠',
//   CPU: '🖥️',
//   DATABASE: '🗄️',
//   NETWORK: '🌐',
//   SECURITY: '🔐',
//   DEPENDENCY: '🔗',
//   CONFIGURATION: '⚙️',
// }
//
// /* -------------------------------------------------------------------------- */
// /*                              ANALYSIS DATASETS                             */
// /* -------------------------------------------------------------------------- */
//
// const ANALYSIS_SETS = [
//   {
//     summary:
//       'Inventory-service memory exhaustion triggered cascading dependency failures across payment and gateway services.',
//
//     root_cause:
//       'Retry amplification combined with JVM heap saturation caused downstream timeout propagation.',
//
//     issues: [
//       {
//         id: 1,
//         severity: 'CRITICAL',
//         category: 'MEMORY',
//         title: 'JVM Heap Exhaustion Detected',
//         description:
//           'inventory-service heap usage exceeded 98% causing thread starvation and unstable response times.',
//         confidence: 0.96,
//         evidence: [
//           'OutOfMemoryError: Java heap space',
//           'heap usage 98%',
//         ],
//         recommendation:
//           'Enable heap dump analysis and introduce adaptive load shedding.',
//         impact:
//           'Potential transaction retries and payment degradation.',
//         services: ['inventory-service', 'api-gateway'],
//       },
//     ],
//
//     anomalies: [
//       'Retry storm amplification detected',
//       'Latency spike exceeded baseline by 240%',
//     ],
//
//     recommendations: [
//       'Introduce circuit breakers',
//       'Enable autoscaling',
//       'Reduce retry fanout',
//     ],
//   },
//
//   {
//     summary:
//       'Database saturation is becoming the primary bottleneck across the platform.',
//
//     root_cause:
//       'Connection pool exhaustion combined with long-running SELECT queries created cascading failures.',
//
//     issues: [
//       {
//         id: 2,
//         severity: 'HIGH',
//         category: 'DATABASE',
//         title: 'Connection Pool Exhaustion',
//         description:
//           'Multiple services waited over 30 seconds for DB connections.',
//         confidence: 0.94,
//         evidence: [
//           'Connection pool exhausted',
//           'Database query timeout after 15000 ms',
//         ],
//         recommendation:
//           'Tune HikariCP, introduce read replicas, and optimize slow queries.',
//         impact:
//           'Order processing delays and degraded settlement operations.',
//         services: ['db-proxy', 'payment-service'],
//       },
//     ],
//
//     anomalies: [
//       'DB latency increased 310%',
//       'Concurrent query spike detected',
//     ],
//
//     recommendations: [
//       'Optimize SQL queries',
//       'Add DB indexing',
//       'Implement query caching',
//     ],
//   },
//
//   {
//     summary:
//       'Authentication anomalies indicate possible JWT synchronization issues across services.',
//
//     root_cause:
//       'Invalid JWT signatures suggest stale signing keys or internal auth desynchronization.',
//
//     issues: [
//       {
//         id: 3,
//         severity: 'CRITICAL',
//         category: 'SECURITY',
//         title: 'Repeated JWT Validation Failures',
//         description:
//           'Services are rejecting authentication tokens from internal requests.',
//         confidence: 0.92,
//         evidence: [
//           'Authentication failure',
//           'invalid JWT signature from IP 192.168.1.42',
//         ],
//         recommendation:
//           'Rotate JWT keys and audit service-to-service authentication.',
//         impact:
//           'Potential unauthorized access attempts and broken internal communication.',
//         services: ['auth-service', 'inventory-service'],
//       },
//     ],
//
//     anomalies: [
//       'Spike in token rejection events',
//       'Internal auth mismatch detected',
//     ],
//
//     recommendations: [
//       'Rotate signing keys',
//       'Enable mTLS',
//       'Audit internal API auth',
//     ],
//   },
//
//   {
//     summary:
//       'Retry storms are amplifying infrastructure instability across dependent services.',
//
//     root_cause:
//       'Aggressive retry policies caused exponential traffic amplification under failure conditions.',
//
//     issues: [
//       {
//         id: 4,
//         severity: 'HIGH',
//         category: 'DEPENDENCY',
//         title: 'Retry Amplification Detected',
//         description:
//           'Services repeatedly retried failing downstream dependencies.',
//         confidence: 0.91,
//         evidence: [
//           'Retry attempt 3/3',
//           'HTTP 503 from dependency inventory-service',
//         ],
//         recommendation:
//           'Implement exponential backoff with retry budgets.',
//         impact:
//           'Traffic spikes and cascading infrastructure collapse.',
//         services: ['api-gateway', 'payment-service'],
//       },
//     ],
//
//     anomalies: [
//       'Retry amplification loop identified',
//       'Downstream dependency saturation',
//     ],
//
//     recommendations: [
//       'Introduce queue-based retries',
//       'Apply retry jitter',
//       'Limit retry fanout',
//     ],
//   },
//
//   {
//     summary:
//       'Certificate governance weaknesses detected across production services.',
//
//     root_cause:
//       'SSL certificate lifecycle management is not automated.',
//
//     issues: [
//       {
//         id: 5,
//         severity: 'MEDIUM',
//         category: 'SECURITY',
//         title: 'SSL Certificate Expiry Risk',
//         description:
//           'Multiple services have certificates expiring within 3 days.',
//         confidence: 0.95,
//         evidence: [
//           'SSL certificate expires in 3 days',
//         ],
//         recommendation:
//           'Introduce automated certificate rotation using cert-manager.',
//         impact:
//           'Potential payment API failures and compliance violations.',
//         services: ['payment-service', 'api-gateway'],
//       },
//     ],
//
//     anomalies: [
//       'Certificate expiry alerts increasing',
//     ],
//
//     recommendations: [
//       'Automate cert renewal',
//       'Centralize cert governance',
//       'Enable expiry monitoring',
//     ],
//   },
//
//   {
//     summary:
//       'CPU saturation indicates severe workload imbalance across core services.',
//
//     root_cause:
//       'High retry traffic and blocked threads created sustained CPU pressure.',
//
//     issues: [
//       {
//         id: 6,
//         severity: 'HIGH',
//         category: 'CPU',
//         title: 'CPU Saturation Detected',
//         description:
//           'CPU utilization exceeded 85% for multiple consecutive minutes.',
//         confidence: 0.9,
//         evidence: [
//           'CPU utilisation above 85%',
//         ],
//         recommendation:
//           'Introduce autoscaling and optimize blocking operations.',
//         impact:
//           'Slower response times and degraded API throughput.',
//         services: ['inventory-service', 'db-proxy'],
//       },
//     ],
//
//     anomalies: [
//       'CPU saturation trend increasing',
//     ],
//
//     recommendations: [
//       'Enable HPA scaling',
//       'Optimize thread pools',
//       'Reduce synchronous calls',
//     ],
//   },
//
//   {
//     summary:
//       'Response latency degradation suggests systemic infrastructure saturation.',
//
//     root_cause:
//       'Tail latency increased significantly before hard failures occurred.',
//
//     issues: [
//       {
//         id: 7,
//         severity: 'HIGH',
//         category: 'PERFORMANCE',
//         title: 'Latency Threshold Violations',
//         description:
//           'Services exceeded configured latency thresholds consistently.',
//         confidence: 0.88,
//         evidence: [
//           'Response time threshold exceeded: 4823 ms',
//         ],
//         recommendation:
//           'Implement p99 latency monitoring and adaptive traffic shaping.',
//         impact:
//           'Poor customer experience and transaction delays.',
//         services: ['api-gateway', 'inventory-service'],
//       },
//     ],
//
//     anomalies: [
//       'p99 latency exceeded baseline',
//     ],
//
//     recommendations: [
//       'Track tail latency',
//       'Enable adaptive scaling',
//       'Improve observability',
//     ],
//   },
//
//   {
//     summary:
//       'Application-level exceptions indicate weak defensive engineering practices.',
//
//     root_cause:
//       'Unvalidated null handling caused failures in critical transaction flows.',
//
//     issues: [
//       {
//         id: 8,
//         severity: 'MEDIUM',
//         category: 'ERROR_RATE',
//         title: 'NullPointerException Spike',
//         description:
//           'Critical controllers are failing due to null object access.',
//         confidence: 0.89,
//         evidence: [
//           'NullPointerException in OrderController.processOrder()',
//         ],
//         recommendation:
//           'Add DTO validation and fail-safe request handling.',
//         impact:
//           'Potential inconsistent order states.',
//         services: ['api-gateway', 'payment-service'],
//       },
//     ],
//
//     anomalies: [
//       'Application exception rate increased',
//     ],
//
//     recommendations: [
//       'Introduce schema validation',
//       'Improve exception handling',
//       'Add request guards',
//     ],
//   },
//
//   {
//     summary:
//       'Disk utilization trends indicate future operational risk for logging infrastructure.',
//
//     root_cause:
//       'Unmanaged log growth is exhausting filesystem capacity.',
//
//     issues: [
//       {
//         id: 9,
//         severity: 'LOW',
//         category: 'CONFIGURATION',
//         title: 'Log Volume Saturation',
//         description:
//           'Disk usage exceeded safe operational thresholds.',
//         confidence: 0.86,
//         evidence: [
//           'Disk usage at 88% on /var/log',
//         ],
//         recommendation:
//           'Enable log rotation and centralized log archival.',
//         impact:
//           'Potential node instability and service crashes.',
//         services: ['auth-service', 'payment-service'],
//       },
//     ],
//
//     anomalies: [
//       'Log storage growth accelerating',
//     ],
//
//     recommendations: [
//       'Enable compression',
//       'Configure retention policies',
//       'Ship logs externally',
//     ],
//   },
//
//   {
//     summary:
//       'Observability maturity exists, but intelligent incident correlation is missing.',
//
//     root_cause:
//       'The platform generates alerts independently without causal aggregation.',
//
//     issues: [
//       {
//         id: 10,
//         severity: 'INFO',
//         category: 'DEPENDENCY',
//         title: 'Fragmented Incident Visibility',
//         description:
//           'Alerts are generated independently without unified root cause mapping.',
//         confidence: 0.84,
//         evidence: [
//           'Multiple independent alerts triggered simultaneously',
//         ],
//         recommendation:
//           'Introduce AI-driven root cause analysis and distributed tracing.',
//         impact:
//           'Longer MTTR and alert fatigue.',
//         services: ['all-services'],
//       },
//     ],
//
//     anomalies: [
//       'Alert correlation gap identified',
//     ],
//
//     recommendations: [
//       'Enable OpenTelemetry',
//       'Implement RCA engine',
//       'Add dependency topology mapping',
//     ],
//   },
// ]
//
// /* -------------------------------------------------------------------------- */
// /*                                 ISSUE CARD                                 */
// /* -------------------------------------------------------------------------- */
//
// function IssueCard({ issue }) {
//   const [expanded, setExpanded] = useState(false)
//
//   const cfg =
//     SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.INFO
//
//   const Icon = cfg.icon
//
//   return (
//     <div
//       onClick={() => setExpanded(!expanded)}
//       style={{
//         background: cfg.bg,
//         border: `1px solid ${cfg.color}33`,
//         borderLeft: `3px solid ${cfg.color}`,
//         borderRadius: 8,
//         padding: '12px 14px',
//         cursor: 'pointer',
//         marginBottom: 8,
//         transition: 'all 0.2s',
//       }}
//     >
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'flex-start',
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               marginBottom: 4,
//             }}
//           >
//             <Icon size={13} color={cfg.color} />
//
//             <span
//               style={{
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: cfg.color,
//               }}
//             >
//               {issue.severity}
//             </span>
//
//             <span
//               style={{
//                 fontSize: 11,
//                 color: 'var(--text-muted)',
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               {CATEGORY_ICONS[issue.category]} {issue.category}
//             </span>
//           </div>
//
//           <div
//             style={{
//               fontSize: 13,
//               fontWeight: 600,
//               color: 'var(--text-primary)',
//               marginBottom: 3,
//             }}
//           >
//             {issue.title}
//           </div>
//
//           <div
//             style={{
//               fontSize: 11,
//               color: 'var(--text-secondary)',
//               lineHeight: 1.5,
//             }}
//           >
//             {issue.description}
//           </div>
//         </div>
//
//         <div
//           style={{
//             marginLeft: 12,
//             textAlign: 'center',
//             minWidth: 44,
//             padding: '4px 8px',
//             borderRadius: 4,
//             background: 'rgba(0,0,0,0.3)',
//             border: '1px solid var(--border)',
//           }}
//         >
//           <div
//             style={{
//               fontSize: 16,
//               fontWeight: 800,
//               fontFamily: 'var(--font-mono)',
//               color: cfg.color,
//             }}
//           >
//             {Math.round(issue.confidence * 100)}%
//           </div>
//
//           <div
//             style={{
//               fontSize: 9,
//               color: 'var(--text-muted)',
//             }}
//           >
//             CONF
//           </div>
//         </div>
//       </div>
//
//       {expanded && (
//         <div
//           style={{
//             marginTop: 12,
//             paddingTop: 12,
//             borderTop: '1px solid var(--border)',
//           }}
//         >
//           {issue.evidence?.map((e, i) => (
//             <div
//               key={i}
//               style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: 11,
//                 padding: '4px 8px',
//                 marginBottom: 4,
//                 borderRadius: 4,
//                 background: 'var(--bg-base)',
//               }}
//             >
//               {e}
//             </div>
//           ))}
//
//           <div
//             style={{
//               marginTop: 10,
//               fontSize: 12,
//               color: 'var(--text-primary)',
//             }}
//           >
//             <strong>Recommendation:</strong>{' '}
//             {issue.recommendation}
//           </div>
//
//           <div
//             style={{
//               marginTop: 8,
//               fontSize: 11,
//               color: 'var(--text-muted)',
//             }}
//           >
//             <strong>Impact:</strong> {issue.impact}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
//
// /* -------------------------------------------------------------------------- */
// /*                              ANALYSIS PANEL                                */
// /* -------------------------------------------------------------------------- */
//
// export default function AnalysisPanel() {
//   const [running, setRunning] = useState(false)
//
//   const [localAnalysis, setLocalAnalysis] = useState(null)
//
//   // prevents recent duplicates
//   const [recentIndexes, setRecentIndexes] = useState([])
//
//   const triggerAnalysis = async () => {
//     setRunning(true)
//
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1200))
//
//       let availableIndexes = ANALYSIS_SETS
//         .map((_, index) => index)
//         .filter(index => !recentIndexes.includes(index))
//
//       // reset if exhausted
//       if (availableIndexes.length === 0) {
//         availableIndexes = ANALYSIS_SETS.map((_, index) => index)
//         setRecentIndexes([])
//       }
//
//       const randomIndex =
//         availableIndexes[
//           Math.floor(Math.random() * availableIndexes.length)
//         ]
//
//       const selectedAnalysis = ANALYSIS_SETS[randomIndex]
//
//       setRecentIndexes(prev => {
//         const updated = [...prev, randomIndex]
//         return updated.slice(-3)
//       })
//
//       setLocalAnalysis(selectedAnalysis)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setRunning(false)
//     }
//   }
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//         overflowY: 'auto',
//         padding: 16,
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: 16,
//         }}
//       >
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 8,
//           }}
//         >
//           <Brain
//             size={15}
//             color="var(--accent-purple)"
//           />
//
//           <span
//             style={{
//               fontSize: 11,
//               fontFamily: 'var(--font-mono)',
//               letterSpacing: '0.1em',
//               color: 'var(--text-muted)',
//             }}
//           >
//             AI ANALYSIS
//           </span>
//         </div>
//
//         <button
//           onClick={triggerAnalysis}
//           disabled={running}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//             padding: '6px 14px',
//             borderRadius: 6,
//             border:
//               '1px solid rgba(168,85,247,0.35)',
//             background:
//               'rgba(168,85,247,0.12)',
//             color: 'var(--accent-purple)',
//             cursor: running ? 'not-allowed' : 'pointer',
//           }}
//         >
//           <RefreshCw size={12} />
//
//           {running ? 'Analysing...' : 'Run Analysis'}
//         </button>
//       </div>
//
//       {!localAnalysis ? (
//         <div
//           style={{
//             textAlign: 'center',
//             padding: 32,
//             color: 'var(--text-muted)',
//             fontFamily: 'var(--font-mono)',
//           }}
//         >
//           Click "Run Analysis" to generate AI insights.
//         </div>
//       ) : (
//         <>
//           {/* SUMMARY */}
//           <div
//             style={{
//               padding: '12px 14px',
//               borderRadius: 8,
//               marginBottom: 14,
//               background:
//                 'rgba(168,85,247,0.06)',
//               border:
//                 '1px solid rgba(168,85,247,0.2)',
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--accent-purple)',
//                 marginBottom: 6,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               EXECUTIVE SUMMARY
//             </div>
//
//             <div
//               style={{
//                 fontSize: 13,
//                 color: 'var(--text-primary)',
//                 lineHeight: 1.6,
//               }}
//             >
//               {localAnalysis.summary}
//             </div>
//           </div>
//
//           {/* ROOT CAUSE */}
//           <div
//             style={{
//               padding: '10px 14px',
//               borderRadius: 8,
//               marginBottom: 14,
//               background:
//                 'rgba(255,122,0,0.06)',
//               border:
//                 '1px solid rgba(255,122,0,0.2)',
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--accent-orange)',
//                 marginBottom: 5,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               ROOT CAUSE HYPOTHESIS
//             </div>
//
//             <div
//               style={{
//                 fontSize: 12,
//                 color: 'var(--text-primary)',
//               }}
//             >
//               {localAnalysis.root_cause}
//             </div>
//           </div>
//
//           {/* ISSUES */}
//           <div style={{ marginBottom: 14 }}>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               DETECTED ISSUES (
//               {localAnalysis.issues.length})
//             </div>
//
//             {localAnalysis.issues.map(issue => (
//               <IssueCard
//                 key={issue.id}
//                 issue={issue}
//               />
//             ))}
//           </div>
//
//           {/* ANOMALIES */}
//           <div style={{ marginBottom: 14 }}>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               ANOMALIES
//             </div>
//
//             {localAnalysis.anomalies.map((a, i) => (
//               <div
//                 key={i}
//                 style={{
//                   padding: '6px 10px',
//                   marginBottom: 5,
//                   borderRadius: 4,
//                   background: 'var(--bg-card)',
//                   borderLeft:
//                     '2px solid var(--accent-orange)',
//                   fontFamily: 'var(--font-mono)',
//                   fontSize: 11,
//                 }}
//               >
//                 {a}
//               </div>
//             ))}
//           </div>
//
//           {/* RECOMMENDATIONS */}
//           <div>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               RECOMMENDATIONS
//             </div>
//
//             {localAnalysis.recommendations.map(
//               (r, i) => (
//                 <div
//                   key={i}
//                   style={{
//                     display: 'flex',
//                     gap: 8,
//                     padding: '7px 10px',
//                     marginBottom: 5,
//                     borderRadius: 4,
//                     background:
//                       'rgba(0,255,136,0.04)',
//                     border:
//                       '1px solid rgba(0,255,136,0.1)',
//                   }}
//                 >
//                   <CheckCircle
//                     size={12}
//                     color="var(--accent-green)"
//                     style={{
//                       marginTop: 2,
//                       flexShrink: 0,
//                     }}
//                   />
//
//                   <span
//                     style={{
//                       fontSize: 12,
//                       color: 'var(--text-primary)',
//                     }}
//                   >
//                     {r}
//                   </span>
//                 </div>
//               )
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   )
// }


// import { useEffect, useMemo, useState } from 'react'
// import {
//   AlertTriangle,
//   CheckCircle,
//   Info,
//   Zap,
//   Brain,
//   RefreshCw,
//   Users,
//   Bug,
//   TrendingDown,
// } from 'lucide-react'
//
// const SEVERITY_CONFIG = {
//   CRITICAL: {
//     color: 'var(--accent-red)',
//     icon: AlertTriangle,
//     bg: 'rgba(255,51,85,0.08)',
//   },
//   HIGH: {
//     color: 'var(--accent-red)',
//     icon: AlertTriangle,
//     bg: 'rgba(255,51,85,0.05)',
//   },
//   MEDIUM: {
//     color: 'var(--accent-orange)',
//     icon: Zap,
//     bg: 'rgba(255,122,0,0.06)',
//   },
//   LOW: {
//     color: 'var(--accent-yellow)',
//     icon: Info,
//     bg: 'rgba(255,215,0,0.05)',
//   },
//   INFO: {
//     color: 'var(--accent-cyan)',
//     icon: Info,
//     bg: 'rgba(0,212,255,0.04)',
//   },
// }
//
// const CATEGORY_ICONS = {
//   PERFORMANCE: '⚡',
//   AVAILABILITY: '🔴',
//   ERROR_RATE: '❌',
//   MEMORY: '🧠',
//   CPU: '🖥️',
//   DATABASE: '🗄️',
//   NETWORK: '🌐',
//   SECURITY: '🔐',
//   DEPENDENCY: '🔗',
//   CONFIGURATION: '⚙️',
//   AUTH: '🪪',
//   TRANSACTION: '💳',
//   RISK: '🛡️',
//   CACHE: '🧊',
// }
//
// /* -------------------------------------------------------------------------- */
// /*                              ANALYSIS DATASETS                             */
// /*   Added: use_case, error_count, users_impacted, business_impact, live_rate  */
// /* -------------------------------------------------------------------------- */
//
// const ANALYSIS_SETS = [
//   {
//     use_case: 'Inventory Degradation',
//     summary:
//       'Inventory-service memory exhaustion triggered cascading dependency failures across payment and gateway services.',
//     root_cause:
//       'Retry amplification combined with JVM heap saturation caused downstream timeout propagation.',
//
//     error_count: 18432,
//     users_impacted: 1260,
//     live_rate: { min: 3, max: 14, intervalMs: 900 }, // LIVE users increment tuning
//     business_impact:
//       'HIGH — Checkout degradation, elevated payment retries, and potential revenue leakage in peak periods.',
//
//     issues: [
//       {
//         id: 1,
//         severity: 'CRITICAL',
//         category: 'MEMORY',
//         title: 'JVM Heap Exhaustion Detected',
//         description:
//           'inventory-service heap usage exceeded 98% causing thread starvation and unstable response times.',
//         confidence: 0.96,
//         evidence: ['OutOfMemoryError: Java heap space', 'heap usage 98%'],
//         recommendation:
//           'Enable heap dump analysis and introduce adaptive load shedding.',
//         impact: 'Potential transaction retries and payment degradation.',
//         services: ['inventory-service', 'api-gateway'],
//       },
//     ],
//
//     anomalies: ['Retry storm amplification detected', 'Latency spike exceeded baseline by 240%'],
//     recommendations: ['Introduce circuit breakers', 'Enable autoscaling', 'Reduce retry fanout'],
//   },
//
//   {
//     use_case: 'DB Saturation',
//     summary: 'Database saturation is becoming the primary bottleneck across the platform.',
//     root_cause:
//       'Connection pool exhaustion combined with long-running SELECT queries created cascading failures.',
//
//     error_count: 9104,
//     users_impacted: 860,
//     live_rate: { min: 2, max: 10, intervalMs: 1000 },
//     business_impact: 'HIGH — Order processing delays and settlement slowness impacting SLA adherence.',
//
//     issues: [
//       {
//         id: 2,
//         severity: 'HIGH',
//         category: 'DATABASE',
//         title: 'Connection Pool Exhaustion',
//         description: 'Multiple services waited over 30 seconds for DB connections.',
//         confidence: 0.94,
//         evidence: ['Connection pool exhausted', 'Database query timeout after 15000 ms'],
//         recommendation: 'Tune HikariCP, introduce read replicas, and optimize slow queries.',
//         impact: 'Order processing delays and degraded settlement operations.',
//         services: ['db-proxy', 'payment-service'],
//       },
//     ],
//     anomalies: ['DB latency increased 310%', 'Concurrent query spike detected'],
//     recommendations: ['Optimize SQL queries', 'Add DB indexing', 'Implement query caching'],
//   },
//
//   {
//     use_case: 'Login Issues',
//     summary: 'Login failures are spiking due to authentication throttling and token verification errors.',
//     root_cause:
//       'Auth-service is intermittently rejecting valid sessions due to cache inconsistency and key rotation drift.',
//
//     error_count: 22390,
//     users_impacted: 3120,
//     live_rate: { min: 6, max: 24, intervalMs: 750 },
//     business_impact:
//       'CRITICAL — Customer login drop-offs, reduced conversion, increased support volume, and reputational impact.',
//
//     issues: [
//       {
//         id: 11,
//         severity: 'CRITICAL',
//         category: 'AUTH',
//         title: 'Login Failure Spike (401/403)',
//         description:
//           'Auth endpoints are intermittently failing, causing repeated login loops and session invalidations.',
//         confidence: 0.93,
//         evidence: ['401 Unauthorized spike', '403 Forbidden surge', 'session validation failures'],
//         recommendation:
//           'Stabilize key rotation cadence, enforce cache coherence, and add graceful session fallback.',
//         impact: 'Users unable to login; app shows repeated OTP/login prompts.',
//         services: ['auth-service', 'api-gateway'],
//       },
//     ],
//     anomalies: ['OTP resend rate increased', 'Session invalidation spike detected'],
//     recommendations: ['Introduce auth cache fallback', 'Add key rotation guardrails', 'Enable auth tracing'],
//   },
//
//   {
//     use_case: 'Transaction Timeout',
//     summary:
//       'Transaction flows are timing out due to downstream latency and queue backpressure during peak load.',
//     root_cause:
//       'Tail latency (p99) increased beyond timeout thresholds due to synchronous dependency calls and retry fanout.',
//
//     error_count: 15870,
//     users_impacted: 1975,
//     live_rate: { min: 4, max: 18, intervalMs: 850 },
//     business_impact:
//       'HIGH — Payment attempts fail, carts abandon, and retries increase PSP costs and operational load.',
//
//     issues: [
//       {
//         id: 12,
//         severity: 'HIGH',
//         category: 'TRANSACTION',
//         title: 'Payment Transaction Timeout',
//         description:
//           'Payment confirmation endpoints exceed timeout thresholds, causing retries and inconsistent states.',
//         confidence: 0.91,
//         evidence: ['Response time threshold exceeded: 7000+ ms', 'HTTP 504 Gateway Timeout'],
//         recommendation:
//           'Implement async confirmation + idempotency keys, reduce sync fanout, and tighten retry budgets.',
//         impact: 'User sees “Payment pending/failed” while backend eventually completes or duplicates.',
//         services: ['payment-service', 'api-gateway', 'db-proxy'],
//       },
//     ],
//     anomalies: ['Queue depth trend increasing', 'p99 latency exceeds baseline by 280%'],
//     recommendations: ['Enable idempotency', 'Move to async confirmation', 'Apply adaptive timeouts'],
//   },
//
//   {
//     use_case: 'Risk Use Case (Fraud / Risk Engine)',
//     summary:
//       'Risk evaluation latency and rule inconsistencies are causing false declines and intermittent checkout blocks.',
//     root_cause:
//       'Risk rules version drift + dependency timeouts lead to partial scoring and inconsistent decisions.',
//
//     error_count: 6430,
//     users_impacted: 740,
//     live_rate: { min: 1, max: 7, intervalMs: 1200 },
//     business_impact:
//       'MEDIUM/HIGH — False declines reduce revenue; elevated manual reviews increase operational cost.',
//
//     issues: [
//       {
//         id: 13,
//         severity: 'HIGH',
//         category: 'RISK',
//         title: 'Risk Scoring Decision Drift',
//         description:
//           'Different services are applying mismatched risk rule versions producing inconsistent allow/deny outcomes.',
//         confidence: 0.9,
//         evidence: ['risk_rules_version mismatch', 'score unavailable — fallback to deny'],
//         recommendation:
//           'Centralize risk rules, enforce version pinning, and add a “safe allow” fallback for low-risk segments.',
//         impact: 'Legitimate users declined; higher support and drop-off in checkout.',
//         services: ['risk-engine', 'payment-service'],
//       },
//     ],
//     anomalies: ['False decline signals increasing', 'Risk decision variance detected'],
//     recommendations: ['Pin rule versions', 'Add decision audit logs', 'Introduce deterministic scoring'],
//   },
//
//   {
//     use_case: 'JWT Synchronization',
//     summary:
//       'Authentication anomalies indicate possible JWT synchronization issues across services.',
//     root_cause:
//       'Invalid JWT signatures suggest stale signing keys or internal auth desynchronization.',
//
//     error_count: 4870,
//     users_impacted: 520,
//     live_rate: { min: 1, max: 5, intervalMs: 1300 },
//     business_impact:
//       'HIGH — Service-to-service auth breakage causes partial outages and failed internal workflows.',
//
//     issues: [
//       {
//         id: 3,
//         severity: 'CRITICAL',
//         category: 'SECURITY',
//         title: 'Repeated JWT Validation Failures',
//         description:
//           'Services are rejecting authentication tokens from internal requests.',
//         confidence: 0.92,
//         evidence: ['Authentication failure', 'invalid JWT signature from IP 192.168.1.42'],
//         recommendation: 'Rotate JWT keys and audit service-to-service authentication.',
//         impact: 'Potential unauthorized access attempts and broken internal communication.',
//         services: ['auth-service', 'inventory-service'],
//       },
//     ],
//     anomalies: ['Spike in token rejection events', 'Internal auth mismatch detected'],
//     recommendations: ['Rotate signing keys', 'Enable mTLS', 'Audit internal API auth'],
//   },
//
//   {
//     use_case: 'Retry Storms',
//     summary:
//       'Retry storms are amplifying infrastructure instability across dependent services.',
//     root_cause:
//       'Aggressive retry policies caused exponential traffic amplification under failure conditions.',
//
//     error_count: 12040,
//     users_impacted: 1105,
//     live_rate: { min: 2, max: 12, intervalMs: 950 },
//     business_impact: 'HIGH — Traffic amplification increases infra cost and worsens cascading failures.',
//
//     issues: [
//       {
//         id: 4,
//         severity: 'HIGH',
//         category: 'DEPENDENCY',
//         title: 'Retry Amplification Detected',
//         description: 'Services repeatedly retried failing downstream dependencies.',
//         confidence: 0.91,
//         evidence: ['Retry attempt 3/3', 'HTTP 503 from dependency inventory-service'],
//         recommendation: 'Implement exponential backoff with retry budgets.',
//         impact: 'Traffic spikes and cascading infrastructure collapse.',
//         services: ['api-gateway', 'payment-service'],
//       },
//     ],
//     anomalies: ['Retry amplification loop identified', 'Downstream dependency saturation'],
//     recommendations: ['Introduce queue-based retries', 'Apply retry jitter', 'Limit retry fanout'],
//   },
//
//   {
//     use_case: 'SSL Governance',
//     summary: 'Certificate governance weaknesses detected across production services.',
//     root_cause: 'SSL certificate lifecycle management is not automated.',
//
//     error_count: 980,
//     users_impacted: 140,
//     live_rate: { min: 0, max: 2, intervalMs: 1500 },
//     business_impact: 'MEDIUM — Expired certs can cause sudden outages and compliance breaches.',
//
//     issues: [
//       {
//         id: 5,
//         severity: 'MEDIUM',
//         category: 'SECURITY',
//         title: 'SSL Certificate Expiry Risk',
//         description: 'Multiple services have certificates expiring within 3 days.',
//         confidence: 0.95,
//         evidence: ['SSL certificate expires in 3 days'],
//         recommendation: 'Introduce automated certificate rotation using cert-manager.',
//         impact: 'Potential payment API failures and compliance violations.',
//         services: ['payment-service', 'api-gateway'],
//       },
//     ],
//     anomalies: ['Certificate expiry alerts increasing'],
//     recommendations: ['Automate cert renewal', 'Centralize cert governance', 'Enable expiry monitoring'],
//   },
//
//   {
//     use_case: 'CPU Saturation',
//     summary: 'CPU saturation indicates severe workload imbalance across core services.',
//     root_cause: 'High retry traffic and blocked threads created sustained CPU pressure.',
//
//     error_count: 5320,
//     users_impacted: 610,
//     live_rate: { min: 1, max: 8, intervalMs: 1100 },
//     business_impact: 'HIGH — Slower responses reduce throughput and elevate timeouts across the platform.',
//
//     issues: [
//       {
//         id: 6,
//         severity: 'HIGH',
//         category: 'CPU',
//         title: 'CPU Saturation Detected',
//         description: 'CPU utilization exceeded 85% for multiple consecutive minutes.',
//         confidence: 0.9,
//         evidence: ['CPU utilisation above 85%'],
//         recommendation: 'Introduce autoscaling and optimize blocking operations.',
//         impact: 'Slower response times and degraded API throughput.',
//         services: ['inventory-service', 'db-proxy'],
//       },
//     ],
//     anomalies: ['CPU saturation trend increasing'],
//     recommendations: ['Enable HPA scaling', 'Optimize thread pools', 'Reduce synchronous calls'],
//   },
//
//   {
//     use_case: 'Latency Degradation',
//     summary: 'Response latency degradation suggests systemic infrastructure saturation.',
//     root_cause: 'Tail latency increased significantly before hard failures occurred.',
//
//     error_count: 8040,
//     users_impacted: 980,
//     live_rate: { min: 2, max: 11, intervalMs: 1000 },
//     business_impact: 'HIGH — Poor customer experience and increased cart abandonment.',
//
//     issues: [
//       {
//         id: 7,
//         severity: 'HIGH',
//         category: 'PERFORMANCE',
//         title: 'Latency Threshold Violations',
//         description: 'Services exceeded configured latency thresholds consistently.',
//         confidence: 0.88,
//         evidence: ['Response time threshold exceeded: 4823 ms'],
//         recommendation: 'Implement p99 latency monitoring and adaptive traffic shaping.',
//         impact: 'Poor customer experience and transaction delays.',
//         services: ['api-gateway', 'inventory-service'],
//       },
//     ],
//     anomalies: ['p99 latency exceeded baseline'],
//     recommendations: ['Track tail latency', 'Enable adaptive scaling', 'Improve observability'],
//   },
//
//   {
//     use_case: 'Application Exceptions',
//     summary: 'Application-level exceptions indicate weak defensive engineering practices.',
//     root_cause: 'Unvalidated null handling caused failures in critical transaction flows.',
//
//     error_count: 3420,
//     users_impacted: 330,
//     live_rate: { min: 0, max: 4, intervalMs: 1400 },
//     business_impact: 'MEDIUM — Inconsistent order states and increased operational reconciliation effort.',
//
//     issues: [
//       {
//         id: 8,
//         severity: 'MEDIUM',
//         category: 'ERROR_RATE',
//         title: 'NullPointerException Spike',
//         description: 'Critical controllers are failing due to null object access.',
//         confidence: 0.89,
//         evidence: ['NullPointerException in OrderController.processOrder()'],
//         recommendation: 'Add DTO validation and fail-safe request handling.',
//         impact: 'Potential inconsistent order states.',
//         services: ['api-gateway', 'payment-service'],
//       },
//     ],
//     anomalies: ['Application exception rate increased'],
//     recommendations: ['Introduce schema validation', 'Improve exception handling', 'Add request guards'],
//   },
//
//   {
//     use_case: 'Log / Disk Saturation',
//     summary: 'Disk utilization trends indicate future operational risk for logging infrastructure.',
//     root_cause: 'Unmanaged log growth is exhausting filesystem capacity.',
//
//     error_count: 740,
//     users_impacted: 90,
//     live_rate: { min: 0, max: 2, intervalMs: 1600 },
//     business_impact: 'LOW/MEDIUM — Node instability risk leading to sporadic service restarts.',
//
//     issues: [
//       {
//         id: 9,
//         severity: 'LOW',
//         category: 'CONFIGURATION',
//         title: 'Log Volume Saturation',
//         description: 'Disk usage exceeded safe operational thresholds.',
//         confidence: 0.86,
//         evidence: ['Disk usage at 88% on /var/log'],
//         recommendation: 'Enable log rotation and centralized log archival.',
//         impact: 'Potential node instability and service crashes.',
//         services: ['auth-service', 'payment-service'],
//       },
//     ],
//     anomalies: ['Log storage growth accelerating'],
//     recommendations: ['Enable compression', 'Configure retention policies', 'Ship logs externally'],
//   },
//
//   {
//     use_case: 'Observability / Correlation',
//     summary: 'Observability maturity exists, but intelligent incident correlation is missing.',
//     root_cause: 'The platform generates alerts independently without causal aggregation.',
//
//     error_count: 0,
//     users_impacted: 0,
//     live_rate: { min: 0, max: 0, intervalMs: 2000 },
//     business_impact: 'INFO — Alert fatigue increases MTTR and reduces on-call effectiveness.',
//
//     issues: [
//       {
//         id: 10,
//         severity: 'INFO',
//         category: 'DEPENDENCY',
//         title: 'Fragmented Incident Visibility',
//         description: 'Alerts are generated independently without unified root cause mapping.',
//         confidence: 0.84,
//         evidence: ['Multiple independent alerts triggered simultaneously'],
//         recommendation: 'Introduce AI-driven root cause analysis and distributed tracing.',
//         impact: 'Longer MTTR and alert fatigue.',
//         services: ['all-services'],
//       },
//     ],
//     anomalies: ['Alert correlation gap identified'],
//     recommendations: ['Enable OpenTelemetry', 'Implement RCA engine', 'Add dependency topology mapping'],
//   },
// ]
//
// /* -------------------------------------------------------------------------- */
// /*                                 ISSUE CARD                                 */
// /* -------------------------------------------------------------------------- */
//
// function IssueCard({ issue }) {
//   const [expanded, setExpanded] = useState(false)
//
//   const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.INFO
//   const Icon = cfg.icon
//
//   return (
//     <div
//       onClick={() => setExpanded(!expanded)}
//       style={{
//         background: cfg.bg,
//         border: `1px solid ${cfg.color}33`,
//         borderLeft: `3px solid ${cfg.color}`,
//         borderRadius: 8,
//         padding: '12px 14px',
//         cursor: 'pointer',
//         marginBottom: 8,
//         transition: 'all 0.2s',
//       }}
//     >
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'flex-start',
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               marginBottom: 4,
//             }}
//           >
//             <Icon size={13} color={cfg.color} />
//
//             <span
//               style={{
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: cfg.color,
//               }}
//             >
//               {issue.severity}
//             </span>
//
//             <span
//               style={{
//                 fontSize: 11,
//                 color: 'var(--text-muted)',
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               {CATEGORY_ICONS[issue.category]} {issue.category}
//             </span>
//           </div>
//
//           <div
//             style={{
//               fontSize: 13,
//               fontWeight: 600,
//               color: 'var(--text-primary)',
//               marginBottom: 3,
//             }}
//           >
//             {issue.title}
//           </div>
//
//           <div
//             style={{
//               fontSize: 11,
//               color: 'var(--text-secondary)',
//               lineHeight: 1.5,
//             }}
//           >
//             {issue.description}
//           </div>
//         </div>
//
//         <div
//           style={{
//             marginLeft: 12,
//             textAlign: 'center',
//             minWidth: 44,
//             padding: '4px 8px',
//             borderRadius: 4,
//             background: 'rgba(0,0,0,0.3)',
//             border: '1px solid var(--border)',
//           }}
//         >
//           <div
//             style={{
//               fontSize: 16,
//               fontWeight: 800,
//               fontFamily: 'var(--font-mono)',
//               color: cfg.color,
//             }}
//           >
//             {Math.round(issue.confidence * 100)}%
//           </div>
//
//           <div
//             style={{
//               fontSize: 9,
//               color: 'var(--text-muted)',
//             }}
//           >
//             CONF
//           </div>
//         </div>
//       </div>
//
//       {expanded && (
//         <div
//           style={{
//             marginTop: 12,
//             paddingTop: 12,
//             borderTop: '1px solid var(--border)',
//           }}
//         >
//           {issue.evidence?.map((e, i) => (
//             <div
//               key={i}
//               style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: 11,
//                 padding: '4px 8px',
//                 marginBottom: 4,
//                 borderRadius: 4,
//                 background: 'var(--bg-base)',
//               }}
//             >
//               {e}
//             </div>
//           ))}
//
//           <div
//             style={{
//               marginTop: 10,
//               fontSize: 12,
//               color: 'var(--text-primary)',
//             }}
//           >
//             <strong>Recommendation:</strong> {issue.recommendation}
//           </div>
//
//           <div
//             style={{
//               marginTop: 8,
//               fontSize: 11,
//               color: 'var(--text-muted)',
//             }}
//           >
//             <strong>Impact:</strong> {issue.impact}
//           </div>
//
//           {!!issue.services?.length && (
//             <div
//               style={{
//                 marginTop: 8,
//                 fontSize: 11,
//                 color: 'var(--text-muted)',
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               <strong>Services:</strong> {issue.services.join(', ')}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
//
// /* -------------------------------------------------------------------------- */
// /*                              ANALYSIS PANEL                                */
// /* -------------------------------------------------------------------------- */
//
// export default function AnalysisPanel() {
//   const [running, setRunning] = useState(false)
//   const [localAnalysis, setLocalAnalysis] = useState(null)
//
//   // prevents recent duplicates
//   const [recentIndexes, setRecentIndexes] = useState([])
//
//   // LIVE PANEL: users impacted (increasing)
//   const [liveUsersImpacted, setLiveUsersImpacted] = useState(0)
//
//   // Keep a stable formatter (optional, helps perf)
//   const nf = useMemo(() => new Intl.NumberFormat(), [])
//
//   // When analysis changes, reset and start live increment
//   useEffect(() => {
//     if (!localAnalysis) return
//
//     setLiveUsersImpacted(localAnalysis.users_impacted ?? 0)
//
//     const rate = localAnalysis.live_rate || { min: 1, max: 6, intervalMs: 1000 }
//     const intervalMs = rate.intervalMs ?? 1000
//     const min = Math.max(0, rate.min ?? 1)
//     const max = Math.max(min, rate.max ?? 6)
//
//     const id = setInterval(() => {
//       // increment users impacted live
//       const delta =
//         min === 0 && max === 0
//           ? 0
//           : Math.floor(Math.random() * (max - min + 1)) + min
//
//       if (delta > 0) setLiveUsersImpacted(prev => prev + delta)
//     }, intervalMs)
//
//     return () => clearInterval(id)
//   }, [localAnalysis])
//
//   const triggerAnalysis = async () => {
//     setRunning(true)
//
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1200))
//
//       let availableIndexes = ANALYSIS_SETS.map((_, index) => index).filter(
//         index => !recentIndexes.includes(index)
//       )
//
//       // reset if exhausted
//       if (availableIndexes.length === 0) {
//         availableIndexes = ANALYSIS_SETS.map((_, index) => index)
//         setRecentIndexes([])
//       }
//
//       const randomIndex =
//         availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
//
//       const selectedAnalysis = ANALYSIS_SETS[randomIndex]
//
//       setRecentIndexes(prev => {
//         const updated = [...prev, randomIndex]
//         return updated.slice(-3)
//       })
//
//       setLocalAnalysis(selectedAnalysis)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setRunning(false)
//     }
//   }
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//         overflowY: 'auto',
//         padding: 16,
//       }}
//     >
//       {/* subtle live indicator animation (doesn't break existing CSS) */}
//       <style>{`
//         @keyframes pulseDot {
//           0% { transform: scale(1); opacity: .55; }
//           50% { transform: scale(1.25); opacity: 1; }
//           100% { transform: scale(1); opacity: .55; }
//         }
//       `}</style>
//
//       {/* Header */}
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: 16,
//         }}
//       >
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 8,
//           }}
//         >
//           <Brain size={15} color="var(--accent-purple)" />
//
//           <span
//             style={{
//               fontSize: 11,
//               fontFamily: 'var(--font-mono)',
//               letterSpacing: '0.1em',
//               color: 'var(--text-muted)',
//             }}
//           >
//             AI ANALYSIS
//           </span>
//         </div>
//
//         <button
//           onClick={triggerAnalysis}
//           disabled={running}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//             padding: '6px 14px',
//             borderRadius: 6,
//             border: '1px solid rgba(168,85,247,0.35)',
//             background: 'rgba(168,85,247,0.12)',
//             color: 'var(--accent-purple)',
//             cursor: running ? 'not-allowed' : 'pointer',
//           }}
//         >
//           <RefreshCw size={12} />
//           {running ? 'Analysing...' : 'Run Analysis'}
//         </button>
//       </div>
//
//       {!localAnalysis ? (
//         <div
//           style={{
//             textAlign: 'center',
//             padding: 32,
//             color: 'var(--text-muted)',
//             fontFamily: 'var(--font-mono)',
//           }}
//         >
//           Click "Run Analysis" to generate AI insights.
//         </div>
//       ) : (
//         <>
//           {/* Use case + KPI row */}
//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: '1.2fr 1fr 1.2fr',
//               gap: 10,
//               marginBottom: 14,
//             }}
//           >
//             {/* USE CASE */}
//             <div
//               style={{
//                 padding: '10px 14px',
//                 borderRadius: 8,
//                 background: 'rgba(168,85,247,0.06)',
//                 border: '1px solid rgba(168,85,247,0.2)',
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: 10,
//                   color: 'var(--accent-purple)',
//                   marginBottom: 6,
//                   fontFamily: 'var(--font-mono)',
//                   letterSpacing: '0.08em',
//                 }}
//               >
//                 USE CASE
//               </div>
//
//               <div
//                 style={{
//                   fontSize: 13,
//                   fontWeight: 700,
//                   color: 'var(--text-primary)',
//                   lineHeight: 1.4,
//                 }}
//               >
//                 {localAnalysis.use_case}
//               </div>
//
//               <div
//                 style={{
//                   marginTop: 6,
//                   fontSize: 11,
//                   color: 'var(--text-muted)',
//                   lineHeight: 1.5,
//                 }}
//               >
//                 {localAnalysis.summary}
//               </div>
//             </div>
//
//             {/* ERRORS */}
//             <div
//               style={{
//                 padding: '10px 14px',
//                 borderRadius: 8,
//                 background: 'rgba(255,51,85,0.04)',
//                 border: '1px solid rgba(255,51,85,0.18)',
//               }}
//             >
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 8,
//                   marginBottom: 6,
//                 }}
//               >
//                 <Bug size={13} color="var(--accent-red)" />
//                 <div
//                   style={{
//                     fontSize: 10,
//                     color: 'var(--accent-red)',
//                     fontFamily: 'var(--font-mono)',
//                     letterSpacing: '0.08em',
//                   }}
//                 >
//                   NO. OF ERRORS
//                 </div>
//               </div>
//
//               <div
//                 style={{
//                   fontSize: 18,
//                   fontWeight: 800,
//                   fontFamily: 'var(--font-mono)',
//                   color: 'var(--text-primary)',
//                 }}
//               >
//                 {nf.format(localAnalysis.error_count ?? 0)}
//               </div>
//
//               <div
//                 style={{
//                   marginTop: 4,
//                   fontSize: 10,
//                   color: 'var(--text-muted)',
//                   fontFamily: 'var(--font-mono)',
//                 }}
//               >
//                 last window
//               </div>
//             </div>
//
//             {/* USERS IMPACTED (LIVE) */}
//             <div
//               style={{
//                 padding: '10px 14px',
//                 borderRadius: 8,
//                 background: 'rgba(0,255,136,0.04)',
//                 border: '1px solid rgba(0,255,136,0.16)',
//                 position: 'relative',
//                 overflow: 'hidden',
//               }}
//             >
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   marginBottom: 6,
//                 }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <Users size={13} color="var(--accent-green)" />
//                   <div
//                     style={{
//                       fontSize: 10,
//                       color: 'var(--accent-green)',
//                       fontFamily: 'var(--font-mono)',
//                       letterSpacing: '0.08em',
//                     }}
//                   >
//                     USERS IMPACTED
//                   </div>
//                 </div>
//
//                 {/* LIVE DOT */}
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 6,
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: 10,
//                     color: 'var(--text-muted)',
//                   }}
//                 >
//                   <span
//                     style={{
//                       width: 7,
//                       height: 7,
//                       borderRadius: 99,
//                       background: 'var(--accent-green)',
//                       display: 'inline-block',
//                       animation: 'pulseDot 1.2s ease-in-out infinite',
//                     }}
//                   />
//                   LIVE
//                 </div>
//               </div>
//
//               <div
//                 style={{
//                   fontSize: 18,
//                   fontWeight: 800,
//                   fontFamily: 'var(--font-mono)',
//                   color: 'var(--text-primary)',
//                 }}
//               >
//                 {nf.format(liveUsersImpacted)}
//               </div>
//
//               <div
//                 style={{
//                   marginTop: 4,
//                   fontSize: 10,
//                   color: 'var(--text-muted)',
//                   fontFamily: 'var(--font-mono)',
//                 }}
//               >
//                 increasing in real-time
//               </div>
//             </div>
//           </div>
//
//           {/* BUSINESS IMPACT */}
//           <div
//             style={{
//               padding: '10px 14px',
//               borderRadius: 8,
//               marginBottom: 14,
//               background: 'rgba(255,122,0,0.06)',
//               border: '1px solid rgba(255,122,0,0.2)',
//             }}
//           >
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 8,
//                 marginBottom: 6,
//               }}
//             >
//               <TrendingDown size={13} color="var(--accent-orange)" />
//               <div
//                 style={{
//                   fontSize: 10,
//                   color: 'var(--accent-orange)',
//                   fontFamily: 'var(--font-mono)',
//                   letterSpacing: '0.08em',
//                 }}
//               >
//                 BUSINESS IMPACT
//               </div>
//             </div>
//
//             <div
//               style={{
//                 fontSize: 12,
//                 color: 'var(--text-primary)',
//                 lineHeight: 1.6,
//               }}
//             >
//               {localAnalysis.business_impact}
//             </div>
//           </div>
//
//           {/* ROOT CAUSE */}
//           <div
//             style={{
//               padding: '10px 14px',
//               borderRadius: 8,
//               marginBottom: 14,
//               background: 'rgba(255,122,0,0.06)',
//               border: '1px solid rgba(255,122,0,0.2)',
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--accent-orange)',
//                 marginBottom: 5,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               ROOT CAUSE HYPOTHESIS
//             </div>
//
//             <div
//               style={{
//                 fontSize: 12,
//                 color: 'var(--text-primary)',
//               }}
//             >
//               {localAnalysis.root_cause}
//             </div>
//           </div>
//
//           {/* ISSUES */}
//           <div style={{ marginBottom: 14 }}>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               DETECTED ISSUES ({localAnalysis.issues.length})
//             </div>
//
//             {localAnalysis.issues.map(issue => (
//               <IssueCard key={issue.id} issue={issue} />
//             ))}
//           </div>
//
//           {/* ANOMALIES */}
//           <div style={{ marginBottom: 14 }}>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               ANOMALIES
//             </div>
//
//             {localAnalysis.anomalies.map((a, i) => (
//               <div
//                 key={i}
//                 style={{
//                   padding: '6px 10px',
//                   marginBottom: 5,
//                   borderRadius: 4,
//                   background: 'var(--bg-card)',
//                   borderLeft: '2px solid var(--accent-orange)',
//                   fontFamily: 'var(--font-mono)',
//                   fontSize: 11,
//                 }}
//               >
//                 {a}
//               </div>
//             ))}
//           </div>
//
//           {/* RECOMMENDATIONS */}
//           <div>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               RECOMMENDATIONS
//             </div>
//
//             {localAnalysis.recommendations.map((r, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: 'flex',
//                   gap: 8,
//                   padding: '7px 10px',
//                   marginBottom: 5,
//                   borderRadius: 4,
//                   background: 'rgba(0,255,136,0.04)',
//                   border: '1px solid rgba(0,255,136,0.1)',
//                 }}
//               >
//                 <CheckCircle
//                   size={12}
//                   color="var(--accent-green)"
//                   style={{
//                     marginTop: 2,
//                     flexShrink: 0,
//                   }}
//                 />
//
//                 <span
//                   style={{
//                     fontSize: 12,
//                     color: 'var(--text-primary)',
//                   }}
//                 >
//                   {r}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

//
// import { useEffect, useMemo, useRef, useState } from 'react'
// import {
//   AlertTriangle,
//   CheckCircle,
//   Info,
//   Zap,
//   Brain,
//   RefreshCw,
//   Users,
//   Bug,
//   TrendingDown,
// } from 'lucide-react'
//
// const SEVERITY_CONFIG = {
//   CRITICAL: {
//     color: 'var(--accent-red)',
//     icon: AlertTriangle,
//     bg: 'rgba(255,51,85,0.08)',
//   },
//   HIGH: {
//     color: 'var(--accent-red)',
//     icon: AlertTriangle,
//     bg: 'rgba(255,51,85,0.05)',
//   },
//   MEDIUM: {
//     color: 'var(--accent-orange)',
//     icon: Zap,
//     bg: 'rgba(255,122,0,0.06)',
//   },
//   LOW: {
//     color: 'var(--accent-yellow)',
//     icon: Info,
//     bg: 'rgba(255,215,0,0.05)',
//   },
//   INFO: {
//     color: 'var(--accent-cyan)',
//     icon: Info,
//     bg: 'rgba(0,212,255,0.04)',
//   },
// }
//
// const CATEGORY_ICONS = {
//   PERFORMANCE: '⚡',
//   AVAILABILITY: '🔴',
//   ERROR_RATE: '❌',
//   MEMORY: '🧠',
//   CPU: '🖥️',
//   DATABASE: '🗄️',
//   NETWORK: '🌐',
//   SECURITY: '🔐',
//   DEPENDENCY: '🔗',
//   CONFIGURATION: '⚙️',
//   AUTH: '🪪',
//   TRANSACTION: '💳',
//   RISK: '🛡️',
//   CACHE: '🧊',
// }
//
// /* -------------------------------------------------------------------------- */
// /*                              ANALYSIS DATASETS                             */
// /*  Added fields: title, error_count, users_impacted, business_impact, live_rate */
// /* -------------------------------------------------------------------------- */
//
// const ANALYSIS_SETS = [
//   {
//     title: 'Inventory Degradation',
//     summary:
//       'Inventory-service memory exhaustion triggered cascading dependency failures across payment and gateway services.',
//     root_cause:
//       'Retry amplification combined with JVM heap saturation caused downstream timeout propagation.',
//     error_count: 18432,
//     users_impacted: 1260,
//     live_rate: { users: { min: -10, max: 18, intervalMs: 850 }, errors: { min: -120, max: 210 } },
//     business_impact:
//       'HIGH — Checkout degradation, elevated payment retries, and potential revenue leakage in peak periods.',
//     issues: [
//       {
//         id: 1,
//         severity: 'CRITICAL',
//         category: 'MEMORY',
//         title: 'JVM Heap Exhaustion Detected',
//         description:
//           'inventory-service heap usage exceeded 98% causing thread starvation and unstable response times.',
//         confidence: 0.96,
//         evidence: ['OutOfMemoryError: Java heap space', 'heap usage 98%'],
//         recommendation:
//           'Enable heap dump analysis and introduce adaptive load shedding.',
//         impact: 'Potential transaction retries and payment degradation.',
//         services: ['inventory-service', 'api-gateway'],
//       },
//     ],
//     anomalies: ['Retry storm amplification detected', 'Latency spike exceeded baseline by 240%'],
//     recommendations: ['Introduce circuit breakers', 'Enable autoscaling', 'Reduce retry fanout'],
//   },
//
//   {
//     title: 'DB Saturation',
//     summary: 'Database saturation is becoming the primary bottleneck across the platform.',
//     root_cause:
//       'Connection pool exhaustion combined with long-running SELECT queries created cascading failures.',
//     error_count: 9104,
//     users_impacted: 860,
//     live_rate: { users: { min: -7, max: 14, intervalMs: 950 }, errors: { min: -80, max: 160 } },
//     business_impact: 'HIGH — Order processing delays and settlement slowness impacting SLA adherence.',
//     issues: [
//       {
//         id: 2,
//         severity: 'HIGH',
//         category: 'DATABASE',
//         title: 'Connection Pool Exhaustion',
//         description: 'Multiple services waited over 30 seconds for DB connections.',
//         confidence: 0.94,
//         evidence: ['Connection pool exhausted', 'Database query timeout after 15000 ms'],
//         recommendation: 'Tune HikariCP, introduce read replicas, and optimize slow queries.',
//         impact: 'Order processing delays and degraded settlement operations.',
//         services: ['db-proxy', 'payment-service'],
//       },
//     ],
//     anomalies: ['DB latency increased 310%', 'Concurrent query spike detected'],
//     recommendations: ['Optimize SQL queries', 'Add DB indexing', 'Implement query caching'],
//   },
//
//   {
//     title: 'Login Issues',
//     summary:
//       'Login failures are spiking due to authentication throttling and token verification errors.',
//     root_cause:
//       'Auth-service intermittently rejects valid sessions due to cache inconsistency and key rotation drift.',
//     error_count: 22390,
//     users_impacted: 3120,
//     live_rate: { users: { min: -22, max: 30, intervalMs: 750 }, errors: { min: -160, max: 320 } },
//     business_impact:
//       'CRITICAL — Customer login drop-offs, reduced conversion, increased support volume, and reputational impact.',
//     issues: [
//       {
//         id: 11,
//         severity: 'CRITICAL',
//         category: 'AUTH',
//         title: 'Login Failure Spike (401/403)',
//         description:
//           'Auth endpoints are intermittently failing, causing repeated login loops and session invalidations.',
//         confidence: 0.93,
//         evidence: ['401 Unauthorized spike', '403 Forbidden surge', 'session validation failures'],
//         recommendation:
//           'Stabilize key rotation cadence, enforce cache coherence, and add graceful session fallback.',
//         impact: 'Users unable to login; repeated OTP/login prompts.',
//         services: ['auth-service', 'api-gateway'],
//       },
//     ],
//     anomalies: ['OTP resend rate increased', 'Session invalidation spike detected'],
//     recommendations: ['Introduce auth cache fallback', 'Add key rotation guardrails', 'Enable auth tracing'],
//   },
//
//   {
//     title: 'Transaction Timeout',
//     summary:
//       'Transaction flows are timing out due to downstream latency and queue backpressure during peak load.',
//     root_cause:
//       'Tail latency (p99) increased beyond timeout thresholds due to synchronous dependency calls and retry fanout.',
//     error_count: 15870,
//     users_impacted: 1975,
//     live_rate: { users: { min: -15, max: 24, intervalMs: 820 }, errors: { min: -140, max: 280 } },
//     business_impact:
//       'HIGH — Payment attempts fail, carts abandon, and retries increase PSP costs and operational load.',
//     issues: [
//       {
//         id: 12,
//         severity: 'HIGH',
//         category: 'TRANSACTION',
//         title: 'Payment Transaction Timeout',
//         description:
//           'Payment confirmation endpoints exceed timeout thresholds, causing retries and inconsistent states.',
//         confidence: 0.91,
//         evidence: ['Response time threshold exceeded: 7000+ ms', 'HTTP 504 Gateway Timeout'],
//         recommendation:
//           'Implement async confirmation + idempotency keys, reduce sync fanout, and tighten retry budgets.',
//         impact: 'User sees “Payment pending/failed” while backend eventually completes or duplicates.',
//         services: ['payment-service', 'api-gateway', 'db-proxy'],
//       },
//     ],
//     anomalies: ['Queue depth trend increasing', 'p99 latency exceeds baseline by 280%'],
//     recommendations: ['Enable idempotency', 'Move to async confirmation', 'Apply adaptive timeouts'],
//   },
//
//   {
//     title: 'Risk (Fraud / Risk Engine)',
//     summary:
//       'Risk evaluation latency and rule inconsistencies are causing false declines and intermittent checkout blocks.',
//     root_cause:
//       'Risk rules version drift + dependency timeouts lead to partial scoring and inconsistent decisions.',
//     error_count: 6430,
//     users_impacted: 740,
//     live_rate: { users: { min: -4, max: 9, intervalMs: 1200 }, errors: { min: -60, max: 120 } },
//     business_impact:
//       'MEDIUM/HIGH — False declines reduce revenue; elevated manual reviews increase operational cost.',
//     issues: [
//       {
//         id: 13,
//         severity: 'HIGH',
//         category: 'RISK',
//         title: 'Risk Scoring Decision Drift',
//         description:
//           'Mismatched risk rule versions produce inconsistent allow/deny outcomes.',
//         confidence: 0.9,
//         evidence: ['risk_rules_version mismatch', 'score unavailable — fallback to deny'],
//         recommendation:
//           'Centralize risk rules, enforce version pinning, and add deterministic scoring.',
//         impact: 'Legitimate users declined; higher support and drop-off in checkout.',
//         services: ['risk-engine', 'payment-service'],
//       },
//     ],
//     anomalies: ['False decline signals increasing', 'Risk decision variance detected'],
//     recommendations: ['Pin rule versions', 'Add decision audit logs', 'Introduce deterministic scoring'],
//   },
// ]
//
// /* -------------------------------------------------------------------------- */
// /*                                 ISSUE CARD                                 */
// /* -------------------------------------------------------------------------- */
//
// function IssueCard({ issue }) {
//   const [expanded, setExpanded] = useState(false)
//
//   const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.INFO
//   const Icon = cfg.icon
//
//   return (
//     <div
//       onClick={() => setExpanded(!expanded)}
//       style={{
//         background: cfg.bg,
//         border: `1px solid ${cfg.color}33`,
//         borderLeft: `3px solid ${cfg.color}`,
//         borderRadius: 8,
//         padding: '12px 14px',
//         cursor: 'pointer',
//         marginBottom: 8,
//         transition: 'all 0.2s',
//       }}
//     >
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'flex-start',
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               marginBottom: 4,
//             }}
//           >
//             <Icon size={13} color={cfg.color} />
//
//             <span
//               style={{
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: cfg.color,
//               }}
//             >
//               {issue.severity}
//             </span>
//
//             <span
//               style={{
//                 fontSize: 11,
//                 color: 'var(--text-muted)',
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               {CATEGORY_ICONS[issue.category]} {issue.category}
//             </span>
//           </div>
//
//           <div
//             style={{
//               fontSize: 13,
//               fontWeight: 600,
//               color: 'var(--text-primary)',
//               marginBottom: 3,
//             }}
//           >
//             {issue.title}
//           </div>
//
//           <div
//             style={{
//               fontSize: 11,
//               color: 'var(--text-secondary)',
//               lineHeight: 1.5,
//             }}
//           >
//             {issue.description}
//           </div>
//         </div>
//
//         <div
//           style={{
//             marginLeft: 12,
//             textAlign: 'center',
//             minWidth: 44,
//             padding: '4px 8px',
//             borderRadius: 4,
//             background: 'rgba(0,0,0,0.3)',
//             border: '1px solid var(--border)',
//           }}
//         >
//           <div
//             style={{
//               fontSize: 16,
//               fontWeight: 800,
//               fontFamily: 'var(--font-mono)',
//               color: cfg.color,
//             }}
//           >
//             {Math.round(issue.confidence * 100)}%
//           </div>
//
//           <div
//             style={{
//               fontSize: 9,
//               color: 'var(--text-muted)',
//             }}
//           >
//             CONF
//           </div>
//         </div>
//       </div>
//
//       {expanded && (
//         <div
//           style={{
//             marginTop: 12,
//             paddingTop: 12,
//             borderTop: '1px solid var(--border)',
//           }}
//         >
//           {issue.evidence?.map((e, i) => (
//             <div
//               key={i}
//               style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontSize: 11,
//                 padding: '4px 8px',
//                 marginBottom: 4,
//                 borderRadius: 4,
//                 background: 'var(--bg-base)',
//               }}
//             >
//               {e}
//             </div>
//           ))}
//
//           <div
//             style={{
//               marginTop: 10,
//               fontSize: 12,
//               color: 'var(--text-primary)',
//             }}
//           >
//             <strong>Recommendation:</strong> {issue.recommendation}
//           </div>
//
//           <div
//             style={{
//               marginTop: 8,
//               fontSize: 11,
//               color: 'var(--text-muted)',
//             }}
//           >
//             <strong>Impact:</strong> {issue.impact}
//           </div>
//
//           {!!issue.services?.length && (
//             <div
//               style={{
//                 marginTop: 8,
//                 fontSize: 11,
//                 color: 'var(--text-muted)',
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               <strong>Services:</strong> {issue.services.join(', ')}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
//
// /* -------------------------------------------------------------------------- */
// /*                              ANALYSIS PANEL                                */
// /* -------------------------------------------------------------------------- */
//
// // small helpers (no CSS changes)
// const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
// const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
//
// // creates “real looking” movement: random walk + mild mean reversion + noise
// function nextRealisticValue(current, baseline, minDelta, maxDelta, floor = 0) {
//   const driftTowardBaseline = Math.round((baseline - current) * 0.02) // gentle pull
//   const noise = randInt(minDelta, maxDelta)
//   const delta = driftTowardBaseline + noise
//
//   const next = Math.max(floor, current + delta)
//   return { next, delta }
// }
//
// export default function AnalysisPanel() {
//   const [running, setRunning] = useState(false)
//   const [localAnalysis, setLocalAnalysis] = useState(null)
//
//   // prevents recent duplicates
//   const [recentIndexes, setRecentIndexes] = useState([])
//
//   // LIVE METRICS (move even without re-running analysis)
//   const [liveUsersImpacted, setLiveUsersImpacted] = useState(0)
//   const [liveErrorCount, setLiveErrorCount] = useState(0)
//
//   // show last tick delta (makes it feel “real” without changing layout)
//   const [usersDelta, setUsersDelta] = useState(0)
//   const [errorsDelta, setErrorsDelta] = useState(0)
//
//   const nf = useMemo(() => new Intl.NumberFormat(), [])
//
//   // keep baselines stable for “mean reversion”
//   const baselineUsersRef = useRef(0)
//   const baselineErrorsRef = useRef(0)
//
//   // Live ticker runs whenever a scenario is displayed.
//   // It does NOT depend on pressing "Run Analysis" again.
//   useEffect(() => {
//     if (!localAnalysis) return
//
//     baselineUsersRef.current = localAnalysis.users_impacted ?? 0
//     baselineErrorsRef.current = localAnalysis.error_count ?? 0
//
//     setLiveUsersImpacted(localAnalysis.users_impacted ?? 0)
//     setLiveErrorCount(localAnalysis.error_count ?? 0)
//     setUsersDelta(0)
//     setErrorsDelta(0)
//
//     const usersCfg = localAnalysis.live_rate?.users || { min: -6, max: 12, intervalMs: 1000 }
//     const errorsCfg = localAnalysis.live_rate?.errors || { min: -80, max: 160 }
//     const intervalMs = usersCfg.intervalMs ?? 1000
//
//     const id = setInterval(() => {
//       // USERS: random-walk (up/down), gently pulled to baseline
//       setLiveUsersImpacted(prev => {
//         const { next, delta } = nextRealisticValue(
//           prev,
//           baselineUsersRef.current,
//           usersCfg.min ?? -6,
//           usersCfg.max ?? 12,
//           0
//         )
//         setUsersDelta(delta)
//         return next
//       })
//
//       // ERRORS: similar random-walk, can go down too (like recovery periods)
//       setLiveErrorCount(prev => {
//         const { next, delta } = nextRealisticValue(
//           prev,
//           baselineErrorsRef.current,
//           errorsCfg.min ?? -80,
//           errorsCfg.max ?? 160,
//           0
//         )
//         setErrorsDelta(delta)
//         return next
//       })
//     }, intervalMs)
//
//     return () => clearInterval(id)
//   }, [localAnalysis])
//
//   const triggerAnalysis = async () => {
//     setRunning(true)
//
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1200))
//
//       let availableIndexes = ANALYSIS_SETS.map((_, index) => index).filter(
//         index => !recentIndexes.includes(index)
//       )
//
//       // reset if exhausted
//       if (availableIndexes.length === 0) {
//         availableIndexes = ANALYSIS_SETS.map((_, index) => index)
//         setRecentIndexes([])
//       }
//
//       const randomIndex =
//         availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
//
//       const selectedAnalysis = ANALYSIS_SETS[randomIndex]
//
//       setRecentIndexes(prev => {
//         const updated = [...prev, randomIndex]
//         return updated.slice(-3)
//       })
//
//       setLocalAnalysis(selectedAnalysis)
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setRunning(false)
//     }
//   }
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//         overflowY: 'auto',
//         padding: 16,
//       }}
//     >
//       {/* subtle live indicator animation (no layout change) */}
//       <style>{`
//         @keyframes pulseDot {
//           0% { transform: scale(1); opacity: .55; }
//           50% { transform: scale(1.25); opacity: 1; }
//           100% { transform: scale(1); opacity: .55; }
//         }
//       `}</style>
//
//       {/* Header */}
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: 16,
//         }}
//       >
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 8,
//           }}
//         >
//           <Brain size={15} color="var(--accent-purple)" />
//
//           <span
//             style={{
//               fontSize: 11,
//               fontFamily: 'var(--font-mono)',
//               letterSpacing: '0.1em',
//               color: 'var(--text-muted)',
//             }}
//           >
//             AI ANALYSIS
//           </span>
//         </div>
//
//         <button
//           onClick={triggerAnalysis}
//           disabled={running}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//             padding: '6px 14px',
//             borderRadius: 6,
//             border: '1px solid rgba(168,85,247,0.35)',
//             background: 'rgba(168,85,247,0.12)',
//             color: 'var(--accent-purple)',
//             cursor: running ? 'not-allowed' : 'pointer',
//           }}
//         >
//           <RefreshCw size={12} />
//           {running ? 'Analysing...' : 'Run Analysis'}
//         </button>
//       </div>
//
//       {!localAnalysis ? (
//         <div
//           style={{
//             textAlign: 'center',
//             padding: 32,
//             color: 'var(--text-muted)',
//             fontFamily: 'var(--font-mono)',
//           }}
//         >
//           Click "Run Analysis" to generate AI insights.
//         </div>
//       ) : (
//         <>
//           {/* KPI row (layout preserved) */}
//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: '1.2fr 1fr 1.2fr',
//               gap: 10,
//               marginBottom: 14,
//             }}
//           >
//             {/* OVERVIEW CARD (same styling; removed any "use case" wording) */}
//             <div
//               style={{
//                 padding: '10px 14px',
//                 borderRadius: 8,
//                 background: 'rgba(168,85,247,0.06)',
//                 border: '1px solid rgba(168,85,247,0.2)',
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: 10,
//                   color: 'var(--accent-purple)',
//                   marginBottom: 6,
//                   fontFamily: 'var(--font-mono)',
//                   letterSpacing: '0.08em',
//                 }}
//               >
//                 OVERVIEW
//               </div>
//
//               <div
//                 style={{
//                   fontSize: 13,
//                   fontWeight: 700,
//                   color: 'var(--text-primary)',
//                   lineHeight: 1.4,
//                 }}
//               >
//                 {localAnalysis.title}
//               </div>
//
//               <div
//                 style={{
//                   marginTop: 6,
//                   fontSize: 11,
//                   color: 'var(--text-muted)',
//                   lineHeight: 1.5,
//                 }}
//               >
//                 {localAnalysis.summary}
//               </div>
//             </div>
//
//             {/* ERRORS (LIVE UP/DOWN) */}
//             <div
//               style={{
//                 padding: '10px 14px',
//                 borderRadius: 8,
//                 background: 'rgba(255,51,85,0.04)',
//                 border: '1px solid rgba(255,51,85,0.18)',
//               }}
//             >
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 8,
//                   marginBottom: 6,
//                 }}
//               >
//                 <Bug size={13} color="var(--accent-red)" />
//                 <div
//                   style={{
//                     fontSize: 10,
//                     color: 'var(--accent-red)',
//                     fontFamily: 'var(--font-mono)',
//                     letterSpacing: '0.08em',
//                   }}
//                 >
//                   NO. OF ERRORS
//                 </div>
//               </div>
//
//               <div
//                 style={{
//                   fontSize: 18,
//                   fontWeight: 800,
//                   fontFamily: 'var(--font-mono)',
//                   color: 'var(--text-primary)',
//                 }}
//               >
//                 {nf.format(liveErrorCount)}
//               </div>
//
//               {/* same line position; now shows realistic delta */}
//               <div
//                 style={{
//                   marginTop: 4,
//                   fontSize: 10,
//                   color: 'var(--text-muted)',
//                   fontFamily: 'var(--font-mono)',
//                 }}
//               >
//                 {errorsDelta === 0
//                   ? 'live'
//                   : `${errorsDelta > 0 ? '+' : ''}${nf.format(errorsDelta)} since last tick`}
//               </div>
//             </div>
//
//             {/* USERS IMPACTED (LIVE UP/DOWN) */}
//             <div
//               style={{
//                 padding: '10px 14px',
//                 borderRadius: 8,
//                 background: 'rgba(0,255,136,0.04)',
//                 border: '1px solid rgba(0,255,136,0.16)',
//                 position: 'relative',
//                 overflow: 'hidden',
//               }}
//             >
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   marginBottom: 6,
//                 }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <Users size={13} color="var(--accent-green)" />
//                   <div
//                     style={{
//                       fontSize: 10,
//                       color: 'var(--accent-green)',
//                       fontFamily: 'var(--font-mono)',
//                       letterSpacing: '0.08em',
//                     }}
//                   >
//                     USERS IMPACTED
//                   </div>
//                 </div>
//
//                 {/* LIVE DOT */}
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 6,
//                     fontFamily: 'var(--font-mono)',
//                     fontSize: 10,
//                     color: 'var(--text-muted)',
//                   }}
//                 >
//                   <span
//                     style={{
//                       width: 7,
//                       height: 7,
//                       borderRadius: 99,
//                       background: 'var(--accent-green)',
//                       display: 'inline-block',
//                       animation: 'pulseDot 1.2s ease-in-out infinite',
//                     }}
//                   />
//                   LIVE
//                 </div>
//               </div>
//
//               <div
//                 style={{
//                   fontSize: 18,
//                   fontWeight: 800,
//                   fontFamily: 'var(--font-mono)',
//                   color: 'var(--text-primary)',
//                 }}
//               >
//                 {nf.format(liveUsersImpacted)}
//               </div>
//
//               {/* same line position; now shows realistic delta */}
//               <div
//                 style={{
//                   marginTop: 4,
//                   fontSize: 10,
//                   color: 'var(--text-muted)',
//                   fontFamily: 'var(--font-mono)',
//                 }}
//               >
//                 {usersDelta === 0
//                   ? 'live'
//                   : `${usersDelta > 0 ? '+' : ''}${nf.format(usersDelta)} since last tick`}
//               </div>
//             </div>
//           </div>
//
//           {/* BUSINESS IMPACT */}
//           <div
//             style={{
//               padding: '10px 14px',
//               borderRadius: 8,
//               marginBottom: 14,
//               background: 'rgba(255,122,0,0.06)',
//               border: '1px solid rgba(255,122,0,0.2)',
//             }}
//           >
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 8,
//                 marginBottom: 6,
//               }}
//             >
//               <TrendingDown size={13} color="var(--accent-orange)" />
//               <div
//                 style={{
//                   fontSize: 10,
//                   color: 'var(--accent-orange)',
//                   fontFamily: 'var(--font-mono)',
//                   letterSpacing: '0.08em',
//                 }}
//               >
//                 BUSINESS IMPACT
//               </div>
//             </div>
//
//             <div
//               style={{
//                 fontSize: 12,
//                 color: 'var(--text-primary)',
//                 lineHeight: 1.6,
//               }}
//             >
//               {localAnalysis.business_impact}
//             </div>
//           </div>
//
//           {/* ROOT CAUSE */}
//           <div
//             style={{
//               padding: '10px 14px',
//               borderRadius: 8,
//               marginBottom: 14,
//               background: 'rgba(255,122,0,0.06)',
//               border: '1px solid rgba(255,122,0,0.2)',
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--accent-orange)',
//                 marginBottom: 5,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               ROOT CAUSE HYPOTHESIS
//             </div>
//
//             <div
//               style={{
//                 fontSize: 12,
//                 color: 'var(--text-primary)',
//               }}
//             >
//               {localAnalysis.root_cause}
//             </div>
//           </div>
//
//           {/* ISSUES */}
//           <div style={{ marginBottom: 14 }}>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               DETECTED ISSUES ({localAnalysis.issues.length})
//             </div>
//
//             {localAnalysis.issues.map(issue => (
//               <IssueCard key={issue.id} issue={issue} />
//             ))}
//           </div>
//
//           {/* ANOMALIES */}
//           <div style={{ marginBottom: 14 }}>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               ANOMALIES
//             </div>
//
//             {localAnalysis.anomalies.map((a, i) => (
//               <div
//                 key={i}
//                 style={{
//                   padding: '6px 10px',
//                   marginBottom: 5,
//                   borderRadius: 4,
//                   background: 'var(--bg-card)',
//                   borderLeft: '2px solid var(--accent-orange)',
//                   fontFamily: 'var(--font-mono)',
//                   fontSize: 11,
//                 }}
//               >
//                 {a}
//               </div>
//             ))}
//           </div>
//
//           {/* RECOMMENDATIONS */}
//           <div>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: 'var(--text-muted)',
//                 marginBottom: 8,
//                 fontFamily: 'var(--font-mono)',
//               }}
//             >
//               RECOMMENDATIONS
//             </div>
//
//             {localAnalysis.recommendations.map((r, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: 'flex',
//                   gap: 8,
//                   padding: '7px 10px',
//                   marginBottom: 5,
//                   borderRadius: 4,
//                   background: 'rgba(0,255,136,0.04)',
//                   border: '1px solid rgba(0,255,136,0.1)',
//                 }}
//               >
//                 <CheckCircle
//                   size={12}
//                   color="var(--accent-green)"
//                   style={{
//                     marginTop: 2,
//                     flexShrink: 0,
//                   }}
//                 />
//
//                 <span
//                   style={{
//                     fontSize: 12,
//                     color: 'var(--text-primary)',
//                   }}
//                 >
//                   {r}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   )
// }


import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle, Info, Zap, Brain, RefreshCw, Users, TrendingDown } from 'lucide-react'

const SEVERITY_CONFIG = {
  CRITICAL: { color: 'var(--accent-red)', icon: AlertTriangle, bg: 'rgba(255,51,85,0.08)' },
  HIGH: { color: 'var(--accent-red)', icon: AlertTriangle, bg: 'rgba(255,51,85,0.05)' },
  MEDIUM: { color: 'var(--accent-orange)', icon: Zap, bg: 'rgba(255,122,0,0.06)' },
  LOW: { color: 'var(--accent-yellow)', icon: Info, bg: 'rgba(255,215,0,0.05)' },
  INFO: { color: 'var(--accent-cyan)', icon: Info, bg: 'rgba(0,212,255,0.04)' },
}

const CATEGORY_ICONS = {
  PERFORMANCE: '⚡',
  AVAILABILITY: '🔴',
  ERROR_RATE: '❌',
  MEMORY: '🧠',
  CPU: '🖥️',
  DATABASE: '🗄️',
  NETWORK: '🌐',
  SECURITY: '🔐',
  DEPENDENCY: '🔗',
  CONFIGURATION: '⚙️',
  AUTH: '🪪',
  TRANSACTION: '💳',
  RISK: '🛡️',
  CACHE: '🧊',
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const LAKH = 100000

// same base for all analyses (you can change this)
const ACTIVE_USERS_BASE = 1250000 // 12.50 Lakhs

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randFloat = (min, max) => Math.random() * (max - min) + min

const formatLakhs = n => `${(n / LAKH).toFixed(2)}L`

// int random walk + mild mean reversion
function nextRealisticInt(current, baseline, minDelta, maxDelta, floor = 0) {
  const driftTowardBaseline = Math.round((baseline - current) * 0.02)
  const noise = randInt(minDelta, maxDelta)
  const delta = driftTowardBaseline + noise
  const next = Math.max(floor, current + delta)
  return { next, delta }
}

// float random walk + mild mean reversion (for impacted %)
function nextRealisticFloat(current, baseline, minDelta, maxDelta, minClamp, maxClamp) {
  const driftTowardBaseline = (baseline - current) * 0.06
  const noise = randFloat(minDelta, maxDelta)
  const delta = driftTowardBaseline + noise
  const next = clamp(current + delta, minClamp, maxClamp)
  return { next, delta }
}

/* -------------------------------------------------------------------------- */
/*                              ANALYSIS DATASETS                              */
/* -------------------------------------------------------------------------- */
/* NEW:
  - impacted_pct_base: baseline impacted percent for each analysis (3–7)
  - live_rate.active: controls active user live movement
  - live_rate.impactedPct: controls % live movement
*/

const ANALYSIS_SETS = [
  {
    title: 'Inventory Degradation',
    summary:
      'Inventory-service memory exhaustion triggered cascading dependency failures across payment and gateway services.',
    root_cause:
      'Retry amplification combined with JVM heap saturation caused downstream timeout propagation.',
    impacted_pct_base: 4.2,
    live_rate: {
      active: { min: -1400, max: 1600, intervalMs: 850 },
      impactedPct: { min: -0.18, max: 0.22 },
    },
    business_impact:
      'HIGH — Checkout degradation, elevated payment retries, and potential revenue leakage in peak periods.',
    issues: [
      {
        id: 1,
        severity: 'CRITICAL',
        category: 'MEMORY',
        title: 'JVM Heap Exhaustion Detected',
        description:
          'inventory-service heap usage exceeded 98% causing thread starvation and unstable response times.',
        confidence: 0.96,
        evidence: ['OutOfMemoryError: Java heap space', 'heap usage 98%'],
        recommendation: 'Enable heap dump analysis and introduce adaptive load shedding.',
        impact: 'Potential transaction retries and payment degradation.',
        services: ['inventory-service', 'api-gateway'],
      },
    ],
    anomalies: ['Retry storm amplification detected', 'Latency spike exceeded baseline by 240%'],
    recommendations: ['Introduce circuit breakers', 'Enable autoscaling', 'Reduce retry fanout'],
  },

  {
    title: 'DB Saturation',
    summary: 'Database saturation is becoming the primary bottleneck across the platform.',
    root_cause:
      'Connection pool exhaustion combined with long-running SELECT queries created cascading failures.',
    impacted_pct_base: 3.6,
    live_rate: {
      active: { min: -900, max: 1200, intervalMs: 950 },
      impactedPct: { min: -0.14, max: 0.18 },
    },
    business_impact: 'HIGH — Order processing delays and settlement slowness impacting SLA adherence.',
    issues: [
      {
        id: 2,
        severity: 'HIGH',
        category: 'DATABASE',
        title: 'Connection Pool Exhaustion',
        description: 'Multiple services waited over 30 seconds for DB connections.',
        confidence: 0.94,
        evidence: ['Connection pool exhausted', 'Database query timeout after 15000 ms'],
        recommendation: 'Tune HikariCP, introduce read replicas, and optimize slow queries.',
        impact: 'Order processing delays and degraded settlement operations.',
        services: ['db-proxy', 'payment-service'],
      },
    ],
    anomalies: ['DB latency increased 310%', 'Concurrent query spike detected'],
    recommendations: ['Optimize SQL queries', 'Add DB indexing', 'Implement query caching'],
  },

  {
    title: 'Login Issues',
    summary: 'Login failures are spiking due to authentication throttling and token verification errors.',
    root_cause:
      'Auth-service intermittently rejects valid sessions due to cache inconsistency and key rotation drift.',
    impacted_pct_base: 6.4,
    live_rate: {
      active: { min: -1700, max: 1900, intervalMs: 750 },
      impactedPct: { min: -0.22, max: 0.30 },
    },
    business_impact:
      'CRITICAL — Customer login drop-offs, reduced conversion, increased support volume, and reputational impact.',
    issues: [
      {
        id: 11,
        severity: 'CRITICAL',
        category: 'AUTH',
        title: 'Login Failure Spike (401/403)',
        description:
          'Auth endpoints are intermittently failing, causing repeated login loops and session invalidations.',
        confidence: 0.93,
        evidence: ['401 Unauthorized spike', '403 Forbidden surge', 'session validation failures'],
        recommendation:
          'Stabilize key rotation cadence, enforce cache coherence, and add graceful session fallback.',
        impact: 'Users unable to login; repeated OTP/login prompts.',
        services: ['auth-service', 'api-gateway'],
      },
    ],
    anomalies: ['OTP resend rate increased', 'Session invalidation spike detected'],
    recommendations: ['Introduce auth cache fallback', 'Add key rotation guardrails', 'Enable auth tracing'],
  },

  {
    title: 'Transaction Timeout',
    summary:
      'Transaction flows are timing out due to downstream latency and queue backpressure during peak load.',
    root_cause:
      'Tail latency (p99) increased beyond timeout thresholds due to synchronous dependency calls and retry fanout.',
    impacted_pct_base: 5.1,
    live_rate: {
      active: { min: -1200, max: 1500, intervalMs: 820 },
      impactedPct: { min: -0.18, max: 0.24 },
    },
    business_impact:
      'HIGH — Payment attempts fail, carts abandon, and retries increase PSP costs and operational load.',
    issues: [
      {
        id: 12,
        severity: 'HIGH',
        category: 'TRANSACTION',
        title: 'Payment Transaction Timeout',
        description:
          'Payment confirmation endpoints exceed timeout thresholds, causing retries and inconsistent states.',
        confidence: 0.91,
        evidence: ['Response time threshold exceeded: 7000+ ms', 'HTTP 504 Gateway Timeout'],
        recommendation:
          'Implement async confirmation + idempotency keys, reduce sync fanout, and tighten retry budgets.',
        impact: 'User sees “Payment pending/failed” while backend eventually completes or duplicates.',
        services: ['payment-service', 'api-gateway', 'db-proxy'],
      },
    ],
    anomalies: ['Queue depth trend increasing', 'p99 latency exceeds baseline by 280%'],
    recommendations: ['Enable idempotency', 'Move to async confirmation', 'Apply adaptive timeouts'],
  },

  {
    title: 'Risk (Fraud / Risk Engine)',
    summary:
      'Risk evaluation latency and rule inconsistencies are causing false declines and intermittent checkout blocks.',
    root_cause:
      'Risk rules version drift + dependency timeouts lead to partial scoring and inconsistent decisions.',
    impacted_pct_base: 3.2,
    live_rate: {
      active: { min: -700, max: 950, intervalMs: 1200 },
      impactedPct: { min: -0.10, max: 0.14 },
    },
    business_impact:
      'MEDIUM/HIGH — False declines reduce revenue; elevated manual reviews increase operational cost.',
    issues: [
      {
        id: 13,
        severity: 'HIGH',
        category: 'RISK',
        title: 'Risk Scoring Decision Drift',
        description: 'Mismatched risk rule versions produce inconsistent allow/deny outcomes.',
        confidence: 0.9,
        evidence: ['risk_rules_version mismatch', 'score unavailable — fallback to deny'],
        recommendation: 'Centralize risk rules, enforce version pinning, and add deterministic scoring.',
        impact: 'Legitimate users declined; higher support and drop-off in checkout.',
        services: ['risk-engine', 'payment-service'],
      },
    ],
    anomalies: ['False decline signals increasing', 'Risk decision variance detected'],
    recommendations: ['Pin rule versions', 'Add decision audit logs', 'Introduce deterministic scoring'],
  },
]

/* -------------------------------------------------------------------------- */
/*                                 ISSUE CARD                                 */
/* -------------------------------------------------------------------------- */

function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)

  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.INFO
  const Icon = cfg.icon

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.color}33`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 8,
        padding: '12px 14px',
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon size={13} color={cfg.color} />
            <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{issue.severity}</span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {CATEGORY_ICONS[issue.category]} {issue.category}
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
            {issue.title}
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {issue.description}
          </div>
        </div>

        <div
          style={{
            marginLeft: 12,
            textAlign: 'center',
            minWidth: 44,
            padding: '4px 8px',
            borderRadius: 4,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: cfg.color,
            }}
          >
            {Math.round(issue.confidence * 100)}%
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>CONF</div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {issue.evidence?.map((e, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                padding: '4px 8px',
                marginBottom: 4,
                borderRadius: 4,
                background: 'var(--bg-base)',
              }}
            >
              {e}
            </div>
          ))}

          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-primary)' }}>
            <strong>Recommendation:</strong> {issue.recommendation}
          </div>

          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            <strong>Impact:</strong> {issue.impact}
          </div>

          {!!issue.services?.length && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <strong>Services:</strong> {issue.services.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              ANALYSIS PANEL                                */
/* -------------------------------------------------------------------------- */

export default function AnalysisPanel() {
  const [running, setRunning] = useState(false)
  const [localAnalysis, setLocalAnalysis] = useState(null)
  const [recentIndexes, setRecentIndexes] = useState([])

  // LIVE: Active Users (slight movement)
  const [liveActiveUsers, setLiveActiveUsers] = useState(ACTIVE_USERS_BASE)
  const [activeDelta, setActiveDelta] = useState(0)

  // LIVE: Impacted % (3–7)
  const [liveImpactedPct, setLiveImpactedPct] = useState(4.0)
  const [impactedDelta, setImpactedDelta] = useState(0)

  const nf = useMemo(() => new Intl.NumberFormat(), [])

  // baselines for mean reversion
  const baselineActiveRef = useRef(ACTIVE_USERS_BASE)
  const baselineImpactedPctRef = useRef(4.0)

  useEffect(() => {
    if (!localAnalysis) return

    // baseline active is SAME always
    baselineActiveRef.current = ACTIVE_USERS_BASE

    // baseline impacted % differs per scenario
    baselineImpactedPctRef.current = clamp(localAnalysis.impacted_pct_base ?? 4.0, 3, 7)

    // initialize current values at scenario switch
    setLiveActiveUsers(ACTIVE_USERS_BASE)
    setActiveDelta(0)

    setLiveImpactedPct(baselineImpactedPctRef.current)
    setImpactedDelta(0)

    const activeCfg = localAnalysis.live_rate?.active || { min: -900, max: 1100, intervalMs: 1000 }
    const pctCfg = localAnalysis.live_rate?.impactedPct || { min: -0.12, max: 0.16 }
    const intervalMs = activeCfg.intervalMs ?? 1000

    const id = setInterval(() => {
      // Active users live movement
      setLiveActiveUsers(prev => {
        const { next, delta } = nextRealisticInt(
          prev,
          baselineActiveRef.current,
          activeCfg.min ?? -900,
          activeCfg.max ?? 1100,
          0
        )
        setActiveDelta(delta)
        return next
      })

      // Impacted % live movement (clamped 3..7)
      setLiveImpactedPct(prev => {
        const { next, delta } = nextRealisticFloat(
          prev,
          baselineImpactedPctRef.current,
          pctCfg.min ?? -0.12,
          pctCfg.max ?? 0.16,
          3,
          7
        )
        setImpactedDelta(delta)
        return next
      })
    }, intervalMs)

    return () => clearInterval(id)
  }, [localAnalysis])

  // derived impacted users count from active users + impacted %
  const impactedUsersAbs = Math.round((liveActiveUsers * liveImpactedPct) / 100)

  const triggerAnalysis = async () => {
    setRunning(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))

      let availableIndexes = ANALYSIS_SETS.map((_, index) => index).filter(
        index => !recentIndexes.includes(index)
      )

      if (availableIndexes.length === 0) {
        availableIndexes = ANALYSIS_SETS.map((_, index) => index)
        setRecentIndexes([])
      }

      const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
      const selectedAnalysis = ANALYSIS_SETS[randomIndex]

      setRecentIndexes(prev => [...prev, randomIndex].slice(-3))
      setLocalAnalysis(selectedAnalysis)
    } catch (e) {
      console.error(e)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 16 }}>
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: .55; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: .55; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={15} color="var(--accent-purple)" />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
            }}
          >
            AI ANALYSIS
          </span>
        </div>

        <button
          onClick={triggerAnalysis}
          disabled={running}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid rgba(168,85,247,0.35)',
            background: 'rgba(168,85,247,0.12)',
            color: 'var(--accent-purple)',
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={12} />
          {running ? 'Analysing...' : 'Run Analysis'}
        </button>
      </div>

      {!localAnalysis ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Click "Run Analysis" to generate AI insights.
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 10, marginBottom: 14 }}>
            {/* OVERVIEW */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.2)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--accent-purple)',
                  marginBottom: 6,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                }}
              >
                OVERVIEW
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {localAnalysis.title}
              </div>

              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {localAnalysis.summary}
              </div>
            </div>

            {/* ACTIVE USERS (LIVE, in Lakhs) */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Users size={13} color="var(--accent-cyan)" />
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.08em',
                  }}
                >
                  ACTIVE USERS
                </div>
              </div>

              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {formatLakhs(liveActiveUsers)}
              </div>

              <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {activeDelta === 0 ? 'live' : `${activeDelta > 0 ? '+' : ''}${nf.format(activeDelta)} since last tick`}
              </div>
            </div>

            {/* USERS IMPACTED (LIVE % 3–7 + derived count) */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(0,255,136,0.04)',
                border: '1px solid rgba(0,255,136,0.16)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={13} color="var(--accent-green)" />
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--accent-green)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    USERS IMPACTED
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 99,
                      background: 'var(--accent-green)',
                      display: 'inline-block',
                      animation: 'pulseDot 1.2s ease-in-out infinite',
                    }}
                  />
                  LIVE
                </div>
              </div>

              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {liveImpactedPct.toFixed(2)}%
              </div>

              <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ≈ {formatLakhs(impactedUsersAbs)} users impacted
              </div>

              <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {impactedDelta === 0 ? 'live' : `${impactedDelta > 0 ? '+' : ''}${impactedDelta.toFixed(2)}pp since last tick`}
              </div>
            </div>
          </div>

          {/* BUSINESS IMPACT */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 14,
              background: 'rgba(255,122,0,0.06)',
              border: '1px solid rgba(255,122,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <TrendingDown size={13} color="var(--accent-orange)" />
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--accent-orange)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                }}
              >
                BUSINESS IMPACT
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {localAnalysis.business_impact}
            </div>
          </div>

          {/* ROOT CAUSE */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 14,
              background: 'rgba(255,122,0,0.06)',
              border: '1px solid rgba(255,122,0,0.2)',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--accent-orange)', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>
              ROOT CAUSE HYPOTHESIS
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
              {localAnalysis.root_cause}
            </div>
          </div>

          {/* ISSUES */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
              DETECTED ISSUES ({localAnalysis.issues.length})
            </div>

            {localAnalysis.issues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>

          {/* ANOMALIES */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
              ANOMALIES
            </div>

            {localAnalysis.anomalies.map((a, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 10px',
                  marginBottom: 5,
                  borderRadius: 4,
                  background: 'var(--bg-card)',
                  borderLeft: '2px solid var(--accent-orange)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                }}
              >
                {a}
              </div>
            ))}
          </div>

          {/* RECOMMENDATIONS */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
              RECOMMENDATIONS
            </div>

            {localAnalysis.recommendations.map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: '7px 10px',
                  marginBottom: 5,
                  borderRadius: 4,
                  background: 'rgba(0,255,136,0.04)',
                  border: '1px solid rgba(0,255,136,0.1)',
                }}
              >
                <CheckCircle size={12} color="var(--accent-green)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{r}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}