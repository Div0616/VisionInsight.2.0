import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'

// ============================================
// RECENT SESSIONS TABLE
// Shows last 5 processed videos
// DATA SOURCE: GET /api/dashboard (recent_sessions)
// Clicking a row navigates to /history
// with the session highlighted
// ============================================

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: '#16a34a',
    bg: '#dcfce7',
    label: 'Completed'
  },
  processing: {
    icon: Loader,
    color: '#2563eb',
    bg: '#dbeafe',
    label: 'Processing'
  },
  failed: {
    icon: XCircle,
    color: '#dc2626',
    bg: '#fee2e2',
    label: 'Failed'
  },
  pending: {
    icon: Clock,
    color: '#ca8a04',
    bg: '#fef9c3',
    label: 'Pending'
  },
}

export default function RecentSessions({ sessions }) {
  const navigate = useNavigate()

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  return (
    <div className="card">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
          }}>
            Recent Sessions
          </h3>
          <p style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            marginTop: '2px',
          }}>
            Latest video analysis sessions
          </p>
        </div>

        {/* 
          VIEW ALL BUTTON
          NAVIGATES TO: /history page
          No backend call — just routing
        */}
        <button
          className="btn-secondary"
          onClick={() => navigate('/history')}
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          View All
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Table */}
      {sessions?.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}>
          No sessions yet. Upload a video to get started!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--color-border)',
              }}>
                {['Filename', 'Status', 'Detections', 'Size', 'Date'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'var(--color-text-muted)',
                    fontWeight: '600',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sessions || []).map((session) => {
                const statusConf = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending
                const StatusIcon = statusConf.icon

                return (
                  <tr
                    key={session.session_id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background var(--transition-fast)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--color-surface-2)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                    onClick={() => navigate('/history')}
                  >
                    {/* Filename */}
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontWeight: '500',
                        color: 'var(--color-text-primary)',
                        maxWidth: '200px',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {session.filename}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '12px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: statusConf.bg,
                        color: statusConf.color,
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        <StatusIcon size={12} />
                        {statusConf.label}
                      </div>
                    </td>

                    {/* Detections */}
                    <td style={{
                      padding: '12px',
                      color: 'var(--color-text-primary)',
                      fontWeight: '600',
                    }}>
                      {session.analytics?.total_detections?.toLocaleString() || '—'}
                    </td>

                    {/* File Size */}
                    <td style={{
                      padding: '12px',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {formatSize(session.file_size)}
                    </td>

                    {/* Date */}
                    <td style={{
                      padding: '12px',
                      color: 'var(--color-text-muted)',
                    }}>
                      {formatDate(session.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}