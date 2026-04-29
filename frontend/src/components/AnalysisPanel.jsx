import { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, Zap, Brain, Shield, RefreshCw } from 'lucide-react'
import { api } from '../services/api'

const SEVERITY_CONFIG = {
  CRITICAL: { color: 'var(--accent-red)',    icon: AlertTriangle, bg: 'rgba(255,51,85,0.08)'  },
  HIGH:     { color: 'var(--accent-red)',    icon: AlertTriangle, bg: 'rgba(255,51,85,0.05)'  },
  MEDIUM:   { color: 'var(--accent-orange)', icon: Zap,           bg: 'rgba(255,122,0,0.06)'  },
  LOW:      { color: 'var(--accent-yellow)', icon: Info,          bg: 'rgba(255,215,0,0.05)'  },
  INFO:     { color: 'var(--accent-cyan)',   icon: Info,          bg: 'rgba(0,212,255,0.04)'  },
}

const CATEGORY_ICONS = {
  PERFORMANCE:   '⚡',
  AVAILABILITY:  '🔴',
  ERROR_RATE:    '❌',
  MEMORY:        '🧠',
  CPU:           '🖥️',
  DATABASE:      '🗄️',
  NETWORK:       '🌐',
  SECURITY:      '🔐',
  DEPENDENCY:    '🔗',
  CONFIGURATION: '⚙️',
}

function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.INFO
  const Icon = cfg.icon

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.color}33`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 8, padding: '12px 14px',
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon size={13} color={cfg.color} />
            <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>
              {issue.severity}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {CATEGORY_ICONS[issue.category]} {issue.category}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
            {issue.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {issue.description}
          </div>
        </div>
        <div style={{
          marginLeft: 12, textAlign: 'center', minWidth: 44,
          padding: '4px 8px', borderRadius: 4,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: cfg.color }}>
            {Math.round(issue.confidence * 100)}%
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CONF</div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {issue.evidence?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>
                EVIDENCE
              </div>
              {issue.evidence.map((e, i) => (
                <div key={i} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-secondary)', background: 'var(--bg-base)',
                  padding: '3px 8px', borderRadius: 3, marginBottom: 2,
                  borderLeft: '2px solid var(--border-glow)',
                }}>
                  {e}
                </div>
              ))}
            </div>
          )}
          {issue.recommendation && (
            <div style={{
              padding: '8px 12px', borderRadius: 4,
              background: 'rgba(0,255,136,0.06)',
              border: '1px solid rgba(0,255,136,0.15)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--accent-green)', letterSpacing: '0.1em', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>
                ✓ RECOMMENDATION
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{issue.recommendation}</div>
            </div>
          )}
          {issue.impact && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Impact:</strong> {issue.impact}
            </div>
          )}
          {issue.services?.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {issue.services.map(s => (
                <span key={s} style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)',
                  padding: '2px 6px', borderRadius: 3,
                  background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AnalysisPanel({ analysis }) {
  const [running, setRunning] = useState(false)
  const [localAnalysis, setLocalAnalysis] = useState(null)

  const current = localAnalysis || analysis

  const triggerAnalysis = async () => {
    setRunning(true)
    try {
      const result = await api.runAnalysis({ minutes: 15, include_metrics: true, include_problems: true })
      setLocalAnalysis(result)
    } catch (e) {
      console.error(e)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 16 }}>
      {/* Trigger button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={14} color="var(--accent-purple)" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
            AI ANALYSIS
          </span>
        </div>
        <button
          onClick={triggerAnalysis}
          disabled={running}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer',
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)',
            color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: 12,
            opacity: running ? 0.6 : 1,
          }}
        >
          <RefreshCw size={11} className={running ? 'pulse' : ''} />
          {running ? 'Analysing …' : 'Run Analysis'}
        </button>
      </div>

      {!current ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          No analysis yet. Click "Run Analysis" or wait for the automatic cycle.
        </div>
      ) : (
        <>
          {/* Summary */}
          {current.summary && (
            <div style={{
              padding: '12px 14px', marginBottom: 14,
              background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 10, color: 'var(--accent-purple)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
                EXECUTIVE SUMMARY
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{current.summary}</div>
            </div>
          )}

          {/* Root cause */}
          {current.root_cause && (
            <div style={{
              padding: '10px 14px', marginBottom: 14,
              background: 'rgba(255,122,0,0.06)', border: '1px solid rgba(255,122,0,0.2)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 10, color: 'var(--accent-orange)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                ROOT CAUSE HYPOTHESIS
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{current.root_cause}</div>
            </div>
          )}

          {/* Issues */}
          {current.issues?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
                DETECTED ISSUES ({current.issues.length})
              </div>
              {current.issues.map((issue, i) => <IssueCard key={issue.id ?? i} issue={issue} />)}
            </div>
          )}

          {/* Anomalies */}
          {current.anomalies?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
                ANOMALIES
              </div>
              {current.anomalies.map((a, i) => (
                <div key={i} style={{
                  fontSize: 12, color: 'var(--text-secondary)',
                  padding: '6px 10px', marginBottom: 4,
                  background: 'var(--bg-card)', borderRadius: 4,
                  borderLeft: '2px solid var(--accent-orange)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {a}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {current.recommendations?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
                RECOMMENDATIONS
              </div>
              {current.recommendations.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '6px 10px', marginBottom: 4,
                  background: 'rgba(0,255,136,0.04)', borderRadius: 4,
                  border: '1px solid rgba(0,255,136,0.1)',
                }}>
                  <CheckCircle size={12} color="var(--accent-green)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{r}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
