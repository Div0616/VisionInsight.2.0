// ============================================
// SESSION STATUS BREAKDOWN — 4-cell status grid
//
// DATA SOURCE: GET /api/dashboard → all_sessions
//   Received as `sessions` prop (all_sessions array) from AnalyticsPage.
//   Counts sessions by status value.
// ============================================

// Status configuration — badge class, colour, label
const STATUS_CONFIG = [
  {
    status: 'completed',
    label: 'Completed',
    badgeClass: 'badge-success',
    bg: '#dcfce7',
    color: '#16a34a',
    emoji: '✅',
  },
  {
    status: 'processing',
    label: 'Processing',
    badgeClass: 'badge-info',
    bg: '#dbeafe',
    color: '#2563eb',
    emoji: '⚙️',
  },
  {
    status: 'failed',
    label: 'Failed',
    badgeClass: 'badge-error',
    bg: '#fee2e2',
    color: '#dc2626',
    emoji: '❌',
  },
  {
    status: 'pending',
    label: 'Pending',
    badgeClass: 'badge-warning',
    bg: '#fef9c3',
    color: '#ca8a04',
    emoji: '⏳',
  },
]

export default function StatusBreakdown({ sessions }) {
  // Count each status from the sessions array
  const counts = (sessions || []).reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      {/* ---- Section header ---- */}
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
          Session Status Breakdown
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
          Current state of all {(sessions || []).length} sessions in the database
        </p>
      </div>

      {/* ---- 4-cell grid ---- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
      }}>
        {STATUS_CONFIG.map(({ status, label, bg, color, emoji, badgeClass }) => {
          const count = counts[status] ?? 0
          return (
            <div
              key={status}
              className="card"
              style={{
                textAlign: 'center',
                padding: '20px 16px',
                borderTop: `3px solid ${color}`,
                transition: 'transform var(--transition-slow), box-shadow var(--transition-slow)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              {/* Emoji icon */}
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{emoji}</div>

              {/* Count — large + bold in status colour */}
              <div style={{
                fontSize: '32px', fontWeight: '800', color, lineHeight: 1,
                marginBottom: '8px',
              }}>
                {count}
              </div>

              {/* Status badge */}
              <span className={`badge ${badgeClass}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
