// import { useEffect, useMemo, useRef, useState } from 'react'
// import { RefreshCw } from 'lucide-react'
//
// /* =========================
//    Applications (hard-coded)
// ========================= */
// const APPLICATIONS = [
//   'Payment-Infrastructure',
//   'Retail-Banking',
//   'Credit-Card-Processing',
//   'Loan-Management',
//   'Fraud-Detection',
//   'UPI-Gateway',
// ]
//
// /* =========================
//    Services (hard-coded)
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
//    Services by application
//    - As requested: only Payment-Infrastructure shows 6 services
// ========================= */
// const SERVICES_BY_APPLICATION = {
//   'Payment-Infrastructure': SERVICES,
//   'Retail-Banking': [],
//   'Credit-Card-Processing': [],
//   'Loan-Management': [],
//   'Fraud-Detection': [],
//   'UPI-Gateway': [],
// }
//
// /* =========================
//    Hard-coded patch updates
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
//         changes: ['limits.memory: 512Mi → 1024Mi', 'DBP_MAX_PENDING: 1200 → 900'],
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
//         <div style={{ fontSize: 11, fontWeight: 700, color }}>{type || 'PATCH'}</div>
//         <div style={{ fontSize: 10, opacity: 0.65 }}>{patch.ts}</div>
//       </div>
//
//       <div style={{ fontSize: 11, marginTop: 6, opacity: 0.9 }}>{patch.summary}</div>
//
//       <div style={{ fontSize: 10, marginTop: 6, opacity: 0.65 }}>
//         By: {patch.actor || 'system'}
//         {patch.incidentId ? ` | ${patch.incidentId}` : ''}
//       </div>
//
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
//   if (!details) return null
//   if (typeof details === 'string') return details
//
//   if (Array.isArray(details)) {
//     return details.map((x, idx) => (
//       <div key={idx}>• {String(x)}</div>
//     ))
//   }
//
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
//    NewIntegration (PATCHES ONLY)
// ========================= */
// export default function NewIntegration() {
//   const [selectedApp, setSelectedApp] = useState('Payment-Infrastructure')
//   const [selectedService, setSelectedService] = useState('api-gateway')
//
//   const [patches, setPatches] = useState(PATCHES_BY_SERVICE['api-gateway'] || [])
//   const [live, setLive] = useState(true)
//   const liveTimerRef = useRef(null)
//
//   const servicesForApp = useMemo(() => {
//     return SERVICES_BY_APPLICATION[selectedApp] ?? []
//   }, [selectedApp])
//
//   // When application changes, pick first service (if exists)
//   useEffect(() => {
//     if (servicesForApp.length > 0) {
//       setSelectedService(servicesForApp[0])
//     } else {
//       setSelectedService('')
//       setPatches([])
//     }
//   }, [servicesForApp])
//
//   // When service changes, load base patches
//   useEffect(() => {
//     if (!selectedService) {
//       setPatches([])
//       return
//     }
//     setPatches(PATCHES_BY_SERVICE[selectedService] || [])
//   }, [selectedService])
//
//   // Live simulation
//   useEffect(() => {
//     if (liveTimerRef.current) {
//       clearInterval(liveTimerRef.current)
//       liveTimerRef.current = null
//     }
//
//     if (!live || !selectedService) return
//
//     liveTimerRef.current = setInterval(() => {
//       setPatches((prev) => {
//         const lastSeq = prev.reduce((m, p) => Math.max(m, p.seq || 0), 0)
//
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
//         const next = [...prev, simulated]
//         return next.length > 80 ? next.slice(next.length - 80) : next
//       })
//     }, 8000)
//
//     return () => {
//       if (liveTimerRef.current) {
//         clearInterval(liveTimerRef.current)
//         liveTimerRef.current = null
//       }
//     }
//   }, [live, selectedService])
//
//   const resetPatches = () => {
//     if (!selectedService) return
//     setPatches(PATCHES_BY_SERVICE[selectedService] || [])
//   }
//
//   return (
//     <div
//   style={{
//     display: 'flex',
//     flexDirection: 'column',
//     height: '100dvh',     // ✅ modern viewport height (fixes mobile/browser UI cropping)
//     minHeight: 0,         // ✅ allows children to shrink and scroll properly
//     overflow: 'hidden',   // ✅ prevent body/page cropping; scroll stays inside list
//     background: '#0d0d0d',
//   }}
// >
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
//         <span style={{ fontSize: 12, color: '#00d4ff' }}>PATCH DASHBOARD</span>
//         <span style={{ fontSize: 10, opacity: 0.6 }}>{patches.length} updates</span>
//
//         <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
//           {/* LIVE toggle */}
//           <button
//             onClick={() => setLive((v) => !v)}
//             style={{
//               ...btnStyle,
//               padding: '4px 10px',
//               borderColor: live ? '#00d48a55' : '#ff335555',
//               color: live ? '#00d48a' : '#ff3355',
//               background: live ? '#00d48a22' : '#ff335522',
//             }}
//             title="Toggle live patch updates"
//           >
//             {live ? 'LIVE' : 'PAUSED'}
//           </button>
//         </div>
//       </div>
//
//       {/* CONTROLS */}
//       <div
//         style={{
//           padding: 12,
//           borderBottom: '1px solid #222',
//           background: '#101010',
//           display: 'flex',
//           gap: 10,
//           alignItems: 'center',
//           flexWrap: 'wrap',
//         }}
//       >
//         {/* Application dropdown */}
//         <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//           <span style={labelStyle}>Application</span>
//           <select
//             value={selectedApp}
//             onChange={(e) => setSelectedApp(e.target.value)}
//             style={{ ...inputStyle, minWidth: 220 }}
//           >
//             {APPLICATIONS.map((a) => (
//               <option key={a} value={a}>
//                 {a}
//               </option>
//             ))}
//           </select>
//         </div>
//
//         {/* Service dropdown */}
//         <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//           <span style={labelStyle}>Service</span>
//           <select
//             value={selectedService}
//             onChange={(e) => setSelectedService(e.target.value)}
//             style={{ ...inputStyle, minWidth: 200 }}
//             disabled={servicesForApp.length === 0}
//           >
//             {servicesForApp.length === 0 ? (
//               <option value="">No services for this application</option>
//             ) : (
//               servicesForApp.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))
//             )}
//           </select>
//         </div>
//
//         {/* Reset button */}
//         <button
//           onClick={resetPatches}
//           style={btnStyle}
//           title="Reset to base patch list"
//           disabled={!selectedService}
//         >
//           <RefreshCw size={14} />
//         </button>
//
//         <div style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7, color: '#fff' }}>
//           App: <span style={{ color: '#00d4ff' }}>{selectedApp}</span> &nbsp;|&nbsp; Service:{' '}
//           <span style={{ color: '#00d4ff' }}>{selectedService || '-'}</span>
//         </div>
//       </div>
//
//       {/* PATCH LIST (FULL PAGE CONTENT) */}
//       <div
//   style={{
//     flex: 1,
//     minHeight: 0,              // ✅ critical for scroll in flex layouts
//     overflowY: 'auto',
//     padding: '12px 12px 36px', // ✅ extra bottom padding so last card isn't clipped
//     scrollPaddingBottom: 36,   // ✅ keeps last item fully visible when scrolling
//     overscrollBehavior: 'contain',
//   }}
// >
//         {!selectedService ? (
//           <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
//             Select <span style={{ color: '#00d4ff' }}>Payment-Infrastructure</span> to see services and patches.
//           </div>
//         ) : patches.length === 0 ? (
//           <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
//             No patch updates for <span style={{ color: '#00d4ff' }}>{selectedService}</span>
//           </div>
//         ) : (
//           patches
//             .slice()
//             .sort((a, b) => (b.seq || 0) - (a.seq || 0))
//             .map((p) => <PatchRow key={`${p.service}-${p.seq}-${p.ts}`} patch={p} />)
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
//   padding: '6px 8px',
//   borderRadius: 6,
// }
//
// const btnStyle = {
//   padding: '6px 10px',
//   background: '#00d4ff22',
//   border: '1px solid #00d4ff55',
//   color: '#00d4ff',
//   cursor: 'pointer',
//   borderRadius: 6,
//   display: 'inline-flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   gap: 6,
// }
//
// const labelStyle = {
//   fontSize: 10,
//   opacity: 0.75,
//   color: '#fff',
// }


