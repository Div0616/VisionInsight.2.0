import { TableProperties } from 'lucide-react'

// ============================================
// SESSION PERFORMANCE TABLE
//
// DATA SOURCE: GET /api/dashboard → all_sessions
//   Received as `sessions` prop from AnalyticsPage.
//   Filters to completed sessions only, sorts by
//   total_detections descending (highest first).
//
// Columns:
//   Filename | Detections | Frames | FPS | Resolution | Time | Date
// ============================================

// Format seconds → "Xm Ys" or just "Ys" when < 60s
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const s = Math.round(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`
}

// Truncate filename to maxLen characters with ellipsis
function truncate(str, maxLen = 20) {
  if (!str) return '—'
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

// Format ISO date → "18 Jul 2026"
function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return '—'
  }
}

// Column header cell
function Th({ children, align = 'left' }) {
  return (
    <th style={{
      padding: '10px 14px',
      textAlign: align,
      fontSize: '11px',
      fontWeight: '700',
      color: 'var(--color-text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      background: 'var(--color-surface-2)',
      borderBottom: '1px solid var(--color-border)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  )
}

// Data cell
function Td({ children, align = 'left', mono = false }) {
  return (
    <td style={{
      padding: '11px 14px',
      textAlign: align,
      fontSize: '13px',
      color: 'var(--color-text-primary)',
      borderBottom: '1px solid var(--color-border)',
      fontFamily: mono ? 'monospace' : 'inherit',
    }}>
      {children}
    </td>
  )
}

export default function SessionTable({ sessions }) {
  // Filter + sort completed sessions
  const rows = (sessions || [])
    .filter((s) => s.status === 'completed' && s.analytics)
    .sort((a, b) =>
      (b.analytics?.total_detections ?? 0) - (a.analytics?.total_detections ?? 0)
    )

  return (
    <div>
      {/* ---- Section header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
          background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TableProperties size={18} color="#3b82f6" />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Session Performance
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
            All completed sessions — sorted by detections
          </p>
        </div>
      </div>

      {/* ---- Empty state ---- */}
      {rows.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center', padding: '40px',
          color: 'var(--color-text-muted)', fontSize: '14px',
        }}>
          <TableProperties size={36} color="var(--color-border-strong)" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0 }}>No completed sessions yet. Upload a video to get started.</p>
        </div>
      ) : (
        /* ---- Table ---- */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Filename</Th>
                  <Th align="right">Detections</Th>
                  <Th align="right">Frames</Th>
                  <Th align="right">FPS</Th>
                  <Th align="center">Resolution</Th>
                  <Th align="right">Proc. Time</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, idx) => {
                  const a = s.analytics
                  const isEven = idx % 2 === 0
                  return (
                    <tr
                      key={s.session_id}
                      style={{
                        background: isEven ? 'var(--color-surface)' : 'var(--color-surface-2)',
                        transition: 'background var(--transition-slow)',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fff7ed')}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isEven
                          ? 'var(--color-surface)'
                          : 'var(--color-surface-2)'
                      }}
                    >
                      <Td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: 'var(--color-surface-2)',
                          fontSize: '11px', fontWeight: '700',
                          color: 'var(--color-text-muted)',
                          border: '1px solid var(--color-border)',
                        }}>
                          {idx + 1}
                        </span>
                      </Td>
                      <Td>
                        {/* Full name in title attr for hover tooltip */}
                        <span title={s.filename} style={{ fontWeight: '600' }}>
                          {truncate(s.filename, 20)}
                        </span>
                      </Td>
                      <Td align="right">
                        <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                          {(a?.total_detections ?? 0).toLocaleString()}
                        </span>
                      </Td>
                      <Td align="right" mono>{(a?.processed_frames ?? a?.total_frames ?? 0).toLocaleString()}</Td>
                      <Td align="right" mono>{a?.fps ? a.fps.toFixed(1) : '—'}</Td>
                      <Td align="center">
                        {a?.resolution
                          ? <span style={{
                              padding: '2px 8px', borderRadius: '999px',
                              background: 'var(--color-surface-2)',
                              border: '1px solid var(--color-border)',
                              fontSize: '11px', fontWeight: '600',
                              fontFamily: 'monospace',
                            }}>{a.resolution}</span>
                          : '—'}
                      </Td>
                      <Td align="right" mono>{formatTime(a?.processing_time_seconds)}</Td>
                      <Td>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {formatDate(s.created_at)}
                        </span>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
