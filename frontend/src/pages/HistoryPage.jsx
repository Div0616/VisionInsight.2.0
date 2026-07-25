import { useState, useEffect } from 'react'
import { videoAPI } from '../services/api'
import ResultsCard from '../components/upload/ResultsCard'
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Film
} from 'lucide-react'

// ============================================
// HISTORY PAGE
//
// BACKEND CONNECTIONS:
// 1. videoAPI.getAllSessions() → GET /api/sessions
//    TRIGGERED BY: Component mount
//    RETURNS: All sessions list
//
// 2. videoAPI.getSessionAnalytics() → GET /api/session/{id}/analytics
//    TRIGGERED BY: User clicking a session row
//    RETURNS: Full analytics for that session
// ============================================

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: '#16a34a', bg: '#dcfce7', label: 'Completed' },
  processing: { icon: Loader, color: '#2563eb', bg: '#dbeafe', label: 'Processing' },
  failed: { icon: XCircle, color: '#dc2626', bg: '#fee2e2', label: 'Failed' },
  pending: { icon: Clock, color: '#ca8a04', bg: '#fef9c3', label: 'Pending' },
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [sessionDetails, setSessionDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(null)

  // ============================================
  // LOAD ALL SESSIONS
  // BACKEND CONNECTION: GET /api/sessions
  // TRIGGERED BY: Page mount
  // ============================================
  const fetchSessions = async () => {
    try {
      setLoading(true)
      // FRONTEND → BACKEND
      // Calls: GET http://localhost:8000/api/sessions
      // Via: videoAPI.getAllSessions() in services/api.js
      const response = await videoAPI.getAllSessions()
      setSessions(response.sessions || [])
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  // ============================================
  // EXPAND SESSION — load full analytics
  // BACKEND CONNECTION: GET /api/session/{id}/analytics
  // TRIGGERED BY: User clicking a session row
  // ============================================
  const handleExpand = async (sessionId, status) => {
    // Toggle collapse
    if (expandedId === sessionId) {
      setExpandedId(null)
      return
    }

    setExpandedId(sessionId)

    // Only fetch analytics for completed sessions
    if (status !== 'completed') return

    // Don't refetch if already loaded
    if (sessionDetails[sessionId]) return

    try {
      setLoadingDetails(sessionId)

      // FRONTEND → BACKEND
      // Calls: GET http://localhost:8000/api/session/{sessionId}/analytics
      // Via: videoAPI.getSessionAnalytics() in services/api.js
      const details = await videoAPI.getSessionAnalytics(sessionId)
      setSessionDetails(prev => ({
        ...prev,
        [sessionId]: details
      }))
    } catch (err) {
      console.error('Failed to load session details:', err)
    } finally {
      setLoadingDetails(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        gap: '12px',
        color: 'var(--color-text-muted)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--color-border)',
          borderTop: '3px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        Loading sessions...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            Analysis History
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
          }}>
            {sessions.length} total sessions
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchSessions}>
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '48px',
        }}>
          <Film size={40} color="var(--color-text-muted)"
            style={{ margin: '0 auto 16px' }} />
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}>
            No sessions yet
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Upload a video to see analysis history here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sessions.map((session) => {
            const statusConf = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending
            const StatusIcon = statusConf.icon
            const isExpanded = expandedId === session.session_id
            const details = sessionDetails[session.session_id]
            const isLoadingThis = loadingDetails === session.session_id

            return (
              <div
                key={session.session_id}
                className="card"
                style={{ padding: '0', overflow: 'hidden' }}
              >
                {/* Session Row — clickable header */}
                <div
                  onClick={() => handleExpand(session.session_id, session.status)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-surface-2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Status Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: statusConf.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <StatusIcon size={18} color={statusConf.color} />
                  </div>

                  {/* Filename + Date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {session.filename}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      marginTop: '2px',
                    }}>
                      {formatDate(session.created_at)}
                    </p>
                  </div>

                  {/* Detections Count */}
                  {session.analytics?.total_detections && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--color-primary)',
                      }}>
                        {session.analytics.total_detections.toLocaleString()}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                      }}>
                        detections
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    background: statusConf.bg,
                    color: statusConf.color,
                    fontSize: '12px',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}>
                    {statusConf.label}
                  </div>

                  {/* Expand Arrow */}
                  {session.status === 'completed' && (
                    isExpanded
                      ? <ChevronUp size={18} color="var(--color-text-muted)" />
                      : <ChevronDown size={18} color="var(--color-text-muted)" />
                  )}
                </div>

                {/* Expanded Analytics */}
                {isExpanded && session.status === 'completed' && (
                  <div style={{
                    borderTop: '1px solid var(--color-border)',
                    padding: '20px',
                    background: 'var(--color-surface-2)',
                  }}>
                    {isLoadingThis ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '24px',
                        color: 'var(--color-text-muted)',
                      }}>
                        Loading analytics...
                      </div>
                    ) : details ? (
                      // 
                      // RESULTS DISPLAY
                      // DATA: from GET /api/session/{id}/analytics
                      // Same ResultsCard used in UploadPage
                      //
                      <ResultsCard results={details} />
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}