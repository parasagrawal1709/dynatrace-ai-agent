import { useState } from 'react'
import { ClipboardPaste, Play, Loader, Trash2, Lightbulb } from 'lucide-react'
import { api } from '../services/api'

const SAMPLE_LOGS = `ERROR payment-service: Connection pool exhausted — waited 30000ms
WARN  api-gateway: Response time threshold exceeded: 4823ms (limit: 2000ms)
ERROR payment-service: HTTP 503 from downstream inventory-service after 5000ms
ERROR auth-service: JWT verification failed — invalid signature from IP 10.0.1.42
ERROR payment-service: Retry attempt 3/3 for POST /charge — giving up
WARN  db-proxy: Slow query detected: SELECT * FROM orders WHERE status='pending' took 12430ms
ERROR payment-service: OutOfMemoryError: Java heap space — heap at 98%
INFO  api-gateway: Deployment v2.4.1 completed successfully
WARN  notification-service: Email queue depth: 1842 — approaching limit (2000)
ERROR db-proxy: Connection refused to primary — failover initiated`

function IssueRow({ issue }) {
  const color = issue.severity === 'CRITICAL' || issue.severity === 'HIGH'
    ? 'var(--accent-red)'
    : issue.severity === 'MEDIUM'
    ? 'var(--accent-orange)'
    : 'var(--accent-cyan)'

  return (
    <div style={{
      padding: '8px 12px', marginBottom: 6,
      background: 'var(--bg-card)',
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{issue.severity} — {issue.title}</span>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {Math.round(issue.confidence * 100)}% confidence
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{issue.description}</div>
      {issue.recommendation && (
        <div style={{ fontSize: 11, color: 'var(--accent-green)' }}>
          ✓ {issue.recommendation}
        </div>
      )}
    </div>
  )
}

export default function ManualAnalysis() {
  const [logText, setLogText]     = useState('')
  const [result,  setResult]      = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error,   setError]       = useState(null)

  const runAnalysis = async () => {
    const lines = logText.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await api.runAnalysis({
        log_lines: lines,
        include_metrics: true,
        include_problems: false,
      })
      setResult(data)
    } catch (e) {
      setError(e.message || 'Analysis failed. Is your ANTHROPIC_API_KEY set?')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => setLogText(SAMPLE_LOGS)
  const clearAll   = () => { setLogText(''); setResult(null); setError(null) }

  const lineCount = logText.split('\n').filter(l => l.trim()).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <ClipboardPaste size={13} color="var(--accent-purple)" />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
          PASTE &amp; ANALYSE
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
          {lineCount > 0 ? `${lineCount} lines` : ''}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={loadSample} style={btnStyle('cyan')}>
            <Lightbulb size={10} /> Sample logs
          </button>
          <button onClick={clearAll} style={btnStyle('muted')}>
            <Trash2 size={10} /> Clear
          </button>
          <button
            onClick={runAnalysis}
            disabled={loading || lineCount === 0}
            style={{
              ...btnStyle('purple'),
              opacity: (loading || lineCount === 0) ? 0.5 : 1,
              cursor: (loading || lineCount === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? <><Loader size={10} className="pulse" /> Analysing …</>
              : <><Play  size={10} /> Run AI Analysis</>
            }
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Input pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '6px 12px', background: 'var(--bg-elevated)', letterSpacing: '0.08em' }}>
            INPUT — paste raw log lines (one per line)
          </div>
          <textarea
            value={logText}
            onChange={e => setLogText(e.target.value)}
            placeholder={"Paste log lines here…\n\nExample:\n  ERROR payment-service: Connection pool exhausted\n  WARN api-gateway: High response time 4823ms"}
            style={{
              flex: 1, padding: '12px 14px', resize: 'none',
              background: 'var(--bg-base)',
              border: 'none', outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7,
            }}
            spellCheck={false}
          />
        </div>

        {/* Results pane */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'var(--bg-card)' }}>
          {!result && !error && !loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8 }}>
              Paste logs on the left and click<br />"Run AI Analysis"<br /><br />
              Claude will detect issues, predict problems,<br />and give you actionable recommendations.
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <Loader size={24} className="pulse" style={{ margin: '0 auto 12px', display: 'block' }} />
              Claude is analysing your logs…
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px 14px', borderRadius: 8,
              background: 'rgba(255,51,85,0.08)', border: '1px solid rgba(255,51,85,0.3)',
              color: 'var(--accent-red)', fontSize: 12, fontFamily: 'var(--font-mono)',
            }}>
              ⚠ {error}
            </div>
          )}

          {result && (
            <div>
              {/* Summary */}
              {result.summary && (
                <div style={{ padding: '10px 12px', marginBottom: 14, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>SUMMARY</div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>{result.summary}</div>
                </div>
              )}

              {/* Issues */}
              {result.issues_detected?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
                    ISSUES FOUND ({result.issues_detected.length})
                  </div>
                  {result.issues_detected.map((issue, i) => <IssueRow key={i} issue={issue} />)}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
                    RECOMMENDATIONS
                  </div>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-primary)', padding: '5px 10px', marginBottom: 4, background: 'rgba(0,255,136,0.04)', borderRadius: 4, borderLeft: '2px solid var(--accent-green)' }}>
                      {r}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Analysed {result.analyzed_log_count} log entries · {result.model_used}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function btnStyle(accent) {
  const colors = {
    cyan:   { bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.25)',   color: 'var(--accent-cyan)'   },
    purple: { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.35)', color: 'var(--accent-purple)' },
    muted:  { bg: 'var(--bg-card)',          border: 'var(--border)',          color: 'var(--text-muted)'    },
  }
  const c = colors[accent] || colors.muted
  return {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 12px', borderRadius: 5, cursor: 'pointer',
    background: c.bg, border: `1px solid ${c.border}`,
    color: c.color, fontFamily: 'var(--font-mono)', fontSize: 11,
  }
}