import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/* =========================
   Applications (hard-coded)
========================= */
const APPLICATIONS = [
  'Payment-Infrastructure',
  'Retail-Banking',
  'Credit-Card-Processing',
  'Loan-Management',
  'Fraud-Detection',
  'UPI-Gateway',
]

/* =========================
   Services (hard-coded)
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
   Services by application
   - Only Payment-Infrastructure shows services
========================= */
const SERVICES_BY_APPLICATION = {
  'Payment-Infrastructure': SERVICES,
  'Retail-Banking': [],
  'Credit-Card-Processing': [],
  'Loan-Management': [],
  'Fraud-Detection': [],
  'UPI-Gateway': [],
}

/* =========================
   Hard-coded patch updates
========================= */
const PATCHES_BY_SERVICE = {
  'db-proxy': [
    {
      seq: 1,
      ts: '2026-05-14T11:12:40+05:30',
      type: 'PATCH_PROPOSED',
      service: 'db-proxy',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-dbplatform',
      summary: 'Propose raising memory limit to avoid repeated OOMKills',
      details: { from: '512Mi', to: '1024Mi', reason: 'OOMKilled x3 in 6m' },
    },
    {
      seq: 2,
      ts: '2026-05-14T11:18:30+05:30',
      type: 'PATCH_APPLIED',
      service: 'db-proxy',
      incidentId: 'INC-2026-0514-001',
      actor: 'kubectl-breakglass',
      summary: 'Applied live patch to deployment',
      details: {
        cluster: 'aks-prod-scus-01',
        namespace: 'platform',
        resource: 'deployment/db-proxy',
        resourceVersionBefore: '9011221',
        resourceVersionAfter: '9011307',
        rollout: { started: '11:18:34', completed: '11:21:05' },
        changes: ['limits.memory: 512Mi → 1024Mi', 'DBP_MAX_PENDING: 1200 → 900'],
      },
    },
    {
      seq: 3,
      ts: '2026-05-14T11:21:40+05:30',
      type: 'PATCH_VERIFIED',
      service: 'db-proxy',
      incidentId: 'INC-2026-0514-001',
      actor: 'incident-commander',
      summary: 'OOMKills stopped; pool saturation reduced; connections stabilized',
      details: { oomKillsLast10m: 0, pendingQueue: 'normal', p95Latency: 'improving' },
    },
  ],

  'auth-service': [
    {
      seq: 1,
      ts: '2026-05-14T11:00:22+05:30',
      type: 'CONFIG_PATCH_APPLIED',
      service: 'auth-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'argo-sync',
      summary: 'Cache TTL reduced (rotation window)',
      details: { key: 'AUTH_JWKS_CACHE_TTL_SECONDS', from: '300', to: '30' },
    },
    {
      seq: 2,
      ts: '2026-05-14T11:22:10+05:30',
      type: 'PATCH_PROPOSED',
      service: 'auth-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-identity',
      summary: 'Propose increasing cache TTL to mitigate refresh storm',
      details: { key: 'AUTH_JWKS_CACHE_TTL_SECONDS', from: '30', to: '180' },
    },
    {
      seq: 3,
      ts: '2026-05-14T11:26:10+05:30',
      type: 'PATCH_APPLIED',
      service: 'auth-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'argo-sync',
      summary: 'Config patched; rollout restart triggered',
      details: { key: 'AUTH_JWKS_CACHE_TTL_SECONDS', from: '30', to: '180', podsRestarted: 10 },
    },
    {
      seq: 4,
      ts: '2026-05-14T11:29:40+05:30',
      type: 'PATCH_VERIFIED',
      service: 'auth-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'incident-commander',
      summary: 'Auth 5xx reduced; token validation stable',
      details: { auth5xx: '1.2%', timeouts: 'baseline' },
    },
  ],

  'api-gateway': [
    {
      seq: 1,
      ts: '2026-05-14T10:49:40+05:30',
      type: 'FEATURE_FLAG_PATCH',
      service: 'api-gateway',
      incidentId: 'INC-2026-0514-001',
      actor: 'ops-console',
      summary: 'Enable upstream timeout guardrails',
      details: { flag: 'EDGE_TIMEOUT_GUARDRAILS', from: 'off', to: 'on' },
    },
    {
      seq: 2,
      ts: '2026-05-14T11:09:55+05:30',
      type: 'MITIGATION',
      service: 'api-gateway',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-edge',
      summary: 'Reduce retry burst and extend upstream timeout briefly',
      details: { retries: '2 → 1', upstreamTimeoutMs: '800 → 1200', note: 'temporary during recovery' },
    },
    {
      seq: 3,
      ts: '2026-05-14T11:33:05+05:30',
      type: 'PATCH_VERIFIED',
      service: 'api-gateway',
      incidentId: 'INC-2026-0514-001',
      actor: 'incident-commander',
      summary: 'Gateway latency and error rate back to baseline',
      details: { gatewayP95: '185ms', errorRate: 'normal' },
    },
  ],

  'payment-service': [
    {
      seq: 1,
      ts: '2026-05-14T11:10:20+05:30',
      type: 'MITIGATION',
      service: 'payment-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-payments',
      summary: 'Temporarily raise circuit-breaker threshold to reduce cascading failures',
      details: { cbThreshold: 'default → relaxed', duration: '15m' },
    },
    {
      seq: 2,
      ts: '2026-05-14T11:27:30+05:30',
      type: 'PATCH_VERIFIED',
      service: 'payment-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-payments',
      summary: 'Payment requests stabilized after upstream recovery',
      details: { failureRate: 'baseline', timeouts: 'baseline' },
    },
  ],

  'inventory-service': [
    {
      seq: 1,
      ts: '2026-05-14T11:14:15+05:30',
      type: 'PATCH_PROPOSED',
      service: 'inventory-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-supply',
      summary: 'Propose increasing worker concurrency during incident window',
      details: { workers: '8 → 14', reason: 'backlog protection' },
    },
    {
      seq: 2,
      ts: '2026-05-14T11:20:55+05:30',
      type: 'PATCH_APPLIED',
      service: 'inventory-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'argo-sync',
      summary: 'Applied concurrency increase',
      details: { workers: '8 → 14', rollout: 'rolling' },
    },
  ],

  'notification-service': [
    {
      seq: 1,
      ts: '2026-05-14T11:16:45+05:30',
      type: 'MITIGATION',
      service: 'notification-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-messaging',
      summary: 'Throttle non-critical notifications to keep critical path clear',
      details: { throttle: 'non-critical', duration: '20m' },
    },
    {
      seq: 2,
      ts: '2026-05-14T11:31:10+05:30',
      type: 'PATCH_VERIFIED',
      service: 'notification-service',
      incidentId: 'INC-2026-0514-001',
      actor: 'oncall-messaging',
      summary: 'Queue depth recovered; consumer lag normal',
      details: { lag: 'baseline' },
    },
  ],
}

