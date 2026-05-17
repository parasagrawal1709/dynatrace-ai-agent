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
//
//
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
//    - Only Payment-Infrastructure shows services
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
//         ? '#ff9f40'
//         : type.includes('VERIFIED')
//           ? '#00d48a'
//           : type.includes('FAILED')
//             ? '#ff3355'
//             : '#999'
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
//   // Scroll handling (smooth + smart autoscroll)
//   const listRef = useRef(null)
//   const stickToBottomRef = useRef(true)
//
//   const servicesForApp = useMemo(() => {
//     return SERVICES_BY_APPLICATION[selectedApp] ?? []
//   }, [selectedApp])
//
//   // ✅ Oldest -> newest to prevent scroll jumpiness in LIVE mode
//   const sortedPatches = useMemo(() => {
//     return patches.slice().sort((a, b) => (a.seq || 0) - (b.seq || 0))
//   }, [patches])
//
//   // Track whether user is near bottom (only then autoscroll on new items)
//   const onListScroll = () => {
//     const el = listRef.current
//     if (!el) return
//     const threshold = 90 // px
//     const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
//     stickToBottomRef.current = distanceFromBottom < threshold
//   }
//
//   // Autoscroll to bottom when new patches arrive AND user is already near bottom
//   useEffect(() => {
//     const el = listRef.current
//     if (!el) return
//     if (!stickToBottomRef.current) return
//
//     requestAnimationFrame(() => {
//       el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
//     })
//   }, [sortedPatches.length])
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
//     // When service changes, start at bottom (log style)
//     requestAnimationFrame(() => {
//       const el = listRef.current
//       if (el) el.scrollTo({ top: el.scrollHeight })
//     })
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
//     }, LIVE_INTERVAL_MS)
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
//     requestAnimationFrame(() => {
//       const el = listRef.current
//       if (el) el.scrollTo({ top: el.scrollHeight })
//     })
//   }
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100dvh',
//         minHeight: '100vh',
//         overflow: 'hidden',
//         background: '#0d0d0d',
//       }}
//     >
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
//       {/* PATCH LIST */}
//       <div
//         ref={listRef}
//         onScroll={onListScroll}
//         style={{
//           flex: 1,
//           minHeight: 0,
//           overflowY: 'auto',
//           WebkitOverflowScrolling: 'touch', // ✅ iOS smooth momentum
//           padding: '12px 12px 0px',
//           paddingBottom: `calc(36px + env(safe-area-inset-bottom))`, // ✅ last item not clipped
//           scrollPaddingBottom: `calc(36px + env(safe-area-inset-bottom))`,
//           overscrollBehavior: 'auto', // ✅ avoids sticky end
//         }}
//       >
//         {!selectedService ? (
//           <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
//             Select <span style={{ color: '#00d4ff' }}>Payment-Infrastructure</span> to see services and patches.
//           </div>
//         ) : patches.length === 0 ? (
//           <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
//             No patch updates for <span style={{ color: '#00d4ff' }}>{selectedService}</span>
//           </div>
//         ) : (
//           sortedPatches.map((p) => (
//             <PatchRow key={`${p.service}-${p.seq}-${p.ts}`} patch={p} />
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
// const LIVE_INTERVAL_MS = 25 * 60 * 1000 // 25 minutes

