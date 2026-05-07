// import { useState, useRef, useEffect } from 'react'
// import { Send, Bot, User, Loader, Terminal } from 'lucide-react'
// import { api } from '../services/api'
//
// const SUGGESTED_QUESTIONS = [
//   "What is causing the high error rate in payment-service?",
//   "Are there any memory issues I should be concerned about?",
//   "What's the predicted risk of an outage in the next hour?",
//   "Give me a full health report of all services.",
//   "What Dynatrace problems are currently open?",
//   "Why is response time degraded on api-gateway?",
// ]
//
// function Message({ msg }) {
//   const isUser = msg.role === 'user'
//   return (
//     <div style={{
//       display: 'flex', gap: 10,
//       flexDirection: isUser ? 'row-reverse' : 'row',
//       marginBottom: 14, padding: '0 4px',
//     }}>
//       <div style={{
//         width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         background: isUser
//           ? 'rgba(0,212,255,0.15)'
//           : 'rgba(168,85,247,0.15)',
//         border: `1px solid ${isUser ? 'rgba(0,212,255,0.3)' : 'rgba(168,85,247,0.3)'}`,
//         marginTop: 2,
//       }}>
//         {isUser
//           ? <User size={13} color="var(--accent-cyan)" />
//           : <Bot  size={13} color="var(--accent-purple)" />
//         }
//       </div>
//       <div style={{
//         maxWidth: '80%',
//         padding: '10px 14px', borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
//         background: isUser ? 'rgba(0,212,255,0.06)' : 'var(--bg-elevated)',
//         border: `1px solid ${isUser ? 'rgba(0,212,255,0.15)' : 'var(--border)'}`,
//         fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)',
//         whiteSpace: 'pre-wrap', wordBreak: 'break-word',
//       }}>
//         {msg.content}
//         {msg.streaming && (
//           <span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--accent-purple)', marginLeft: 3, borderRadius: 1, animation: 'pulse 1s infinite' }} />
//         )}
//       </div>
//     </div>
//   )
// }
//
// export default function AgentChat() {
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: '👋 I\'m your SRE AI Agent. I have live access to your Infrastructure logs, metrics, and active problems.\n\nAsk me anything about your system health, recent errors, or predicted issues.',
//     },
//   ])
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(false)
//   const bottomRef = useRef(null)
//   const inputRef = useRef(null)
//
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])
//
//   const sendMessage = async (text) => {
//     const msg = text || input.trim()
//     if (!msg || loading) return
//
//     setInput('')
//     setLoading(true)
//
//     const userMsg = { role: 'user', content: msg }
//     setMessages(prev => [...prev, userMsg])
//
//     // Build history (exclude the streaming placeholder)
//     const history = messages
//       .filter(m => !m.streaming)
//       .map(m => ({ role: m.role, content: m.content }))
//
//     // Add streaming placeholder
//     const streamId = Date.now()
//     setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, id: streamId }])
//
//     try {
//       let fullText = ''
//       for await (const chunk of api.chatStream(msg, history)) {
//         fullText += chunk
//         setMessages(prev => prev.map(m =>
//           m.id === streamId ? { ...m, content: fullText } : m
//         ))
//       }
//       // Finalise
//       setMessages(prev => prev.map(m =>
//         m.id === streamId ? { role: 'assistant', content: fullText } : m
//       ))
//     } catch (e) {
//       setMessages(prev => prev.map(m =>
//         m.id === streamId
//           ? { role: 'assistant', content: `⚠️ Error: ${e.message || 'Failed to get response.'}` }
//           : m
//       ))
//     } finally {
//       setLoading(false)
//       inputRef.current?.focus()
//     }
//   }
//
//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }
//
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//       {/* Header */}
//       <div style={{
//         padding: '10px 16px', background: 'var(--bg-elevated)',
//         borderBottom: '1px solid var(--border)',
//         display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
//       }}>
//         <Terminal size={13} color="var(--accent-purple)" />
//         <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
//           SRE AI AGENT — CLAUDE
//         </span>
//         <div style={{
//           marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
//           background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)',
//         }} className="pulse" />
//       </div>
//
//       {/* Messages */}
//       <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
//         {messages.map((msg, i) => <Message key={i} msg={msg} />)}
//         <div ref={bottomRef} />
//       </div>
//
//       {/* Suggested questions */}
//       {messages.length < 3 && (
//         <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
//           {SUGGESTED_QUESTIONS.map((q, i) => (
//             <button
//               key={i}
//               onClick={() => sendMessage(q)}
//               style={{
//                 padding: '4px 10px', borderRadius: 20, cursor: 'pointer', fontSize: 11,
//                 background: 'var(--bg-card)', border: '1px solid var(--border)',
//                 color: 'var(--text-secondary)', transition: 'all 0.15s',
//               }}
//             >
//               {q}
//             </button>
//           ))}
//         </div>
//       )}
//
//       {/* Input */}
//       <div style={{
//         padding: '10px 12px', background: 'var(--bg-elevated)',
//         borderTop: '1px solid var(--border)', flexShrink: 0,
//         display: 'flex', gap: 8, alignItems: 'flex-end',
//       }}>
//         <textarea
//           ref={inputRef}
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Ask about logs, metrics, or issues … (Enter to send)"
//           rows={1}
//           style={{
//             flex: 1, padding: '8px 12px', resize: 'none', maxHeight: 120,
//             background: 'var(--bg-card)', border: '1px solid var(--border)',
//             borderRadius: 6, color: 'var(--text-primary)',
//             fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none',
//             lineHeight: 1.5,
//           }}
//         />
//         <button
//           onClick={() => sendMessage()}
//           disabled={loading || !input.trim()}
//           style={{
//             width: 36, height: 36, borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
//             background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             opacity: loading || !input.trim() ? 0.5 : 1, transition: 'all 0.15s',
//           }}
//         >
//           {loading
//             ? <Loader size={14} color="var(--accent-purple)" className="pulse" />
//             : <Send  size={14} color="var(--accent-purple)" />
//           }
//         </button>
//       </div>
//     </div>
//   )
// }

