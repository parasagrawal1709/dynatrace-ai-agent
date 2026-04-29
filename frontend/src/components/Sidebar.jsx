import { Server, AlertTriangle, Clock, Activity, Cpu, HardDrive } from 'lucide-react'

function StatRow({ icon: Icon, label, value, color = 'var(--text-secondary)', pulse = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 8px',
      borderBottom: '1px solid var(--border)',
    }}>
      <Icon size={14} color={color} className={pulse ? 'pulse' : ''} />
      <div style={{
        fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)',
        color, marginTop: 6, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em',
        textAlign: 'center', marginTop: 3, lineHeight: 1.2,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  )
}

export default function Sidebar({ health, anomalyCheck, logStats }) {
  const services = health?.services || []

  const healthy  = services.filter(s => s.status === 'HEALTHY').length
  const degraded = services.filter(s => s.status === 'DEGRADED').length
  const critical = services.filter(s => s.status === 'CRITICAL').length

  const totalErrors  = health?.total_errors_last_hour ?? '—'
  const activeProbs  = health?.active_problems ?? 0

  // Average CPU across services (if available in future metrics)
  const errorRatePct = anomalyCheck?.error_rate_pct != null
    ? `${anomalyCheck.error_rate_pct.toFixed(1)}%`
    : '—'

  return (
    <div style={{
      width: 68, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Health score ring */}
      <div style={{
        padding: '14px 8px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase' }}>
          Score
        </div>
        <div style={{
          fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)',
          color: health?.overall_score >= 80 ? 'var(--accent-green)'
               : health?.overall_score >= 50 ? 'var(--accent-orange)'
               : health?.overall_score != null ? 'var(--accent-red)'
               : 'var(--text-muted)',
        }}>
          {health?.overall_score != null ? Math.round(health.overall_score) : '—'}
        </div>
      </div>

      <StatRow
        icon={Server}
        label="Healthy"
        value={healthy}
        color="var(--accent-green)"
      />
      <StatRow
        icon={Activity}
        label="Degraded"
        value={degraded}
        color={degraded > 0 ? 'var(--accent-orange)' : 'var(--text-muted)'}
      />
      <StatRow
        icon={AlertTriangle}
        label="Critical"
        value={critical}
        color={critical > 0 ? 'var(--accent-red)' : 'var(--text-muted)'}
        pulse={critical > 0}
      />
      <StatRow
        icon={Clock}
        label="Problems"
        value={activeProbs}
        color={activeProbs > 0 ? 'var(--accent-red)' : 'var(--text-muted)'}
        pulse={activeProbs > 0}
      />
      <StatRow
        icon={HardDrive}
        label="Errors/h"
        value={totalErrors}
        color={
          typeof totalErrors === 'number' && totalErrors > 20
            ? 'var(--accent-red)'
            : 'var(--text-secondary)'
        }
      />
      <StatRow
        icon={Cpu}
        label="Err Rate"
        value={errorRatePct}
        color={
          anomalyCheck?.anomaly
            ? 'var(--accent-orange)'
            : 'var(--text-secondary)'
        }
      />

      {/* Anomaly pulse indicator */}
      {anomalyCheck?.anomaly && (
        <div style={{
          margin: '10px auto',
          width: 10, height: 10, borderRadius: '50%',
          background: 'var(--accent-orange)',
          boxShadow: '0 0 10px var(--accent-orange)',
        }} className="pulse" />
      )}
    </div>
  )
}
