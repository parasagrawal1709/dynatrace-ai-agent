import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader, Terminal } from 'lucide-react'
import { api } from '../services/api'

const SUGGESTED_QUESTIONS = [
  "What is causing the high error rate in payment-service?",
  "Are there any memory issues I should be concerned about?",
  "What's the predicted risk of an outage in the next hour?",
  "Give me a full health report of all services.",
  "What Dynatrace problems are currently open?",
  "Why is response time degraded on api-gateway?",
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 10,
      flexDirection: isUser ? 'row-reverse' : 'row',
      marginBottom: 14, padding: '0 4px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser
          ? 'rgba(0,212,255,0.15)'
          : 'rgba(168,85,247,0.15)',
        border: `1px solid ${isUser ? 'rgba(0,212,255,0.3)' : 'rgba(168,85,247,0.3)'}`,
        marginTop: 2,
      }}>
        {isUser
          ? <User size={13} color="var(--accent-cyan)" />
          : <Bot  size={13} color="var(--accent-purple)" />
        }
      </div>
      <div style={{
        maxWidth: '80%',
        padding: '10px 14px', borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
        background: isUser ? 'rgba(0,212,255,0.06)' : 'var(--bg-elevated)',
        border: `1px solid ${isUser ? 'rgba(0,212,255,0.15)' : 'var(--border)'}`,
        fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {msg.content}
        {msg.streaming && (
          <span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--accent-purple)', marginLeft: 3, borderRadius: 1, animation: 'pulse 1s infinite' }} />
        )}
      </div>
    </div>
  )
}

export default function AgentChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 I\'m your SRE AI Agent. I have live access to your Dynatrace logs, metrics, and active problems.\n\nAsk me anything about your system health, recent errors, or predicted issues.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])

    // Build history (exclude the streaming placeholder)
    const history = messages
      .filter(m => !m.streaming)
      .map(m => ({ role: m.role, content: m.content }))

    // Add streaming placeholder
    const streamId = Date.now()
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, id: streamId }])

    try {
      let fullText = ''
      for await (const chunk of api.chatStream(msg, history)) {
        fullText += chunk
        setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, content: fullText } : m
        ))
      }
      // Finalise
      setMessages(prev => prev.map(m =>
        m.id === streamId ? { role: 'assistant', content: fullText } : m
      ))
    } catch (e) {
      setMessages(prev => prev.map(m =>
        m.id === streamId
          ? { role: 'assistant', content: `⚠️ Error: ${e.message || 'Failed to get response.'}` }
          : m
      ))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px', background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <Terminal size={13} color="var(--accent-purple)" />
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          SRE AI AGENT — CLAUDE
        </span>
        <div style={{
          marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)',
        }} className="pulse" />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length < 3 && (
        <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              style={{
                padding: '4px 10px', borderRadius: 20, cursor: 'pointer', fontSize: 11,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', transition: 'all 0.15s',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '10px 12px', background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border)', flexShrink: 0,
        display: 'flex', gap: 8, alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about logs, metrics, or issues … (Enter to send)"
          rows={1}
          style={{
            flex: 1, padding: '8px 12px', resize: 'none', maxHeight: 120,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
            background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: loading || !input.trim() ? 0.5 : 1, transition: 'all 0.15s',
          }}
        >
          {loading
            ? <Loader size={14} color="var(--accent-purple)" className="pulse" />
            : <Send  size={14} color="var(--accent-purple)" />
          }
        </button>
      </div>
    </div>
  )
}