//
// import { useState, useRef, useEffect } from 'react'
// import { Send, Bot, User, Loader, Terminal } from 'lucide-react'
//
// const SUGGESTED_QUESTIONS = [
//   "What is causing the high error rate in payment-service?",
//   "Are there any memory issues I should be concerned about?",
//   "What's the predicted risk of an outage in the next hour?",
//   "Give me a full health report of all services.",
//   "What Dynatrace problems are currently open?",
//   "Why is response time degraded on api-gateway?",
// ]
//
// const QA_MAP = {
//   "What is causing the high error rate in payment-service?":
//     "The payment-service is facing repeated OutOfMemoryError events, database query timeouts, and HTTP 503 dependency failures from inventory-service.\n\nThese issues are increasing retries and causing cascading request failures.",
//
//   "Are there any memory issues I should be concerned about?":
//     "Yes. Multiple services including payment-service, inventory-service, notification-service, and api-gateway are reaching 98% JVM heap usage.\n\nThis indicates severe memory pressure and possible memory leaks.",
//
//   "What's the predicted risk of an outage in the next hour?":
//     "The outage risk is HIGH.\n\nMultiple critical services are experiencing memory exhaustion, connection pool failures, and cascading dependency issues which may trigger partial downtime.",
//
//   "Give me a full health report of all services.":
//     "payment-service → DEGRADED due to OOM and DB timeouts.\n\ninventory-service → CRITICAL due to dependency failures and heap exhaustion.\n\nnotification-service → DEGRADED with CPU spikes and SSL expiry warnings.\n\napi-gateway → DEGRADED due to slow downstream dependencies.\n\ndb-proxy → UNDER STRESS due to high query latency and connection saturation.",
//
//   "What Dynatrace problems are currently open?":
//     "Open problems detected:\n\n• JVM Heap Exhaustion\n• Database Query Timeouts\n• Connection Pool Exhaustion\n• HTTP 503 Dependency Failures\n• SSL Certificate Expiry Warnings\n• Authentication Failures from invalid JWT signatures",
//
//   "Why is response time degraded on api-gateway?":
//     "api-gateway latency is increasing because downstream services are failing or responding slowly.\n\ninventory-service dependency failures, high CPU usage, and connection pool exhaustion are causing request delays.",
//
//   "Which service is the likely root cause of cascading failures?":
//     "inventory-service appears to be the primary root cause.\n\nIt is generating repeated OOM errors, HTTP 503 responses, and database failures affecting dependent services.",
//
//   "Which services are closest to failure?":
//     "payment-service, notification-service, and inventory-service are closest to failure.\n\nAll three are experiencing severe JVM heap exhaustion and unstable dependencies.",
//
//   "Are database connections being exhausted?":
//     "Yes. Multiple services report connection pool exhaustion after waiting 30 seconds.\n\nThis suggests database saturation or potential connection leaks.",
//
//   "Is there evidence of a memory leak?":
//     "Yes. Continuous heap usage near 98% across multiple JVM services strongly suggests memory retention issues.\n\nHeap dump analysis is recommended immediately.",
//
//   "Are retries worsening system performance?":
//     "Yes. Retry attempt 3/3 messages indicate retry storms are increasing CPU load and database pressure.\n\nThis is amplifying service instability.",
//
//   "Which service should be restarted first?":
//     "payment-service and inventory-service should be prioritized first.\n\nThey are experiencing repeated critical OutOfMemoryError failures.",
//
//   "Are the SSL certificate warnings critical?":
//     "Yes. Several services report SSL certificates expiring in 3 days.\n\nFailure to renew them could break secure service communication.",
//
//   "Is there suspicious authentication activity?":
//     "Yes. Repeated invalid JWT signature errors from the same IP indicate suspicious authentication behavior.\n\nThis may be caused by token tampering or invalid clients.",
//
//   "Why are HTTP 503 errors increasing?":
//     "HTTP 503 errors are increasing because downstream services are overloaded or unavailable.\n\nMemory exhaustion and slow database queries are major contributors.",
//
//   "Is the db-proxy becoming a bottleneck?":
//     "Yes. db-proxy is showing high CPU utilization and repeated database timeout errors.\n\nThis is slowing dependent services across the platform.",
//
//   "Which service has the worst stability trend?":
//     "notification-service currently shows the worst stability trend.\n\nIt has memory issues, SSL warnings, CPU spikes, timeouts, and retry failures simultaneously.",
//
//   "Did deployment v2.4.1 introduce instability?":
//     "Possibly. Multiple critical failures started appearing shortly after deployment v2.4.1 events.\n\nA rollback analysis is recommended.",
//
//   "What is degrading the overall health score?":
//     "The health score is being reduced mainly by OutOfMemoryError events, dependency failures, and database connection exhaustion.\n\nThese issues affect multiple core services simultaneously.",
//
//   "Which issue should be fixed first?":
//     "Memory exhaustion should be addressed first.\n\nResolving heap pressure may automatically reduce retries, latency, and dependency failures.",
//
//   "Are cache misses contributing to performance degradation?":
//     "Partially. Frequent cache misses are increasing database calls during peak load.\n\nThis adds more pressure to already overloaded systems.",
//
//   "Is the platform experiencing cascading failures?":
//     "Yes. Failures originating from inventory-service and db-proxy are propagating across multiple downstream services.\n\nThis is a classic cascading failure scenario.",
//
//   "What is the biggest operational risk right now?":
//     "The biggest operational risk is simultaneous JVM heap exhaustion across critical services.\n\nThis could trigger large-scale service outages.",
//
//   "Which alerts should be prioritized immediately?":
//     "OutOfMemoryError, connection pool exhaustion, and HTTP 503 dependency failures should be prioritized first.\n\nThese alerts have the highest production impact.",
//
//   "What immediate remediation steps are recommended?":
//     "Increase JVM heap temporarily, restart unstable services, reduce retry counts, and optimize slow database queries.\n\nSSL certificates should also be renewed urgently."
// }
//
// function Message({ msg }) {
//   const isUser = msg.role === 'user'
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         gap: 10,
//         flexDirection: isUser ? 'row-reverse' : 'row',
//         marginBottom: 14,
//         padding: '0 4px',
//       }}
//     >
//       <div
//         style={{
//           width: 28,
//           height: 28,
//           borderRadius: '50%',
//           flexShrink: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           background: isUser
//             ? 'rgba(0,212,255,0.15)'
//             : 'rgba(168,85,247,0.15)',
//           border: `1px solid ${
//             isUser
//               ? 'rgba(0,212,255,0.3)'
//               : 'rgba(168,85,247,0.3)'
//           }`,
//           marginTop: 2,
//         }}
//       >
//         {isUser ? (
//           <User size={13} color="var(--accent-cyan)" />
//         ) : (
//           <Bot size={13} color="var(--accent-purple)" />
//         )}
//       </div>
//
//       <div
//         style={{
//           maxWidth: '80%',
//           padding: '10px 14px',
//           borderRadius: isUser
//             ? '12px 4px 12px 12px'
//             : '4px 12px 12px 12px',
//           background: isUser
//             ? 'rgba(0,212,255,0.06)'
//             : 'var(--bg-elevated)',
//           border: `1px solid ${
//             isUser
//               ? 'rgba(0,212,255,0.15)'
//               : 'var(--border)'
//           }`,
//           fontSize: 13,
//           lineHeight: 1.7,
//           color: 'var(--text-primary)',
//           whiteSpace: 'pre-wrap',
//           wordBreak: 'break-word',
//         }}
//       >
//         {msg.content}
//
//         {msg.streaming && (
//           <span
//             style={{
//               display: 'inline-block',
//               width: 8,
//               height: 14,
//               background: 'var(--accent-purple)',
//               marginLeft: 3,
//               borderRadius: 1,
//               animation: 'pulse 1s infinite',
//             }}
//           />
//         )}
//       </div>
//     </div>
//   )
// }
//
// export default function AgentChat() {
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content:
//         "👋 I'm your SRE AI Agent. I have live access to your Infrastructure logs, metrics, and active problems.\n\nAsk me anything about your system health, recent errors, or predicted issues.",
//     },
//   ])
//
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(false)
//
//   const bottomRef = useRef(null)
//   const inputRef = useRef(null)
//
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({
//       behavior: 'smooth',
//     })
//   }, [messages])
//
//   const sendMessage = async (text) => {
//     const msg = text || input.trim()
//
//     if (!msg || loading) return
//
//     setInput('')
//     setLoading(true)
//
//     const userMsg = {
//       role: 'user',
//       content: msg,
//     }
//
//     setMessages((prev) => [...prev, userMsg])
//
//     const streamId = Date.now()
//
//     setMessages((prev) => [
//       ...prev,
//       {
//         role: 'assistant',
//         content: '',
//         streaming: true,
//         id: streamId,
//       },
//     ])
//
//     // Fake thinking delay (5-10 sec)
//     const delay = Math.floor(Math.random() * 5000) + 5000
//
//     setTimeout(() => {
//       const answer =
//         QA_MAP[msg] ||
//         "I analyzed the logs and infrastructure telemetry.\n\nNo matching insight was found for this query."
//
//       let currentText = ''
//       let index = 0
//
//       // Typing effect
//       const typing = setInterval(() => {
//         currentText += answer[index]
//         index++
//
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === streamId
//               ? {
//                   ...m,
//                   content: currentText,
//                 }
//               : m
//           )
//         )
//
//         if (index >= answer.length) {
//           clearInterval(typing)
//
//           setMessages((prev) =>
//             prev.map((m) =>
//               m.id === streamId
//                 ? {
//                     role: 'assistant',
//                     content: answer,
//                   }
//                 : m
//             )
//           )
//
//           setLoading(false)
//           inputRef.current?.focus()
//         }
//       }, 15)
//     }, delay)
//   }
//
//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }
//
//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           padding: '10px 16px',
//           background: 'var(--bg-elevated)',
//           borderBottom: '1px solid var(--border)',
//           display: 'flex',
//           alignItems: 'center',
//           gap: 8,
//           flexShrink: 0,
//         }}
//       >
//         <Terminal size={13} color="var(--accent-purple)" />
//
//         <span
//           style={{
//             fontSize: 11,
//             fontFamily: 'var(--font-mono)',
//             color: 'var(--text-muted)',
//             letterSpacing: '0.1em',
//           }}
//         >
//           SRE AI AGENT — CLAUDE
//         </span>
//
//         <div
//           style={{
//             marginLeft: 'auto',
//             width: 6,
//             height: 6,
//             borderRadius: '50%',
//             background: 'var(--accent-green)',
//             boxShadow: '0 0 6px var(--accent-green)',
//           }}
//           className="pulse"
//         />
//       </div>
//
//       {/* Messages */}
//       <div
//         style={{
//           flex: 1,
//           overflowY: 'auto',
//           padding: '16px 8px',
//         }}
//       >
//         {messages.map((msg, i) => (
//           <Message key={i} msg={msg} />
//         ))}
//
//         <div ref={bottomRef} />
//       </div>
//
//       {/* Suggested Questions */}
//       {messages.length < 3 && (
//         <div
//           style={{
//             padding: '0 12px 10px',
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: 6,
//           }}
//         >
//           {SUGGESTED_QUESTIONS.map((q, i) => (
//             <button
//               key={i}
//               onClick={() => sendMessage(q)}
//               style={{
//                 padding: '4px 10px',
//                 borderRadius: 20,
//                 cursor: 'pointer',
//                 fontSize: 11,
//                 background: 'var(--bg-card)',
//                 border: '1px solid var(--border)',
//                 color: 'var(--text-secondary)',
//                 transition: 'all 0.15s',
//               }}
//             >
//               {q}
//             </button>
//           ))}
//         </div>
//       )}
//
//       {/* Input */}
//       <div
//         style={{
//           padding: '10px 12px',
//           background: 'var(--bg-elevated)',
//           borderTop: '1px solid var(--border)',
//           flexShrink: 0,
//           display: 'flex',
//           gap: 8,
//           alignItems: 'flex-end',
//         }}
//       >
//         <textarea
//           ref={inputRef}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Ask about logs, metrics, or issues … (Enter to send)"
//           rows={1}
//           style={{
//             flex: 1,
//             padding: '8px 12px',
//             resize: 'none',
//             maxHeight: 120,
//             background: 'var(--bg-card)',
//             border: '1px solid var(--border)',
//             borderRadius: 6,
//             color: 'var(--text-primary)',
//             fontFamily: 'var(--font-mono)',
//             fontSize: 12,
//             outline: 'none',
//             lineHeight: 1.5,
//           }}
//         />
//
//         <button
//           onClick={() => sendMessage()}
//           disabled={loading || !input.trim()}
//           style={{
//             width: 36,
//             height: 36,
//             borderRadius: 6,
//             cursor: loading ? 'not-allowed' : 'pointer',
//             background: 'rgba(168,85,247,0.2)',
//             border: '1px solid rgba(168,85,247,0.4)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             opacity: loading || !input.trim() ? 0.5 : 1,
//             transition: 'all 0.15s',
//           }}
//         >
//           {loading ? (
//             <Loader
//               size={14}
//               color="var(--accent-purple)"
//               className="pulse"
//             />
//           ) : (
//             <Send size={14} color="var(--accent-purple)" />
//           )}
//         </button>
//       </div>
//     </div>
//   )
// }



import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  Loader,
  Terminal,
} from 'lucide-react'

/* -------------------------------- */
/* SUGGESTED QUESTIONS */
/* -------------------------------- */

const SUGGESTED_QUESTIONS = [
  'What is causing the high error rate in payment-service?',
  'Are there any memory issues I should be concerned about?',
  "What's the predicted risk of an outage in the next hour?",
  'Give me a full health report of all services.',
  'What Dynatrace problems are currently open?',
  'Why is response time degraded on api-gateway?',
]

/* -------------------------------- */
/* QA MAP */
/* -------------------------------- */

const QA_MAP = {
  'What is causing the high error rate in payment-service?':
    'The payment-service is facing repeated OutOfMemoryError events, database query timeouts, and HTTP 503 dependency failures from inventory-service.\n\nThese issues are increasing retries and causing cascading request failures.',

  'Are there any memory issues I should be concerned about?':
    'Yes. Multiple services including payment-service, inventory-service, notification-service, and api-gateway are reaching 98% JVM heap usage.\n\nThis indicates severe memory pressure and possible memory leaks.',

  "What's the predicted risk of an outage in the next hour?":
    'The outage risk is HIGH.\n\nMultiple critical services are experiencing memory exhaustion, connection pool failures, and cascading dependency issues which may trigger partial downtime.',

  'Give me a full health report of all services.':
    'payment-service → DEGRADED due to OOM and DB timeouts.\n\ninventory-service → CRITICAL due to dependency failures and heap exhaustion.\n\nnotification-service → DEGRADED with CPU spikes and SSL expiry warnings.\n\napi-gateway → DEGRADED due to slow downstream dependencies.\n\ndb-proxy → UNDER STRESS due to high query latency and connection saturation.',

  'What Dynatrace problems are currently open?':
    'Open problems detected:\n\n• JVM Heap Exhaustion\n• Database Query Timeouts\n• Connection Pool Exhaustion\n• HTTP 503 Dependency Failures\n• SSL Certificate Expiry Warnings\n• Authentication Failures from invalid JWT signatures',

  'Why is response time degraded on api-gateway?':
    'api-gateway latency is increasing because downstream services are failing or responding slowly.\n\ninventory-service dependency failures, high CPU usage, and connection pool exhaustion are causing request delays.',

  'Which service is the likely root cause of cascading failures?':
    'inventory-service appears to be the primary root cause.\n\nIt is generating repeated OOM errors, HTTP 503 responses, and database failures affecting dependent services.',

  'Which services are closest to failure?':
    'payment-service, notification-service, and inventory-service are closest to failure.\n\nAll three are experiencing severe JVM heap exhaustion and unstable dependencies.',

  'Are database connections being exhausted?':
    'Yes. Multiple services report connection pool exhaustion after waiting 30 seconds.\n\nThis suggests database saturation or potential connection leaks.',

  'Is there evidence of a memory leak?':
    'Yes. Continuous heap usage near 98% across multiple JVM services strongly suggests memory retention issues.\n\nHeap dump analysis is recommended immediately.',

  'Are retries worsening system performance?':
    'Yes. Retry attempt 3/3 messages indicate retry storms are increasing CPU load and database pressure.\n\nThis is amplifying service instability.',

  'Which service should be restarted first?':
    'payment-service and inventory-service should be prioritized first.\n\nThey are experiencing repeated critical OutOfMemoryError failures.',

  'Are the SSL certificate warnings critical?':
    'Yes. Several services report SSL certificates expiring in 3 days.\n\nFailure to renew them could break secure service communication.',

  'Is there suspicious authentication activity?':
    'Yes. Repeated invalid JWT signature errors from the same IP indicate suspicious authentication behavior.\n\nThis may be caused by token tampering or invalid clients.',

  'Why are HTTP 503 errors increasing?':
    'HTTP 503 errors are increasing because downstream services are overloaded or unavailable.\n\nMemory exhaustion and slow database queries are major contributors.',

  'Is the db-proxy becoming a bottleneck?':
    'Yes. db-proxy is showing high CPU utilization and repeated database timeout errors.\n\nThis is slowing dependent services across the platform.',

  'Which service has the worst stability trend?':
    'notification-service currently shows the worst stability trend.\n\nIt has memory issues, SSL warnings, CPU spikes, timeouts, and retry failures simultaneously.',

  'Did deployment v2.4.1 introduce instability?':
    'Possibly. Multiple critical failures started appearing shortly after deployment v2.4.1 events.\n\nA rollback analysis is recommended.',

  'What is degrading the overall health score?':
    'The health score is being reduced mainly by OutOfMemoryError events, dependency failures, and database connection exhaustion.\n\nThese issues affect multiple core services simultaneously.',

  'Which issue should be fixed first?':
    'Memory exhaustion should be addressed first.\n\nResolving heap pressure may automatically reduce retries, latency, and dependency failures.',

  'Are cache misses contributing to performance degradation?':
    'Partially. Frequent cache misses are increasing database calls during peak load.\n\nThis adds more pressure to already overloaded systems.',

  'Is the platform experiencing cascading failures?':
    'Yes. Failures originating from inventory-service and db-proxy are propagating across multiple downstream services.\n\nThis is a classic cascading failure scenario.',

  'What is the biggest operational risk right now?':
    'The biggest operational risk is simultaneous JVM heap exhaustion across critical services.\n\nThis could trigger large-scale service outages.',

  'Which alerts should be prioritized immediately?':
    'OutOfMemoryError, connection pool exhaustion, and HTTP 503 dependency failures should be prioritized first.\n\nThese alerts have the highest production impact.',

  'What immediate remediation steps are recommended?':
    'Increase JVM heap temporarily, restart unstable services, reduce retry counts, and optimize slow database queries.\n\nSSL certificates should also be renewed urgently.',
}

/* -------------------------------- */
/* FUZZY MATCH HELPERS */
/* -------------------------------- */

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .trim()
}

