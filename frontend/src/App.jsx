import { useState } from 'react'
import {
  Activity, FileText, Brain, MessageSquare,
  BarChart3, AlertOctagon, ClipboardPaste,
} from 'lucide-react'

import Header            from './components/Header'
import Sidebar           from './components/Sidebar'
import HealthDashboard   from './components/HealthDashboard'
import MetricsChart      from './components/MetricsChart'
import LogViewer         from './components/LogViewer'
import ProblemsPanel     from './components/ProblemsPanel'
import AnalysisPanel     from './components/AnalysisPanel'
import AgentChat         from './components/AgentChat'
import ManualAnalysis    from './components/ManualAnalysis'
import NotificationToast from './components/NotificationToast'

import { useWebSocket }     from './hooks/useWebSocket'
import { useHealthPolling } from './hooks/useHealthPolling'

const TABS = [
  { id: 'health',   label: 'HEALTH',    icon: Activity       },
  { id: 'metrics',  label: 'METRICS',   icon: BarChart3      },
  { id: 'logs',     label: 'LOGS',      icon: FileText       },
  { id: 'problems', label: 'PROBLEMS',  icon: AlertOctagon   },
  { id: 'analysis', label: 'ANALYSIS',  icon: Brain          },
  { id: 'agent',    label: 'AI AGENT',  icon: MessageSquare  },
  { id: 'manual',   label: 'Service Now Integration',icon: BarChart3 },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('health')

  const { connected, healthData, allLogs, aiAnalysis, anomalyCheck } = useWebSocket()
  const { summary, logStats, problems } = useHealthPolling(30000)

  const effectiveHealth = healthData || summary

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header connected={connected} health={effectiveHealth} anomaly={anomalyCheck} />

      {/* Tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 1,
        padding: '0 20px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0, overflowX: 'auto',
      }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive  = activeTab === id
          const hasBadge  = (id === 'analysis' && (aiAnalysis?.issues?.length ?? 0) > 0)
                         || (id === 'problems' && problems.length > 0)
          const hasPulse  = (id === 'logs'     && anomalyCheck?.anomaly)
                         || (id === 'problems' && problems.some(p => p.status === 'OPEN'))
          const badgeCount = id === 'analysis' ? aiAnalysis?.issues?.length : problems.length

          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', whiteSpace: 'nowrap',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}>
              <Icon size={12} />
              {label}
              {hasBadge && (
                <span style={{ padding: '1px 5px', borderRadius: 8, fontSize: 9, fontWeight: 700, background: 'rgba(255,51,85,0.2)', color: 'var(--accent-red)' }}>
                  {badgeCount}
                </span>
              )}
              {hasPulse && (
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-orange)', boxShadow: '0 0 6px var(--accent-orange)', display: 'inline-block' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar health={effectiveHealth} anomalyCheck={anomalyCheck} logStats={logStats} />

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: activeTab === 'health'   ? 'flex' : 'none', height: '100%', overflow: 'hidden' }}>
            <HealthDashboard liveHealth={healthData} />
          </div>
          <div style={{ display: activeTab === 'metrics'  ? 'flex' : 'none', height: '100%', overflow: 'hidden' }}>
            <MetricsChart />
          </div>
          <div style={{ display: activeTab === 'logs'     ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <LogViewer logs={allLogs} />
          </div>
          <div style={{ display: activeTab === 'problems' ? 'flex' : 'none', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <ProblemsPanel />
          </div>
          <div style={{ display: activeTab === 'analysis' ? 'flex' : 'none', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <AnalysisPanel analysis={aiAnalysis} />
          </div>
          <div style={{ display: activeTab === 'agent'    ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <AgentChat />
          </div>
          <div style={{ display: activeTab === 'manual'   ? 'flex' : 'none', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <ManualAnalysis />
          </div>
        </div>
      </div>

      <NotificationToast anomalyCheck={anomalyCheck} aiAnalysis={aiAnalysis} />
    </div>
  )
}
