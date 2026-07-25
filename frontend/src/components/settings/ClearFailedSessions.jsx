import { useState, useEffect, useCallback } from 'react'
import { Trash2, AlertTriangle, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react'
import { videoAPI } from '../../services/api'

// ============================================
// CLEAR FAILED SESSIONS CARD
//
// BACKEND CONNECTIONS:
//   1. videoAPI.getAllSessions()      → GET  /api/sessions  (count failed)
//   2. videoAPI.clearFailedSessions() → DELETE /api/sessions/failed
//
// STATE:
//   failedCount   — number of sessions with status "failed"
//   loading       — counting failed sessions on mount
//   clearing      — true while DELETE call is in flight
//   confirming    — true after first button click (shows confirm prompt)
//   toast         — { type, text } result message
// ============================================

export default function ClearFailedSessions() {
  const [failedCount, setFailedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [toast, setToast] = useState(null)  // { type, text }

  /**
   * fetchFailedCount — loads all sessions and counts those with status "failed"
   * BACKEND: GET /api/sessions via videoAPI.getAllSessions()
   * TRIGGERED BY: component mount + after successful deletion
   */
  const fetchFailedCount = useCallback(async () => {
    setLoading(true)
    try {
      const res = await videoAPI.getAllSessions()
      const sessions = res.sessions || []
      setFailedCount(sessions.filter((s) => s.status === 'failed').length)
    } catch {
      setFailedCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Count failed sessions when card mounts
  useEffect(() => {
    fetchFailedCount()
  }, [fetchFailedCount])

  /**
   * handleClear — calls DELETE /api/sessions/failed
   * First click shows confirmation UI; second click executes deletion.
   */
  const handleClear = async () => {
    // First click → ask for confirmation
    if (!confirming) {
      setConfirming(true)
      return
    }

    // Second click → execute
    setClearing(true)
    setConfirming(false)
    setToast(null)
    try {
      // FRONTEND → BACKEND
      // Via videoAPI.clearFailedSessions() in services/api.js
      // Calls DELETE /api/sessions/failed
      const res = await videoAPI.clearFailedSessions()
      setToast({ type: 'success', text: res.message })
      // Refresh count after deletion
      await fetchFailedCount()
    } catch (err) {
      const msg =
        err?.response?.data?.detail || 'Failed to clear sessions. Is the backend running?'
      setToast({ type: 'error', text: msg })
    } finally {
      setClearing(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* ---- Header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
          background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trash2 size={20} color="#dc2626" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Clear Failed Sessions
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Remove error entries from MongoDB
          </p>
        </div>

        {/* Failed count badge */}
        <div style={{ textAlign: 'right' }}>
          {loading
            ? <Loader size={16} color="var(--color-text-muted)" style={{ animation: 'spin 0.8s linear infinite' }} />
            : (
              <div style={{
                padding: '6px 14px', borderRadius: '999px',
                background: failedCount > 0 ? '#fee2e2' : '#dcfce7',
                color: failedCount > 0 ? '#dc2626' : '#16a34a',
                fontWeight: '700', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span>{failedCount}</span>
                <span style={{ fontWeight: '500', fontSize: '12px' }}>
                  {failedCount === 1 ? 'failed' : 'failed'}
                </span>
              </div>
            )
          }
        </div>
      </div>

      {/* ---- Description ---- */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
        Sessions that encountered errors during processing are kept in the database
        but contribute no useful analytics. Use this button to permanently remove them.
        Completed and pending sessions are <strong>not</strong> affected.
      </p>

      {/* ---- Confirmation prompt ---- */}
      {confirming && (
        <div style={{
          padding: '14px 16px', borderRadius: 'var(--radius-md)',
          background: '#fef9c3', border: '1px solid #fde047',
          marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <AlertTriangle size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
            This will permanently delete <strong>{failedCount} failed session{failedCount !== 1 ? 's' : ''}</strong> from MongoDB.
            This action cannot be undone. Click the button again to confirm.
          </p>
        </div>
      )}

      {/* ---- Toast message ---- */}
      {toast && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px',
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#16a34a' : '#dc2626',
          fontSize: '13px', fontWeight: '600',
          animation: 'fadeIn 0.25s ease',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />}
          {toast.text}
        </div>
      )}

      {/* ---- Action buttons ---- */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          id="btn-clear-failed"
          onClick={handleClear}
          disabled={clearing || failedCount === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            background: confirming ? '#dc2626' : failedCount === 0 ? 'var(--color-border)' : '#fee2e2',
            color: confirming ? '#fff' : failedCount === 0 ? 'var(--color-text-muted)' : '#dc2626',
            border: confirming ? 'none' : `1px solid ${failedCount === 0 ? 'var(--color-border)' : '#fca5a5'}`,
            fontWeight: '600', fontSize: '14px', cursor: failedCount === 0 ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-slow)',
            opacity: clearing ? 0.7 : 1,
          }}
        >
          {clearing
            ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Trash2 size={15} />}
          {clearing
            ? 'Deleting…'
            : confirming
              ? '⚠ Confirm Delete'
              : `Clear Failed Sessions`}
        </button>

        {/* Refresh count button */}
        <button
          id="btn-refresh-failed-count"
          className="btn-secondary"
          onClick={fetchFailedCount}
          disabled={loading}
          style={{ padding: '10px 14px' }}
          title="Refresh count"
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>

        {/* Cancel confirmation */}
        {confirming && (
          <button
            id="btn-cancel-clear"
            className="btn-secondary"
            onClick={() => setConfirming(false)}
            style={{ padding: '10px 16px' }}
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
