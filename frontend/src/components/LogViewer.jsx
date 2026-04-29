import { useState, useRef, useEffect } from 'react'
import { Search, Filter, Download } from 'lucide-react'

const LEVEL_STYLES = {
  ERROR:    { color: 'var(--accent-red)',    bg: 'rgba(255,51,85,0.06)' },
  CRITICAL: { color: 'var(--accent-red)',    bg: 'rgba(255,51,85,0.10)' },
  WARN:     { color: 'var(--accent-orange)', bg: 'rgba(255,122,0,0.06)' },
  INFO:     { color: 'var(--accent-cyan)',   bg: 'transparent' },
  DEBUG:    { color: 'var(--text-muted)',    bg: 'transparent' },
}

function LogRow({ log }) {
  const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.INFO
  const ts = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '75px 60px 150px 1fr',
      gap: 8,
      padding: '3px 12px',
      fontSize: 12,
      fontFamily: 'var(--font-mono)',
      lineHeight: 1.5,
      background: style.bg,
      borderBottom: '1px solid rgba(29,45,69,0.3)',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{ts}</span>
      <span style={{ color: style.color, fontWeight: 600 }}>{log.level}</span>
      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {log.service}
      </span>
      <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{log.message}</span>
    </div>
  )
}

export default function LogViewer({ logs }) {
  const [filter, setFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [autoScroll, setAutoScroll] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const filtered = logs.filter(l => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false
    if (filter && !l.message.toLowerCase().includes(filter.toLowerCase()) &&
        !l.service.toLowerCase().includes(filter.toLowerCase())) return false
    return true
  })

  const exportLogs = () => {
    const text = filtered.map(l =>
      `${l.timestamp} [${l.level}] ${l.service}: ${l.message}`
    ).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `logs-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter logs …"
            style={{
              width: '100%', padding: '5px 10px 5px 28px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 4, color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none',
            }}
          />
        </div>

        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          style={{
            padding: '5px 8px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4,
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
            fontSize: 12, outline: 'none', cursor: 'pointer',
          }}
        >
          {['ALL', 'ERROR', 'CRITICAL', 'WARN', 'INFO', 'DEBUG'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          style={{
            padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
            background: autoScroll ? 'rgba(0,212,255,0.12)' : 'var(--bg-card)',
            border: `1px solid ${autoScroll ? 'var(--accent-cyan)' : 'var(--border)'}`,
            color: autoScroll ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 11,
          }}
        >
          {autoScroll ? '⏬ AUTO' : '⏸ PAUSED'}
        </button>

        <button
          onClick={exportLogs}
          style={{
            padding: '5px 8px', borderRadius: 4, cursor: 'pointer',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
          }}
          title="Export logs"
        >
          <Download size={12} />
        </button>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          {filtered.length}/{logs.length}
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '75px 60px 150px 1fr',
        gap: 8, padding: '4px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)', flexShrink: 0,
      }}>
        {['TIME', 'LEVEL', 'SERVICE', 'MESSAGE'].map(h => (
          <span key={h} style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Log rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            No logs match your filter.
          </div>
        ) : (
          filtered.map((log, i) => <LogRow key={log.id ?? i} log={log} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