/* =========================
   Patch Card
========================= */
function PatchRow({ patch }) {
  const type = (patch.type || '').toUpperCase()

  const color =
    type.includes('APPLIED')
      ? '#00d4ff'
      : type.includes('PROPOSED')
        ? '#ff9f40'
        : type.includes('VERIFIED')
          ? '#00d48a'
          : type.includes('FAILED')
            ? '#ff3355'
            : '#999'

  return (
    <div
      style={{
        padding: '10px',
        marginBottom: 8,
        background: '#1a1a1a',
        border: `1px solid ${color}55`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 6,
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color }}>{type || 'PATCH'}</div>
        <div style={{ fontSize: 10, opacity: 0.65 }}>{patch.ts}</div>
      </div>

      <div style={{ fontSize: 11, marginTop: 6, opacity: 0.9 }}>{patch.summary}</div>

      <div style={{ fontSize: 10, marginTop: 6, opacity: 0.65 }}>
        By: {patch.actor || 'system'}
        {patch.incidentId ? ` | ${patch.incidentId}` : ''}
      </div>

      {patch.details && (
        <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6, lineHeight: 1.35 }}>
          {renderDetails(patch.details)}
        </div>
      )}
    </div>
  )
}

function renderDetails(details) {
  if (!details) return null
  if (typeof details === 'string') return details

  if (Array.isArray(details)) {
    return details.map((x, idx) => (
      <div key={idx}>• {String(x)}</div>
    ))
  }

  return Object.entries(details).map(([k, v]) => {
    if (v && typeof v === 'object') {
      return (
        <div key={k} style={{ marginTop: 4 }}>
          <div style={{ color: '#00d4ff', opacity: 0.85 }}>{k}:</div>
          <div style={{ marginLeft: 10 }}>{renderDetails(v)}</div>
        </div>
      )
    }
    return (
      <div key={k}>
        • {k}: {String(v)}
      </div>
    )
  })
}

