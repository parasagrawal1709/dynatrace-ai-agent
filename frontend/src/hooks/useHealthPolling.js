import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'

/**
 * Polls the REST API for health + log stats.
 * Used as a fallback when WebSocket is not connected, and
 * also for initial data hydration.
 */
export function useHealthPolling(intervalMs = 30000) {
  const [summary,  setSummary]  = useState(null)
  const [logStats, setLogStats] = useState(null)
  const [problems, setProblems] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const timerRef = useRef(null)

  const fetchAll = async () => {
    try {
      const [s, l, p] = await Promise.all([
        api.getHealthSummary(),
        api.getLogStats(60),
        api.getProblems(),
      ])
      setSummary(s)
      setLogStats(l)
      setProblems(p.problems || [])
      setError(null)
    } catch (e) {
      setError(e.message || 'Poll failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    timerRef.current = setInterval(fetchAll, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [intervalMs])

  return { summary, logStats, problems, loading, error, refresh: fetchAll }
}
