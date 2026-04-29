const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || res.statusText)
  }
  return res.json()
}

// ── Health ────────────────────────────────────────────────────────────────────
export const api = {
  getSystemHealth:   ()      => request('/api/health/system'),
  getHealthSummary:  ()      => request('/api/health/summary'),
  getServiceHealth:  (name)  => request(`/api/health/service/${name}`),

  // Logs
  getRecentLogs:     (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/logs/recent?${qs}`)
  },
  getErrorLogs:      (minutes = 60) => request(`/api/logs/errors?minutes=${minutes}`),
  getLogStats:       (minutes = 60) => request(`/api/logs/stats?minutes=${minutes}`),

  // Analysis
  runAnalysis:       (body)  => request('/api/analysis/run', { method: 'POST', body: JSON.stringify(body) }),
  quickCheck:        ()      => request('/api/analysis/quick-check'),

  // Dynatrace
  getProblems:       ()      => request('/api/dynatrace/problems'),
  getMetrics:        ()      => request('/api/dynatrace/metrics'),
  getEvents:         ()      => request('/api/dynatrace/events'),
  getDynatraceStatus: ()     => request('/api/dynatrace/status'),

  // Agent
  chat: (message, history = [], include_live_context = true) =>
    request('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history: history, include_live_context }),
    }),

  chatStream: async function* (message, history = []) {
    const res = await fetch(`${BASE}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation_history: history, include_live_context: true }),
    })
    const reader = res.body.getReader()
    const dec = new TextDecoder()
    let buf = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.chunk) yield data.chunk
            if (data.done)  return
          } catch (_) {}
        }
      }
    }
  },
}