/* =========================
   NewIntegration (PATCHES ONLY)
========================= */
export default function NewIntegration() {
  const [selectedApp, setSelectedApp] = useState('Payment-Infrastructure')
  const [selectedService, setSelectedService] = useState('api-gateway')

  const [patches, setPatches] = useState(PATCHES_BY_SERVICE['api-gateway'] || [])
  const [live, setLive] = useState(true)
  const liveTimerRef = useRef(null)

  // Scroll handling (smooth + smart autoscroll)
  const listRef = useRef(null)
  const stickToBottomRef = useRef(true)

  const servicesForApp = useMemo(() => {
    return SERVICES_BY_APPLICATION[selectedApp] ?? []
  }, [selectedApp])

  // ✅ Oldest -> newest to prevent scroll jumpiness in LIVE mode
  const sortedPatches = useMemo(() => {
    return patches.slice().sort((a, b) => (a.seq || 0) - (b.seq || 0))
  }, [patches])

  // Track whether user is near bottom (only then autoscroll on new items)
  const onListScroll = () => {
    const el = listRef.current
    if (!el) return
    const threshold = 90 // px
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distanceFromBottom < threshold
  }

  // Autoscroll to bottom when new patches arrive AND user is already near bottom
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (!stickToBottomRef.current) return

    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
  }, [sortedPatches.length])

  // When application changes, pick first service (if exists)
  useEffect(() => {
    if (servicesForApp.length > 0) {
      setSelectedService(servicesForApp[0])
    } else {
      setSelectedService('')
      setPatches([])
    }
  }, [servicesForApp])

  // When service changes, load base patches
  useEffect(() => {
    if (!selectedService) {
      setPatches([])
      return
    }
    setPatches(PATCHES_BY_SERVICE[selectedService] || [])
    // When service changes, start at bottom (log style)
    requestAnimationFrame(() => {
      const el = listRef.current
      if (el) el.scrollTo({ top: el.scrollHeight })
    })
  }, [selectedService])

  // Live simulation
  useEffect(() => {
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current)
      liveTimerRef.current = null
    }

    if (!live || !selectedService) return

    liveTimerRef.current = setInterval(() => {
      setPatches((prev) => {
        const lastSeq = prev.reduce((m, p) => Math.max(m, p.seq || 0), 0)

        const now = new Date()
        const pad = (n) => String(n).padStart(2, '0')
        const ts =
          `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
          `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}+05:30`

        const simulated = {
          seq: lastSeq + 1,
          ts,
          type: 'PATCH_UPDATE',
          service: selectedService,
          incidentId: 'INC-2026-0514-001',
          actor: 'live-monitor',
          summary: 'Live patch status update received',
          details: { note: 'stream update', status: 'ok' },
        }

        const next = [...prev, simulated]
        return next.length > 80 ? next.slice(next.length - 80) : next
      })
    }, LIVE_INTERVAL_MS)

    return () => {
      if (liveTimerRef.current) {
        clearInterval(liveTimerRef.current)
        liveTimerRef.current = null
      }
    }
  }, [live, selectedService])

  const resetPatches = () => {
    if (!selectedService) return
    setPatches(PATCHES_BY_SERVICE[selectedService] || [])
    requestAnimationFrame(() => {
      const el = listRef.current
      if (el) el.scrollTo({ top: el.scrollHeight })
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#0d0d0d',
      }}
    >
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
        <span style={{ fontSize: 12, color: '#00d4ff' }}>PATCH DASHBOARD</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{patches.length} updates</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setLive((v) => !v)}
            style={{
              ...btnStyle,
              padding: '4px 10px',
              borderColor: live ? '#00d48a55' : '#ff335555',
              color: live ? '#00d48a' : '#ff3355',
              background: live ? '#00d48a22' : '#ff335522',
            }}
            title="Toggle live patch updates"
          >
            {live ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div
        style={{
          padding: 12,
          borderBottom: '1px solid #222',
          background: '#101010',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={labelStyle}>Application</span>
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            style={{ ...inputStyle, minWidth: 220 }}
          >
            {APPLICATIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={labelStyle}>Service</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            style={{ ...inputStyle, minWidth: 200 }}
            disabled={servicesForApp.length === 0}
          >
            {servicesForApp.length === 0 ? (
              <option value="">No services for this application</option>
            ) : (
              servicesForApp.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={resetPatches}
          style={btnStyle}
          title="Reset to base patch list"
          disabled={!selectedService}
        >
          <RefreshCw size={14} />
        </button>

        <div style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7, color: '#fff' }}>
          App: <span style={{ color: '#00d4ff' }}>{selectedApp}</span> &nbsp;|&nbsp; Service:{' '}
          <span style={{ color: '#00d4ff' }}>{selectedService || '-'}</span>
        </div>
      </div>

      {/* PATCH LIST */}
      <div
        ref={listRef}
        onScroll={onListScroll}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // ✅ iOS smooth momentum
          padding: '12px 12px 0px',
          paddingBottom: `calc(36px + env(safe-area-inset-bottom))`, // ✅ last item not clipped
          scrollPaddingBottom: `calc(36px + env(safe-area-inset-bottom))`,
          overscrollBehavior: 'auto', // ✅ avoids sticky end
        }}
      >
        {!selectedService ? (
          <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
            Select <span style={{ color: '#00d4ff' }}>Payment-Infrastructure</span> to see services and patches.
          </div>
        ) : patches.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
            No patch updates for <span style={{ color: '#00d4ff' }}>{selectedService}</span>
          </div>
        ) : (
          sortedPatches.map((p) => (
            <PatchRow key={`${p.service}-${p.seq}-${p.ts}`} patch={p} />
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
  padding: '6px 8px',
  borderRadius: 6,
}

const btnStyle = {
  padding: '6px 10px',
  background: '#00d4ff22',
  border: '1px solid #00d4ff55',
  color: '#00d4ff',
  cursor: 'pointer',
  borderRadius: 6,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
}

const labelStyle = {
  fontSize: 10,
  opacity: 0.75,
  color: '#fff',
}
const LIVE_INTERVAL_MS = 25 * 60 * 1000 // 25 minutes