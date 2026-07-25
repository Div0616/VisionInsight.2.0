// ============================================
// STATS BAR
// Dark section showing key platform numbers
// NO backend connection — static display data
// ============================================

const STATS = [
  { val: '80+', label: 'Object classes detected' },
  { val: 'Real-time', label: 'Live webcam detection' },
  { val: '200MB', label: 'Max video file size' },
  { val: 'YOLOv8', label: 'State-of-the-art AI model' },
]

export default function StatsBar() {
  return (
    <section style={{
      background: '#3e5769',
      padding: '40px 48px',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
      }}>
        {STATS.map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#f97316',
              marginBottom: '6px',
            }}>
              {stat.val}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#94a3b8',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
