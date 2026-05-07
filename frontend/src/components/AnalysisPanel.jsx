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


import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Brain,
  RefreshCw,
} from 'lucide-react'

const SEVERITY_CONFIG = {
  CRITICAL: {
    color: 'var(--accent-red)',
    icon: AlertTriangle,
    bg: 'rgba(255,51,85,0.08)',
  },
  HIGH: {
    color: 'var(--accent-red)',
    icon: AlertTriangle,
    bg: 'rgba(255,51,85,0.05)',
  },
  MEDIUM: {
    color: 'var(--accent-orange)',
    icon: Zap,
    bg: 'rgba(255,122,0,0.06)',
  },
  LOW: {
    color: 'var(--accent-yellow)',
    icon: Info,
    bg: 'rgba(255,215,0,0.05)',
  },
  INFO: {
    color: 'var(--accent-cyan)',
    icon: Info,
    bg: 'rgba(0,212,255,0.04)',
  },
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
}

/* -------------------------------------------------------------------------- */
/*                              ANALYSIS DATASETS                             */
/* -------------------------------------------------------------------------- */

const ANALYSIS_SETS = [
  {
    summary:
      'Inventory-service memory exhaustion triggered cascading dependency failures across payment and gateway services.',

    root_cause:
      'Retry amplification combined with JVM heap saturation caused downstream timeout propagation.',

    issues: [
      {
        id: 1,
        severity: 'CRITICAL',
        category: 'MEMORY',
        title: 'JVM Heap Exhaustion Detected',
        description:
          'inventory-service heap usage exceeded 98% causing thread starvation and unstable response times.',
        confidence: 0.96,
        evidence: [
          'OutOfMemoryError: Java heap space',
          'heap usage 98%',
        ],
        recommendation:
          'Enable heap dump analysis and introduce adaptive load shedding.',
        impact:
          'Potential transaction retries and payment degradation.',
        services: ['inventory-service', 'api-gateway'],
      },
    ],

    anomalies: [
      'Retry storm amplification detected',
      'Latency spike exceeded baseline by 240%',
    ],

    recommendations: [
      'Introduce circuit breakers',
      'Enable autoscaling',
      'Reduce retry fanout',
    ],
  },

  {
    summary:
      'Database saturation is becoming the primary bottleneck across the platform.',

    root_cause:
      'Connection pool exhaustion combined with long-running SELECT queries created cascading failures.',

    issues: [
      {
        id: 2,
        severity: 'HIGH',
        category: 'DATABASE',
        title: 'Connection Pool Exhaustion',
        description:
          'Multiple services waited over 30 seconds for DB connections.',
        confidence: 0.94,
        evidence: [
          'Connection pool exhausted',
          'Database query timeout after 15000 ms',
        ],
        recommendation:
          'Tune HikariCP, introduce read replicas, and optimize slow queries.',
        impact:
          'Order processing delays and degraded settlement operations.',
        services: ['db-proxy', 'payment-service'],
      },
    ],

    anomalies: [
      'DB latency increased 310%',
      'Concurrent query spike detected',
    ],

    recommendations: [
      'Optimize SQL queries',
      'Add DB indexing',
      'Implement query caching',
    ],
  },

  {
    summary:
      'Authentication anomalies indicate possible JWT synchronization issues across services.',

    root_cause:
      'Invalid JWT signatures suggest stale signing keys or internal auth desynchronization.',

    issues: [
      {
        id: 3,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Repeated JWT Validation Failures',
        description:
          'Services are rejecting authentication tokens from internal requests.',
        confidence: 0.92,
        evidence: [
          'Authentication failure',
          'invalid JWT signature from IP 192.168.1.42',
        ],
        recommendation:
          'Rotate JWT keys and audit service-to-service authentication.',
        impact:
          'Potential unauthorized access attempts and broken internal communication.',
        services: ['auth-service', 'inventory-service'],
      },
    ],

    anomalies: [
      'Spike in token rejection events',
      'Internal auth mismatch detected',
    ],

    recommendations: [
      'Rotate signing keys',
      'Enable mTLS',
      'Audit internal API auth',
    ],
  },

  {
    summary:
      'Retry storms are amplifying infrastructure instability across dependent services.',

    root_cause:
      'Aggressive retry policies caused exponential traffic amplification under failure conditions.',

    issues: [
      {
        id: 4,
        severity: 'HIGH',
        category: 'DEPENDENCY',
        title: 'Retry Amplification Detected',
        description:
          'Services repeatedly retried failing downstream dependencies.',
        confidence: 0.91,
        evidence: [
          'Retry attempt 3/3',
          'HTTP 503 from dependency inventory-service',
        ],
        recommendation:
          'Implement exponential backoff with retry budgets.',
        impact:
          'Traffic spikes and cascading infrastructure collapse.',
        services: ['api-gateway', 'payment-service'],
      },
    ],

    anomalies: [
      'Retry amplification loop identified',
      'Downstream dependency saturation',
    ],

    recommendations: [
      'Introduce queue-based retries',
      'Apply retry jitter',
      'Limit retry fanout',
    ],
  },

  {
    summary:
      'Certificate governance weaknesses detected across production services.',

    root_cause:
      'SSL certificate lifecycle management is not automated.',

    issues: [
      {
        id: 5,
        severity: 'MEDIUM',
        category: 'SECURITY',
        title: 'SSL Certificate Expiry Risk',
        description:
          'Multiple services have certificates expiring within 3 days.',
        confidence: 0.95,
        evidence: [
          'SSL certificate expires in 3 days',
        ],
        recommendation:
          'Introduce automated certificate rotation using cert-manager.',
        impact:
          'Potential payment API failures and compliance violations.',
        services: ['payment-service', 'api-gateway'],
      },
    ],

    anomalies: [
      'Certificate expiry alerts increasing',
    ],

    recommendations: [
      'Automate cert renewal',
      'Centralize cert governance',
      'Enable expiry monitoring',
    ],
  },

  {
    summary:
      'CPU saturation indicates severe workload imbalance across core services.',

    root_cause:
      'High retry traffic and blocked threads created sustained CPU pressure.',

    issues: [
      {
        id: 6,
        severity: 'HIGH',
        category: 'CPU',
        title: 'CPU Saturation Detected',
        description:
          'CPU utilization exceeded 85% for multiple consecutive minutes.',
        confidence: 0.9,
        evidence: [
          'CPU utilisation above 85%',
        ],
        recommendation:
          'Introduce autoscaling and optimize blocking operations.',
        impact:
          'Slower response times and degraded API throughput.',
        services: ['inventory-service', 'db-proxy'],
      },
    ],

    anomalies: [
      'CPU saturation trend increasing',
    ],

    recommendations: [
      'Enable HPA scaling',
      'Optimize thread pools',
      'Reduce synchronous calls',
    ],
  },

  {
    summary:
      'Response latency degradation suggests systemic infrastructure saturation.',

    root_cause:
      'Tail latency increased significantly before hard failures occurred.',

    issues: [
      {
        id: 7,
        severity: 'HIGH',
        category: 'PERFORMANCE',
        title: 'Latency Threshold Violations',
        description:
          'Services exceeded configured latency thresholds consistently.',
        confidence: 0.88,
        evidence: [
          'Response time threshold exceeded: 4823 ms',
        ],
        recommendation:
          'Implement p99 latency monitoring and adaptive traffic shaping.',
        impact:
          'Poor customer experience and transaction delays.',
        services: ['api-gateway', 'inventory-service'],
      },
    ],

    anomalies: [
      'p99 latency exceeded baseline',
    ],

    recommendations: [
      'Track tail latency',
      'Enable adaptive scaling',
      'Improve observability',
    ],
  },

  {
    summary:
      'Application-level exceptions indicate weak defensive engineering practices.',

    root_cause:
      'Unvalidated null handling caused failures in critical transaction flows.',

    issues: [
      {
        id: 8,
        severity: 'MEDIUM',
        category: 'ERROR_RATE',
        title: 'NullPointerException Spike',
        description:
          'Critical controllers are failing due to null object access.',
        confidence: 0.89,
        evidence: [
          'NullPointerException in OrderController.processOrder()',
        ],
        recommendation:
          'Add DTO validation and fail-safe request handling.',
        impact:
          'Potential inconsistent order states.',
        services: ['api-gateway', 'payment-service'],
      },
    ],

    anomalies: [
      'Application exception rate increased',
    ],

    recommendations: [
      'Introduce schema validation',
      'Improve exception handling',
      'Add request guards',
    ],
  },

  {
    summary:
      'Disk utilization trends indicate future operational risk for logging infrastructure.',

    root_cause:
      'Unmanaged log growth is exhausting filesystem capacity.',

    issues: [
      {
        id: 9,
        severity: 'LOW',
        category: 'CONFIGURATION',
        title: 'Log Volume Saturation',
        description:
          'Disk usage exceeded safe operational thresholds.',
        confidence: 0.86,
        evidence: [
          'Disk usage at 88% on /var/log',
        ],
        recommendation:
          'Enable log rotation and centralized log archival.',
        impact:
          'Potential node instability and service crashes.',
        services: ['auth-service', 'payment-service'],
      },
    ],

    anomalies: [
      'Log storage growth accelerating',
    ],

    recommendations: [
      'Enable compression',
      'Configure retention policies',
      'Ship logs externally',
    ],
  },

  {
    summary:
      'Observability maturity exists, but intelligent incident correlation is missing.',

    root_cause:
      'The platform generates alerts independently without causal aggregation.',

    issues: [
      {
        id: 10,
        severity: 'INFO',
        category: 'DEPENDENCY',
        title: 'Fragmented Incident Visibility',
        description:
          'Alerts are generated independently without unified root cause mapping.',
        confidence: 0.84,
        evidence: [
          'Multiple independent alerts triggered simultaneously',
        ],
        recommendation:
          'Introduce AI-driven root cause analysis and distributed tracing.',
        impact:
          'Longer MTTR and alert fatigue.',
        services: ['all-services'],
      },
    ],

    anomalies: [
      'Alert correlation gap identified',
    ],

    recommendations: [
      'Enable OpenTelemetry',
      'Implement RCA engine',
      'Add dependency topology mapping',
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                                 ISSUE CARD                                 */
/* -------------------------------------------------------------------------- */

function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)

  const cfg =
    SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.INFO

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Icon size={13} color={cfg.color} />

            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: cfg.color,
              }}
            >
              {issue.severity}
            </span>

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

          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 3,
            }}
          >
            {issue.title}
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
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

          <div
            style={{
              fontSize: 9,
              color: 'var(--text-muted)',
            }}
          >
            CONF
          </div>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
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

          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
          >
            <strong>Recommendation:</strong>{' '}
            {issue.recommendation}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            <strong>Impact:</strong> {issue.impact}
          </div>
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

  // prevents recent duplicates
  const [recentIndexes, setRecentIndexes] = useState([])

  const triggerAnalysis = async () => {
    setRunning(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1200))

      let availableIndexes = ANALYSIS_SETS
        .map((_, index) => index)
        .filter(index => !recentIndexes.includes(index))

      // reset if exhausted
      if (availableIndexes.length === 0) {
        availableIndexes = ANALYSIS_SETS.map((_, index) => index)
        setRecentIndexes([])
      }

      const randomIndex =
        availableIndexes[
          Math.floor(Math.random() * availableIndexes.length)
        ]

      const selectedAnalysis = ANALYSIS_SETS[randomIndex]

      setRecentIndexes(prev => {
        const updated = [...prev, randomIndex]
        return updated.slice(-3)
      })

      setLocalAnalysis(selectedAnalysis)
    } catch (e) {
      console.error(e)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        padding: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Brain
            size={15}
            color="var(--accent-purple)"
          />

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
            border:
              '1px solid rgba(168,85,247,0.35)',
            background:
              'rgba(168,85,247,0.12)',
            color: 'var(--accent-purple)',
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={12} />

          {running ? 'Analysing...' : 'Run Analysis'}
        </button>
      </div>

      {!localAnalysis ? (
        <div
          style={{
            textAlign: 'center',
            padding: 32,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Click "Run Analysis" to generate AI insights.
        </div>
      ) : (
        <>
          {/* SUMMARY */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              marginBottom: 14,
              background:
                'rgba(168,85,247,0.06)',
              border:
                '1px solid rgba(168,85,247,0.2)',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: 'var(--accent-purple)',
                marginBottom: 6,
                fontFamily: 'var(--font-mono)',
              }}
            >
              EXECUTIVE SUMMARY
            </div>

            <div
              style={{
                fontSize: 13,
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              {localAnalysis.summary}
            </div>
          </div>

          {/* ROOT CAUSE */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 14,
              background:
                'rgba(255,122,0,0.06)',
              border:
                '1px solid rgba(255,122,0,0.2)',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: 'var(--accent-orange)',
                marginBottom: 5,
                fontFamily: 'var(--font-mono)',
              }}
            >
              ROOT CAUSE HYPOTHESIS
            </div>

            <div
              style={{
                fontSize: 12,
                color: 'var(--text-primary)',
              }}
            >
              {localAnalysis.root_cause}
            </div>
          </div>

          {/* ISSUES */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                marginBottom: 8,
                fontFamily: 'var(--font-mono)',
              }}
            >
              DETECTED ISSUES (
              {localAnalysis.issues.length})
            </div>

            {localAnalysis.issues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
              />
            ))}
          </div>

          {/* ANOMALIES */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                marginBottom: 8,
                fontFamily: 'var(--font-mono)',
              }}
            >
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
                  borderLeft:
                    '2px solid var(--accent-orange)',
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
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                marginBottom: 8,
                fontFamily: 'var(--font-mono)',
              }}
            >
              RECOMMENDATIONS
            </div>

            {localAnalysis.recommendations.map(
              (r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 8,
                    padding: '7px 10px',
                    marginBottom: 5,
                    borderRadius: 4,
                    background:
                      'rgba(0,255,136,0.04)',
                    border:
                      '1px solid rgba(0,255,136,0.1)',
                  }}
                >
                  <CheckCircle
                    size={12}
                    color="var(--accent-green)"
                    style={{
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {r}
                  </span>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}