// import { useEffect, useMemo, useRef, useState } from 'react'
// import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
//
// /* =========================
//    Constants
// ========================= */
// const LIVE_INTERVAL_MS = 25 * 60 * 1000 // 25 minutes
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
//    - Only Payment-Infrastructure shows services
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
//    Application Summary (hard-coded)
//    - servers: total server count for that application
//    - lastPatched: fallback if no patch exists in list
//    - patching: arbitrary info about patching policy / window / owner
// ========================= */
// const APP_SUMMARY_BY_APPLICATION = {
//   'Payment-Infrastructure': {
//     servers: 84,
//     lastPatched: '2026-05-14T11:33:05+05:30',
//     patching: {
//       cadence: 'Bi-weekly (Prod), Weekly (Non-prod)',
//       window: 'Thu 01:00–03:00 IST',
//       owner: 'Platform SRE',
//       risk: 'High (critical payments)',
//       notes: 'Requires change record + canary in 2 clusters before full rollout',
//     },
//   },
//   'Retail-Banking': {
//     servers: 52,
//     lastPatched: '2026-05-10T02:10:00+05:30',
//     patching: {
//       cadence: 'Monthly',
//       window: 'Sat 02:00–04:00 IST',
//       owner: 'Retail Ops',
//       risk: 'Medium',
//       notes: 'Patches only during low-traffic maintenance window',
//     },
//   },
//   'Credit-Card-Processing': {
//     servers: 39,
//     lastPatched: '2026-05-08T01:40:00+05:30',
//     patching: {
//       cadence: 'Monthly (strict)',
//       window: 'Sun 01:00–02:30 IST',
//       owner: 'Cards SRE',
//       risk: 'High',
//       notes: 'Requires PCI change approval; no LIVE patching except breakglass',
//     },
//   },
//   'Loan-Management': {
//     servers: 27,
//     lastPatched: '2026-05-06T03:05:00+05:30',
//     patching: {
//       cadence: 'Monthly',
//       window: 'Fri 02:00–03:00 IST',
//       owner: 'Lending Ops',
//       risk: 'Low',
//       notes: 'Batch-heavy; patching aligned with batch schedule',
//     },
//   },
//   'Fraud-Detection': {
//     servers: 44,
//     lastPatched: '2026-05-12T00:55:00+05:30',
//     patching: {
//       cadence: 'Weekly',
//       window: 'Wed 00:30–02:00 IST',
//       owner: 'Risk Engineering',
//       risk: 'Medium-High',
//       notes: 'Shadow mode validation required after patching',
//     },
//   },
//   'UPI-Gateway': {
//     servers: 61,
//     lastPatched: '2026-05-11T01:20:00+05:30',
//     patching: {
//       cadence: 'Bi-weekly',
//       window: 'Tue 01:00–02:00 IST',
//       owner: 'Payments SRE',
//       risk: 'High',
//       notes: 'Strict latency SLO; rollback playbook required',
//     },
//   },
// }
//
// /* =========================
//    Server counts per service (hard-coded)
// ========================= */
// const SERVERS_BY_SERVICE = {
//   'api-gateway': 12,
//   'auth-service': 10,
//   'payment-service': 16,
//   'inventory-service': 8,
//   'notification-service': 6,
//   'db-proxy': 4,
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
//         ? '#ff9f40'
//         : type.includes('VERIFIED')
//           ? '#00d48a'
//           : type.includes('FAILED')
//             ? '#ff3355'
//             : '#999'
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
//    Summary Bar (Collapsible)
// ========================= */
// function AppSummaryBar({
//   appName,
//   summary,
//   computedLastPatched,
//   patchState,
//   selectedService,
//   serviceServers,
//   hasService,
//   collapsed,
//   onToggle,
// }) {
//   const servers = summary?.servers ?? '-'
//   const cadence = summary?.patching?.cadence ?? '-'
//   const window = summary?.patching?.window ?? '-'
//   const owner = summary?.patching?.owner ?? '-'
//   const risk = summary?.patching?.risk ?? '-'
//   const notes = summary?.patching?.notes ?? '-'
//
//   const lastPatched = computedLastPatched || summary?.lastPatched || '-'
//
//   const riskColor =
//     String(risk).toLowerCase().includes('high')
//       ? '#ff9f40'
//       : String(risk).toLowerCase().includes('medium')
//         ? '#00d4ff'
//         : '#00d48a'
//
//   const stateLabel = patchState?.label ?? 'UNKNOWN'
//   const stateColor = patchState?.color ?? '#999'
//
//   return (
//     <div
//       style={{
//         margin: '10px 12px 0px',
//         background: '#121212',
//         border: '1px solid #2a2a2a',
//         borderRadius: 10,
//         color: '#fff',
//         boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
//         overflow: 'hidden',
//       }}
//     >
//       {/* Header row (always visible) */}
//       <button
//         onClick={onToggle}
//         style={{
//           width: '100%',
//           textAlign: 'left',
//           background: 'transparent',
//           border: 'none',
//           color: '#fff',
//           cursor: 'pointer',
//           padding: 12,
//           display: 'flex',
//           alignItems: 'center',
//           gap: 10,
//         }}
//         title={collapsed ? 'Expand summary' : 'Collapse summary'}
//       >
//         <span
//           style={{
//             width: 26,
//             height: 26,
//             borderRadius: 8,
//             display: 'inline-flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             background: '#0f0f0f',
//             border: '1px solid #2a2a2a',
//             flex: '0 0 auto',
//           }}
//         >
//           {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
//         </span>
//
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
//           <div style={{ fontSize: 12, fontWeight: 900, color: '#00d4ff' }}>{appName}</div>
//           <div style={{ fontSize: 10, opacity: 0.65 }}>
//             {hasService ? 'Service-level patches shown below' : 'No services mapped for this application'}
//           </div>
//         </div>
//
//         {/* Patch state pill (always visible) */}
//         <div
//           style={{
//             padding: '6px 10px',
//             borderRadius: 999,
//             background: '#0f0f0f',
//             border: `1px solid ${stateColor}55`,
//             color: stateColor,
//             fontSize: 10,
//             fontWeight: 900,
//             whiteSpace: 'nowrap',
//             flex: '0 0 auto',
//           }}
//         >
//           STATE: {stateLabel}
//         </div>
//       </button>
//
//       {/* Collapsible body */}
//       <div
//         style={{
//           maxHeight: collapsed ? 0 : 280,
//           transition: 'max-height 220ms ease',
//           overflow: 'hidden',
//         }}
//       >
//         <div style={{ padding: '0px 12px 12px' }}>
//           {/* Metrics row */}
//           <div
//             style={{
//               display: 'flex',
//               gap: 10,
//               flexWrap: 'wrap',
//               justifyContent: 'flex-start',
//               paddingTop: 4,
//             }}
//           >
//             <Metric label="App servers" value={String(servers)} accent="#00d4ff" />
//             <Metric label="Last patched" value={String(lastPatched)} accent="#00d48a" />
//             <Metric label="Cadence" value={String(cadence)} accent="#999" />
//             <Metric label="Window" value={String(window)} accent="#999" />
//             <Metric label="Owner" value={String(owner)} accent="#999" />
//             <Metric label="Risk" value={String(risk)} accent={riskColor} />
//
//             {selectedService ? (
//               <Metric
//                 label={`Service servers (${selectedService})`}
//                 value={serviceServers == null ? '-' : String(serviceServers)}
//                 accent="#8a7dff"
//               />
//             ) : null}
//           </div>
//
//           {/* Patching notes */}
//           <div style={{ marginTop: 10, fontSize: 10, opacity: 0.7, lineHeight: 1.35 }}>
//             <span style={{ color: '#00d4ff', opacity: 0.9, fontWeight: 800 }}>Patching info:</span> {notes}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
//
// function Metric({ label, value, accent }) {
//   return (
//     <div
//       style={{
//         padding: '6px 10px',
//         borderRadius: 8,
//         background: '#0f0f0f',
//         border: `1px solid ${accent}33`,
//         minWidth: 140,
//       }}
//     >
//       <div style={{ fontSize: 9, opacity: 0.65 }}>{label}</div>
//       <div
//         style={{
//           fontSize: 11,
//           fontWeight: 900,
//           color: accent,
//           marginTop: 2,
//           whiteSpace: 'nowrap',
//         }}
//       >
//         {value}
//       </div>
//     </div>
//   )
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
//   const [summaryCollapsed, setSummaryCollapsed] = useState(false)
//
//   const listRef = useRef(null)
//   const stickToBottomRef = useRef(true)
//
//   const servicesForApp = useMemo(() => {
//     return SERVICES_BY_APPLICATION[selectedApp] ?? []
//   }, [selectedApp])
//
//   const sortedPatches = useMemo(() => {
//     return patches.slice().sort((a, b) => (a.seq || 0) - (b.seq || 0))
//   }, [patches])
//
//   const appSummary = useMemo(() => {
//     return APP_SUMMARY_BY_APPLICATION[selectedApp] ?? null
//   }, [selectedApp])
//
//   const computedLastPatched = useMemo(() => {
//     if (!sortedPatches || sortedPatches.length === 0) return null
//     const last = sortedPatches[sortedPatches.length - 1]
//     return last?.ts ?? null
//   }, [sortedPatches])
//
//   const patchState = useMemo(() => {
//     const last = sortedPatches?.[sortedPatches.length - 1]
//     const t = (last?.type || '').toUpperCase()
//
//     if (!last) return { label: 'NO DATA', color: '#999' }
//     if (t.includes('FAILED')) return { label: 'FAILED', color: '#ff3355' }
//     if (t.includes('VERIFIED')) return { label: 'VERIFIED', color: '#00d48a' }
//     if (t.includes('APPLIED')) return { label: 'APPLIED', color: '#00d4ff' }
//     if (t.includes('PROPOSED')) return { label: 'PROPOSED', color: '#ff9f40' }
//     if (t.includes('UPDATE')) return { label: 'UPDATE', color: '#8a7dff' }
//
//     return { label: t || 'UNKNOWN', color: '#999' }
//   }, [sortedPatches])
//
//   const serviceServers = useMemo(() => {
//     if (!selectedService) return null
//     return SERVERS_BY_SERVICE[selectedService] ?? null
//   }, [selectedService])
//
//   const onListScroll = () => {
//     const el = listRef.current
//     if (!el) return
//     const threshold = 90
//     const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
//     stickToBottomRef.current = distanceFromBottom < threshold
//   }
//
//   useEffect(() => {
//     const el = listRef.current
//     if (!el) return
//     if (!stickToBottomRef.current) return
//
//     requestAnimationFrame(() => {
//       el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
//     })
//   }, [sortedPatches.length])
//
//   useEffect(() => {
//     if (servicesForApp.length > 0) {
//       setSelectedService(servicesForApp[0])
//     } else {
//       setSelectedService('')
//       setPatches([])
//     }
//     setSummaryCollapsed(false)
//   }, [servicesForApp])
//
//   useEffect(() => {
//     if (!selectedService) {
//       setPatches([])
//       return
//     }
//
//     setPatches(PATCHES_BY_SERVICE[selectedService] || [])
//
//     requestAnimationFrame(() => {
//       const el = listRef.current
//       if (el) el.scrollTo({ top: el.scrollHeight })
//     })
//   }, [selectedService])
//
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
//     }, LIVE_INTERVAL_MS)
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
//     requestAnimationFrame(() => {
//       const el = listRef.current
//       if (el) el.scrollTo({ top: el.scrollHeight })
//     })
//   }
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100dvh',
//         minHeight: '100vh',
//         overflow: 'hidden',
//         background: '#0d0d0d',
//       }}
//     >
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
//       {/* SUMMARY BAR */}
//       <AppSummaryBar
//         appName={selectedApp}
//         summary={appSummary}
//         computedLastPatched={computedLastPatched}
//         patchState={patchState}
//         selectedService={selectedService}
//         serviceServers={serviceServers}
//         hasService={servicesForApp.length > 0}
//         collapsed={summaryCollapsed}
//         onToggle={() => setSummaryCollapsed((v) => !v)}
//       />
//
//       {/* PATCH LIST */}
//       <div
//         ref={listRef}
//         onScroll={onListScroll}
//         style={{
//           flex: 1,
//           minHeight: 0,
//           overflowY: 'auto',
//           WebkitOverflowScrolling: 'touch',
//           padding: '12px 12px 0px',
//           paddingBottom: `calc(36px + env(safe-area-inset-bottom))`,
//           scrollPaddingBottom: `calc(36px + env(safe-area-inset-bottom))`,
//           overscrollBehavior: 'auto',
//         }}
//       >
//         {!selectedService ? (
//           <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
//             Select <span style={{ color: '#00d4ff' }}>Payment-Infrastructure</span> to see services and patches.
//           </div>
//         ) : patches.length === 0 ? (
//           <div style={{ color: '#aaa', fontSize: 11, padding: 10 }}>
//             No patch updates for <span style={{ color: '#00d4ff' }}>{selectedService}</span>
//           </div>
//         ) : (
//           sortedPatches.map((p) => (
//             <PatchRow key={`${p.service}-${p.seq}-${p.ts}`} patch={p} />
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
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

