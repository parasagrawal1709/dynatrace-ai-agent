import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export function useWebSocket() {
  const [connected, setConnected]     = useState(false)
  const [healthData, setHealthData]   = useState(null)
  const [logBatch, setLogBatch]       = useState([])
  const [aiAnalysis, setAiAnalysis]   = useState(null)
  const [anomalyCheck, setAnomalyCheck] = useState(null)
  const [allLogs, setAllLogs]         = useState([])

  const wsRef       = useRef(null)
  const reconnectRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      clearTimeout(reconnectRef.current)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        switch (msg.type) {
          case 'health_update':
            setHealthData(msg.payload)
            break
          case 'log_batch':
            setLogBatch(msg.payload.logs)
            setAllLogs(prev => {
              const merged = [...msg.payload.logs, ...prev]
              return merged.slice(0, 500)   // keep last 500
            })
            break
          case 'ai_analysis':
            setAiAnalysis(msg.payload)
            break
          case 'anomaly_check':
            setAnomalyCheck(msg.payload)
            break
        }
      } catch (_) {}
    }

    ws.onclose = () => {
      setConnected(false)
      reconnectRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected, healthData, logBatch, aiAnalysis, anomalyCheck, allLogs }
}
