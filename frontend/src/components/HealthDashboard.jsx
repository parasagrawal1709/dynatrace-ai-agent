import { useState, useEffect } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Server, Activity } from 'lucide-react'
import { api } from '../services/api'

function ScoreRing({ score, size = 80 }) {
  const color = score >= 80 ? 'var(--accent-green)'
              : score >= 50 ? 'var(--accent-orange)'
              :               'var(--accent-red)'
  const data = [{ value: score, fill: color }, { value: 100 - score, fill: '#1d2d4522' }]

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%" outerRadius="100%"
          data={data} startAngle={90} endAngle={-270} barSize={6}
        >
          <RadialBar dataKey="value" cornerRadius={4} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>
          {score.toFixed(0)}
        </div>
      </div>
    </div>
  )
}

function TrendIcon({ trend }) {
  if (trend === 'improving')  return <TrendingUp  size={12} color="var(--accent-green)"  />
  if (trend === 'degrading')  return <TrendingDown size={12} color="var(--accent-red)"   />
  return <Minus size={12} color="var(--text-muted)" />
}

function ServiceCard({ svc }) {
  const statusColor = {
    HEALTHY:  'var(--accent-green)',
    DEGRADED: 'var(--accent-orange)',
    CRITICAL: 'var(--accent-red)',
    UNKNOWN:  'var(--text-muted)',
  }[svc.status] || 'var(--text-muted)'

  const bd = svc.breakdown || {}

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border)`,
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 8,
      padding: '14px 16px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Server size={12} color={statusColor} />
            {svc.service}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <TrendIcon trend={svc.trend} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {svc.trend}
            </span>
          </div>
        </div>
        <ScoreRing score={svc.score} size={56} />
      </div>

      {/* Breakdown bars */}
      {Object.entries(bd).map(([key, val]) => (
        <div key={key} style={{ marginBottom: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {key.replace('_', ' ')}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {val.toFixed(0)}
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--bg-elevated)', borderRadius: 2 }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${val}%`,
              background: val >= 70 ? 'var(--accent-green)' : val >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HealthDashboard({ liveHealth }) {
  const [systemHealth, setSystemHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSystemHealth().then(setSystemHealth).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Prefer live WebSocket data
  const health = liveHealth || systemHealth

  if (loading && !health) {
    return (
      <div style={{ padding: 24, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        Loading health data …
      </div>
    )
  }

  if (!health) return null

  const services = health.services || []

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>
      {/* Top summary bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20,
      }}>
        {[
          { label: 'OVERALL SCORE', value: `${(health.overall_score ?? 0).toFixed(1)}`, color: 'var(--accent-cyan)' },
          { label: 'ACTIVE PROBLEMS', value: health.active_problems ?? 0, color: health.active_problems > 0 ? 'var(--accent-red)' : 'var(--accent-green)' },
          { label: 'SERVICES', value: services.length, color: 'var(--accent-cyan)' },
          { label: 'ERRORS (LAST HOUR)', value: health.total_errors_last_hour ?? 0, color: 'var(--accent-orange)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Service cards */}
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={10} />
        SERVICE HEALTH — {services.length} services
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {services.map(svc => <ServiceCard key={svc.service} svc={svc} />)}
      </div>
    </div>
  )
}