/* =========================
   Constants
========================= */
const LIVE_INTERVAL_MS = 25 * 60 * 1000 // 25 minutes

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
   Application Summary (hard-coded)
========================= */
const APP_SUMMARY_BY_APPLICATION = {
  'Payment-Infrastructure': {
    servers: 84,
    lastPatched: '2026-05-14T11:33:05+05:30',
    patching: {
      cadence: 'Bi-weekly (Prod), Weekly (Non-prod)',
      window: 'Thu 01:00–03:00 IST',
      owner: 'Platform SRE',
      risk: 'High (critical payments)',
      notes: 'Requires change record + canary in 2 clusters before full rollout',
    },
  },
  'Retail-Banking': {
    servers: 52,
    lastPatched: '2026-05-10T02:10:00+05:30',
    patching: {
      cadence: 'Monthly',
      window: 'Sat 02:00–04:00 IST',
      owner: 'Retail Ops',
      risk: 'Medium',
      notes: 'Patches only during low-traffic maintenance window',
    },
  },
  'Credit-Card-Processing': {
    servers: 39,
    lastPatched: '2026-05-08T01:40:00+05:30',
    patching: {
      cadence: 'Monthly (strict)',
      window: 'Sun 01:00–02:30 IST',
      owner: 'Cards SRE',
      risk: 'High',
      notes: 'Requires PCI change approval; no LIVE patching except breakglass',
    },
  },
  'Loan-Management': {
    servers: 27,
    lastPatched: '2026-05-06T03:05:00+05:30',
    patching: {
      cadence: 'Monthly',
      window: 'Fri 02:00–03:00 IST',
      owner: 'Lending Ops',
      risk: 'Low',
      notes: 'Batch-heavy; patching aligned with batch schedule',
    },
  },
  'Fraud-Detection': {
    servers: 44,
    lastPatched: '2026-05-12T00:55:00+05:30',
    patching: {
      cadence: 'Weekly',
      window: 'Wed 00:30–02:00 IST',
      owner: 'Risk Engineering',
      risk: 'Medium-High',
      notes: 'Shadow mode validation required after patching',
    },
  },
  'UPI-Gateway': {
    servers: 61,
    lastPatched: '2026-05-11T01:20:00+05:30',
    patching: {
      cadence: 'Bi-weekly',
      window: 'Tue 01:00–02:00 IST',
      owner: 'Payments SRE',
      risk: 'High',
      notes: 'Strict latency SLO; rollback playbook required',
    },
  },
}

