import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, CheckCircle, Info, X, Zap } from 'lucide-react'

const ICONS = {
  critical: AlertTriangle,
  warning:  Zap,
  success:  CheckCircle,
  info:     Info,
}

const COLORS = {
  critical: { fg: 'var(--accent-red)',    bg: 'rgba(255,51,85,0.12)',  border: 'rgba(255,51,85,0.35)'  },
  warning:  { fg: 'var(--accent-orange)', bg: 'rgba(255,122,0,0.12)', border: 'rgba(255,122,0,0.35)'  },
  success:  { fg: 'var(--accent-green)',  bg: 'rgba(0,255,136,0.10)', border: 'rgba(0,255,136,0.30)'  },
  info:     { fg: 'var(--accent-cyan)',   bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)'  },
}

let _addToast = null

/** Call this from anywhere to fire a toast notification. */
export function toast(message, type = 'info', duration = 5000) {
  if (_addToast) _addToast({ message, type, duration })
}

function Toast({ id, message, type, onRemove }) {
  const cfg  = COLORS[type] || COLORS.info
  const Icon = ICONS[type]  || Info

  useEffect(() => {
    // Animate in
    const el = document.getElementById(`toast-${id}`)
    if (el) {
      el.style.transform  = 'translateX(120%)'
      el.style.opacity    = '0'
      requestAnimationFrame(() => {
        el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        el.style.transform  = 'translateX(0)'
        el.style.opacity    = '1'
      })
    }
  }, [id])

  const remove = () => {
    const el = document.getElementById(`toast-${id}`)
    if (el) {
      el.style.transition = 'all 0.2s ease'
      el.style.transform  = 'translateX(120%)'
      el.style.opacity    = '0'
      setTimeout(() => onRemove(id), 200)
    } else {
      onRemove(id)
    }
  }

  return (
    <div
      id={`toast-${id}`}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.fg}`,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 280, maxWidth: 400,
        backdropFilter: 'blur(8px)',
        marginBottom: 8,
      }}
    >
      <Icon size={14} color={cfg.fg} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{
        flex: 1, fontSize: 12, color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)', lineHeight: 1.5,
      }}>
        {message}
      </span>
      <button
        onClick={remove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 0, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
      >
        <X size={12} />
      </button>
    </div>
  )
}

export default function NotificationToast({ anomalyCheck, aiAnalysis }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((t) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { ...t, id }])  // keep max 5
    if (t.duration > 0) {
      setTimeout(() => removeToast(id), t.duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Register global toast function
  useEffect(() => {
    _addToast = addToast
    return () => { _addToast = null }
  }, [addToast])

  // Watch anomaly checks from WebSocket
  const prevAnomalyRef = { current: null }
  useEffect(() => {
    if (!anomalyCheck) return
    if (anomalyCheck.anomaly && anomalyCheck.severity === 'HIGH') {
      addToast({
        message: `⚡ High anomaly detected — ${anomalyCheck.error_count} errors (${anomalyCheck.error_rate_pct}%)`,
        type: 'critical',
        duration: 8000,
      })
    } else if (anomalyCheck.anomaly && anomalyCheck.severity === 'MEDIUM') {
      addToast({
        message: `Anomaly detected — ${anomalyCheck.description}`,
        type: 'warning',
        duration: 6000,
      })
    }
  }, [anomalyCheck?.anomaly, anomalyCheck?.error_count])

  // Watch for new critical AI issues
  useEffect(() => {
    if (!aiAnalysis?.issues) return
    const criticals = aiAnalysis.issues.filter(i => i.severity === 'CRITICAL')
    if (criticals.length > 0) {
      addToast({
        message: `🔴 ${criticals.length} critical issue${criticals.length > 1 ? 's' : ''} detected by AI analysis`,
        type: 'critical',
        duration: 10000,
      })
    }
  }, [aiAnalysis])

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      zIndex: 10000,
      display: 'flex', flexDirection: 'column-reverse',
    }}>
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  )
}