function similarity(a, b) {
  const aWords = normalizeText(a).split(' ')
  const bWords = normalizeText(b).split(' ')

  const matches = aWords.filter((word) =>
    bWords.includes(word)
  ).length

  return matches / Math.max(aWords.length, bWords.length)
}

function findBestMatch(input, qaMap) {
  let bestMatch = null
  let bestScore = 0

  for (const question of Object.keys(qaMap)) {
    const score = similarity(input, question)

    if (score > bestScore) {
      bestScore = score
      bestMatch = question
    }
  }

  if (bestScore >= 0.25) {
    return qaMap[bestMatch]
  }

  return null
}

/* -------------------------------- */
/* MESSAGE COMPONENT */
/* -------------------------------- */

function Message({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        flexDirection: isUser ? 'row-reverse' : 'row',
        marginBottom: 14,
        padding: '0 4px',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isUser
            ? 'rgba(0,212,255,0.15)'
            : 'rgba(168,85,247,0.15)',
          border: `1px solid ${
            isUser
              ? 'rgba(0,212,255,0.3)'
              : 'rgba(168,85,247,0.3)'
          }`,
          marginTop: 2,
        }}
      >
        {isUser ? (
          <User size={13} color="var(--accent-cyan)" />
        ) : (
          <Bot size={13} color="var(--accent-purple)" />
        )}
      </div>

      <div
        style={{
          maxWidth: '80%',
          padding: '10px 14px',
          borderRadius: isUser
            ? '12px 4px 12px 12px'
            : '4px 12px 12px 12px',
          background: isUser
            ? 'rgba(0,212,255,0.06)'
            : 'var(--bg-elevated)',
          border: `1px solid ${
            isUser
              ? 'rgba(0,212,255,0.15)'
              : 'var(--border)'
          }`,
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {msg.content}

        {msg.streaming && (
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 14,
              background: 'var(--accent-purple)',
              marginLeft: 3,
              borderRadius: 1,
              animation: 'pulse 1s infinite',
            }}
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------- */
/* MAIN COMPONENT */
/* -------------------------------- */

export default function AgentChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 I'm your SRE AI Agent. I have live access to your Infrastructure logs, metrics, and active problems.\n\nAsk me anything about your system health, recent errors, or predicted issues.",
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()

    if (!msg || loading) return

    setInput('')
    setLoading(true)

    const userMsg = {
      role: 'user',
      content: msg,
    }

    setMessages((prev) => [...prev, userMsg])

    const streamId = Date.now()

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        streaming: true,
        id: streamId,
      },
    ])

    const delay =
      Math.floor(Math.random() * 3000) + 1500

    setTimeout(() => {
      const fuzzyAnswer = findBestMatch(
        msg,
        QA_MAP
      )

      const answer =
        fuzzyAnswer ||
        'I analyzed the logs and infrastructure telemetry.\n\nNo matching insight was found for this query.'

      let currentText = ''
      let index = 0

      const typing = setInterval(() => {
        currentText += answer[index]
        index++

        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamId
              ? {
                  ...m,
                  content: currentText,
                }
              : m
          )
        )

        if (index >= answer.length) {
          clearInterval(typing)

          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamId
                ? {
                    role: 'assistant',
                    content: answer,
                  }
                : m
            )
          )

          setLoading(false)
          inputRef.current?.focus()
        }
      }, 12)
    }, delay)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          padding: '10px 16px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <Terminal
          size={13}
          color="var(--accent-purple)"
        />

        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
          }}
        >
          SRE AI AGENT — CLAUDE
        </span>

        <div
          style={{
            marginLeft: 'auto',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-green)',
            boxShadow:
              '0 0 6px var(--accent-green)',
          }}
          className="pulse"
        />
      </div>

      {/* MESSAGES */}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 8px',
        }}
      >
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* SUGGESTED QUESTIONS */}

      {messages.length < 3 && (
        <div
          style={{
            padding: '0 12px 10px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 11,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}

      <div
        style={{
          padding: '10px 12px',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask about logs, metrics, or issues … (Enter to send)"
          rows={1}
          style={{
            flex: 1,
            padding: '8px 12px',
            resize: 'none',
            maxHeight: 120,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            outline: 'none',
            lineHeight: 1.5,
          }}
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            cursor: loading
              ? 'not-allowed'
              : 'pointer',
            background: 'rgba(168,85,247,0.2)',
            border:
              '1px solid rgba(168,85,247,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity:
              loading || !input.trim()
                ? 0.5
                : 1,
            transition: 'all 0.15s',
          }}
        >
          {loading ? (
            <Loader
              size={14}
              color="var(--accent-purple)"
              className="pulse"
            />
          ) : (
            <Send
              size={14}
              color="var(--accent-purple)"
            />
          )}
        </button>
      </div>
    </div>
  )
}