/* =========================
   Server counts per service (hard-coded)
========================= */
const SERVERS_BY_SERVICE = {
  'api-gateway': 12,
  'auth-service': 10,
  'payment-service': 16,
  'inventory-service': 8,
  'notification-service': 6,
  'db-proxy': 4,
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
   Patch Row
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
        marginBottom: 10,
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
   Summary Bar (Collapsible)
========================= */
function AppSummaryBar({
  appName,
  summary,
  computedLastPatched,
  patchState,
  selectedService,
  serviceServers,
  hasService,
  collapsed,
  onToggle,
}) {
  const servers = summary?.servers ?? '-'
  const cadence = summary?.patching?.cadence ?? '-'
  const window = summary?.patching?.window ?? '-'
  const owner = summary?.patching?.owner ?? '-'
  const risk = summary?.patching?.risk ?? '-'
  const notes = summary?.patching?.notes ?? '-'

  const lastPatched = computedLastPatched || summary?.lastPatched || '-'

  const riskColor =
    String(risk).toLowerCase().includes('high')
      ? '#ff9f40'
      : String(risk).toLowerCase().includes('medium')
        ? '#00d4ff'
        : '#00d48a'

  const stateLabel = patchState?.label ?? 'UNKNOWN'
  const stateColor = patchState?.color ?? '#999'

  return (
    <div
      style={{
        margin: '10px 12px 0px',
        background: '#121212',
        border: '1px solid #2a2a2a',
        borderRadius: 10,
        color: '#fff',
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}
    >
      {/* Header row (always visible) */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
        title={collapsed ? 'Expand summary' : 'Collapse summary'}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f0f0f',
            border: '1px solid #2a2a2a',
            flex: '0 0 auto',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#00d4ff' }}>{appName}</div>
          <div style={{ fontSize: 10, opacity: 0.65 }}>
            {hasService ? 'Service-level patches shown below' : 'No services mapped for this application'}
          </div>
        </div>

        {/* Patch state pill */}
        <div
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            background: '#0f0f0f',
            border: `1px solid ${stateColor}55`,
            color: stateColor,
            fontSize: 10,
            fontWeight: 900,
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
          }}
        >
          STATE: {stateLabel}
        </div>
      </button>

      {/* Collapsible body */}
      <div
        style={{
          maxHeight: collapsed ? 0 : 280,
          transition: 'max-height 220ms ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '0px 12px 12px' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              paddingTop: 4,
            }}
          >
            <Metric label="App servers" value={String(servers)} accent="#00d4ff" />
            <Metric label="Last patched" value={String(lastPatched)} accent="#00d48a" />
            <Metric label="Cadence" value={String(cadence)} accent="#999" />
            <Metric label="Window" value={String(window)} accent="#999" />
            <Metric label="Owner" value={String(owner)} accent="#999" />
            <Metric label="Risk" value={String(risk)} accent={riskColor} />

            {selectedService ? (
              <Metric
                label={`Service servers (${selectedService})`}
                value={serviceServers == null ? '-' : String(serviceServers)}
                accent="#8a7dff"
              />
            ) : null}
          </div>

          <div style={{ marginTop: 10, fontSize: 10, opacity: 0.7, lineHeight: 1.35 }}>
            <span style={{ color: '#00d4ff', opacity: 0.9, fontWeight: 800 }}>Patching info:</span> {notes}
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, accent }) {
  return (
    <div
      style={{
        padding: '6px 10px',
        borderRadius: 8,
        background: '#0f0f0f',
        border: `1px solid ${accent}33`,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 9, opacity: 0.65 }}>{label}</div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: accent,
          marginTop: 2,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
    </div>
  )
}

/* =========================
   NewIntegration
========================= */
export default function NewIntegration() {
  const [selectedApp, setSelectedApp] = useState('Payment-Infrastructure')
  const [selectedService, setSelectedService] = useState('api-gateway')

  const [patches, setPatches] = useState(PATCHES_BY_SERVICE['api-gateway'] || [])
  const [live, setLive] = useState(true)
  const liveTimerRef = useRef(null)

  // Summary bar collapse state
  const [summaryCollapsed, setSummaryCollapsed] = useState(false)

  // Scroll handling (smart autoscroll)
  const listRef = useRef(null)
  const stickToBottomRef = useRef(true)

  const servicesForApp = useMemo(() => {
    return SERVICES_BY_APPLICATION[selectedApp] ?? []
  }, [selectedApp])

  // Oldest -> newest
  const sortedPatches = useMemo(() => {
    return patches.slice().sort((a, b) => (a.seq || 0) - (b.seq || 0))
  }, [patches])

  const appSummary = useMemo(() => {
    return APP_SUMMARY_BY_APPLICATION[selectedApp] ?? null
  }, [selectedApp])

  const computedLastPatched = useMemo(() => {
    if (!sortedPatches || sortedPatches.length === 0) return null
    return sortedPatches[sortedPatches.length - 1]?.ts ?? null
  }, [sortedPatches])

  const patchState = useMemo(() => {
    const last = sortedPatches?.[sortedPatches.length - 1]
    const t = (last?.type || '').toUpperCase()

    if (!last) return { label: 'NO DATA', color: '#999' }
    if (t.includes('FAILED')) return { label: 'FAILED', color: '#ff3355' }
    if (t.includes('VERIFIED')) return { label: 'VERIFIED', color: '#00d48a' }
    if (t.includes('APPLIED')) return { label: 'APPLIED', color: '#00d4ff' }
    if (t.includes('PROPOSED')) return { label: 'PROPOSED', color: '#ff9f40' }
    if (t.includes('UPDATE')) return { label: 'UPDATE', color: '#8a7dff' }

    return { label: t || 'UNKNOWN', color: '#999' }
  }, [sortedPatches])

  const serviceServers = useMemo(() => {
    if (!selectedService) return null
    return SERVERS_BY_SERVICE[selectedService] ?? null
  }, [selectedService])

  // Track whether user is near bottom
  const onListScroll = () => {
    const el = listRef.current
    if (!el) return
    const threshold = 90
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distanceFromBottom < threshold
  }

  // Autoscroll when new patches arrive AND user is already near bottom
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

    // expand summary on app switch
    setSummaryCollapsed(false)
  }, [servicesForApp])

  // When service changes, load base patches and jump to bottom
  useEffect(() => {
    if (!selectedService) {
      setPatches([])
      return
    }

    setPatches(PATCHES_BY_SERVICE[selectedService] || [])

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
        minHeight: 0, // ✅ important for scroll containers
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

      {/* TOP AREA (Controls + Summary) */}
      <div
        style={{
          flex: '0 0 auto',
          position: 'relative',
          zIndex: 2,
          background: '#0d0d0d',
        }}
      >
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

        {/* SUMMARY BAR */}
        <AppSummaryBar
          appName={selectedApp}
          summary={appSummary}
          computedLastPatched={computedLastPatched}
          patchState={patchState}
          selectedService={selectedService}
          serviceServers={serviceServers}
          hasService={servicesForApp.length > 0}
          collapsed={summaryCollapsed}
          onToggle={() => setSummaryCollapsed((v) => !v)}
        />
      </div>

      {/* PATCH LIST */}
      <div
        ref={listRef}
        onScroll={onListScroll}
        style={{
          flex: 1,
          minHeight: 0, // ✅ critical
          overflowY: 'auto',
          touchAction: 'pan-y', // ✅ fixes cases where scroll is blocked
          WebkitOverflowScrolling: 'touch',
          padding: '12px 12px 0px',
          paddingBottom: `calc(140px + env(safe-area-inset-bottom))`,
          scrollPaddingBottom: `calc(140px + env(safe-area-inset-bottom))`,
          overscrollBehavior: 'contain',
          position: 'relative',
          zIndex: 0,
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
          <>
            {sortedPatches.map((p) => (
              <PatchRow key={`${p.service}-${p.seq}-${p.ts}`} patch={p} />
            ))}

            {/* ✅ spacer ensures last element is never clipped */}
            <div style={{ height: 120 }} aria-hidden="true" />
          </>
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
