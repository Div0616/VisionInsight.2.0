// ============================================
// STATS CARD COMPONENT
// Displays a single metric with icon
// Used in the top row of Dashboard
// DATA SOURCE: GET /api/dashboard
// Receives data as props from DashboardPage
// ============================================

export default function StatsCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bg, 
  subtitle 
}) {
  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      transition: 'transform var(--transition-slow), box-shadow var(--transition-slow)',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
    }}
    >
      {/* Icon */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          fontWeight: '500',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          lineHeight: '1',
          marginBottom: '4px',
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}