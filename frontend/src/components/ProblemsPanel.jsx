import { useState, useEffect } from 'react'
import { AlertOctagon, GitCommit, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import { api } from '../services/api'

const SEVERITY_COLOR = {
  ERROR:          'var(--accent-red)',
  PERFORMANCE:    'var(--accent-orange)',
  AVAILABILITY:   'var(--accent-red)',
  RESOURCE_CONTENTION: 'var(--accent-yellow)',
  CUSTOM_ALERT:   'var(--accent-cyan)',
}

function timeAgo(ts) {
  const ms = Date.now() - (typeof ts === 'number' ? ts : new Date(ts).getTime())
  const m = Math.floor(ms / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function ProblemCard({ problem }) {
  const color = SEVERITY_COLOR[problem.severityLevel] || 'var(--accent-cyan)'
  const entities = problem.affectedEntities || []

  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`, borderRadius: 8,
      padding: '12px 14px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertOctagon size={12} color={color} />
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
              padding: '1px 6px', borderRadius: 3,
              background: `${color}22`, color,
            }}>
              {problem.severityLevel}
            </span>
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-mono)',
              padding: '1px 6px', borderRadius: 3,
              background: problem.status === 'OPEN' ? 'rgba(255,51,85,0.12)' : 'rgba(0,255,136,0.08)',
              color: problem.status === 'OPEN' ? 'var(--accent-red)' : 'var(--accent-green)',
            }}>
              {problem.status}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {problem.title}
          </div>
          {entities.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {entities.map((e, i) => (
                <span key={i} style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)',
                  padding: '2px 6px', borderRadius: 3,
                  background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                  {e.name || e.entityId?.id}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={9} />
            {timeAgo(problem.startTime)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {problem.problemId}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event }) {
  const isDeployment = event.eventType === 'DEPLOYMENT'
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${isDeployment ? 'var(--accent-green)' : 'var(--accent-cyan)'}`,
      borderRadius: 8, padding: '10px 14px', marginBottom: 6,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <GitCommit size={12} color={isDeployment ? 'var(--accent-green)' : 'var(--accent-cyan)'} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{event.title}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          {event.eventType} · {timeAgo(event.startTime)}
        </div>
      </div>
    </div>
  )
}

export default function ProblemsPanel() {
  const [problems, setProblems] = useState([])
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab, setTab] = useState('problems')

  const fetch = async () => {
    setLoading(true)
    try {
      const [p, e] = await Promise.all([api.getProblems(), api.getEvents()])
      setProblems(p.problems || [])
      setEvents(e.events || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: '8px 16px', background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        {['problems', 'events'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
            background: tab === t ? 'rgba(0,212,255,0.1)' : 'transparent',
            border: tab === t ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
            color: tab === t ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {t} {t === 'problems' && problems.length > 0 && `(${problems.length})`}
          </button>
        ))}
        <button onClick={fetch} style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)',
        }}>
          <RefreshCw size={10} className={loading ? 'pulse' : ''} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 32 }}>
            Loading …
          </div>
        ) : tab === 'problems' ? (
          problems.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 40,
              color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: 13,
            }}>
              ✓ No active problems detected
            </div>
          ) : (
            problems.map((p, i) => <ProblemCard key={p.problemId || i} problem={p} />)
          )
        ) : (
          events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              No recent events
            </div>
          ) : (
            events.map((e, i) => <EventCard key={e.eventId || i} event={e} />)
          )
        )}
      </div>
    </div>
  )
}
