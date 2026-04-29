import { Activity, Zap, Wifi, WifiOff, AlertTriangle } from 'lucide-react'

export default function Header({ connected, health, anomaly }) {
  const score = health?.overall_score ?? null
  const status = health?.overall_status ?? 'UNKNOWN'

  const statusColor = {
    HEALTHY:  'var(--accent-green)',
    DEGRADED: 'var(--accent-orange)',
    CRITICAL: 'var(--accent-red)',
    UNKNOWN:  'var(--text-muted)',
  }[status] || 'var(--text-muted)'

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #00d4ff22, #a855f722)',
          border: '1px solid var(--border-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Activity size={18} color="var(--accent-cyan)" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
            DYNATRACE <span style={{ color: 'var(--accent-cyan)' }}>AI</span> AGENT
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            powered by Claude
          </div>
        </div>
      </div>

      {/* Center — health score */}
      {score !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)',
              color: statusColor, textShadow: `0 0 20px ${statusColor}66`,
            }}>
              {score.toFixed(0)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              HEALTH SCORE
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
          <div>
            <span className={`badge badge-${status.toLowerCase()}`}>
              <Zap size={10} />
              {status}
            </span>
            {health?.active_problems > 0 && (
              <div style={{ fontSize: 11, color: 'var(--accent-orange)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {health.active_problems} active problem{health.active_problems !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right — connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {anomaly?.anomaly && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(255,51,85,0.12)', border: '1px solid rgba(255,51,85,0.3)',
            color: 'var(--accent-red)', fontSize: 12,
          }}>
            <AlertTriangle size={12} className="pulse" />
            Anomaly Detected
          </div>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 6,
          background: connected ? 'rgba(0,255,136,0.08)' : 'rgba(255,51,85,0.08)',
          border: `1px solid ${connected ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,85,0.2)'}`,
          color: connected ? 'var(--accent-green)' : 'var(--accent-red)',
          fontSize: 12, fontFamily: 'var(--font-mono)',
        }}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>
    </header>
  )
}
