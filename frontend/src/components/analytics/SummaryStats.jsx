import { Film, Eye, Clock, Star } from 'lucide-react'

// ============================================
// ANALYTICS SUMMARY STATS — 4 top-level KPI cards
//
// DATA SOURCE: GET /api/dashboard (via videoAPI.getDashboardStats())
// Props received from AnalyticsPage after the dashboard fetch resolves.
//
// Props:
//   completedVideos      — number of sessions with status "completed"
//   totalDetections      — sum of all detection events across completed sessions
//   avgProcessingTime    — average processing_time_seconds across completed sessions
//   mostDetectedClass    — string name of the top class e.g. "person"
// ============================================

// Emoji map for common YOLO class names — falls back to 🔍
const CLASS_EMOJI = {
  person: '🧍', car: '🚗', truck: '🚛', bus: '🚌', bicycle: '🚲',
  motorcycle: '🏍', cat: '🐱', dog: '🐶', bird: '🐦', horse: '🐴',
  cow: '🐄', sheep: '🐑', elephant: '🐘', bear: '🐻', zebra: '🦓',
  giraffe: '🦒', backpack: '🎒', umbrella: '☂️', handbag: '👜',
  tie: '👔', suitcase: '🧳', frisbee: '🥏', skis: '🎿',
  snowboard: '🏂', 'sports ball': '⚽', kite: '🪁', bottle: '🍶',
  'wine glass': '🍷', cup: '☕', fork: '🍴', knife: '🔪',
  spoon: '🥄', bowl: '🥣', banana: '🍌', apple: '🍎',
  sandwich: '🥪', orange: '🍊', pizza: '🍕', laptop: '💻',
  mouse: '🖱️', keyboard: '⌨️', 'cell phone': '📱', tv: '📺',
  microwave: '📡', oven: '🔥', chair: '🪑', couch: '🛋️',
  bed: '🛏️', 'dining table': '🪵', toilet: '🚽', book: '📖',
  clock: '🕐', vase: '🏺', scissors: '✂️', 'traffic light': '🚦',
  'fire hydrant': '🚒', 'stop sign': '🛑', airplane: '✈️', boat: '⛵',
  train: '🚂',
}

function getEmoji(className) {
  if (!className) return '🔍'
  return CLASS_EMOJI[className.toLowerCase()] || '🔍'
}

// Individual stat card — icon in coloured bg circle + big orange number
function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtitle }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      {/* Icon bubble */}
      <div style={{
        width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
        background: iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={iconColor} />
      </div>

      {/* Text */}
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-primary)', margin: 0, lineHeight: 1.1 }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', margin: '4px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default function SummaryStats({ completedVideos, totalDetections, avgProcessingTime, mostDetectedClass }) {
  const emoji = getEmoji(mostDetectedClass)

  const cards = [
    {
      icon: Film,
      iconBg: '#dbeafe',
      iconColor: '#3b82f6',
      label: 'Videos Processed',
      value: completedVideos ?? 0,
      subtitle: 'Completed sessions',
    },
    {
      icon: Eye,
      iconBg: '#ffedd5',
      iconColor: 'var(--color-primary)',
      label: 'Objects Detected',
      value: (totalDetections ?? 0).toLocaleString(),
      subtitle: 'Total detection events',
    },
    {
      icon: Clock,
      iconBg: '#ede9fe',
      iconColor: '#8b5cf6',
      label: 'Avg Processing Time',
      value: `${avgProcessingTime ?? 0}s`,
      subtitle: 'Per completed video',
    },
    {
      icon: Star,
      iconBg: '#fef9c3',
      iconColor: '#ca8a04',
      label: 'Top Detected Class',
      value: mostDetectedClass
        ? `${emoji} ${mostDetectedClass}`
        : '—',
      subtitle: 'Most frequent object',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    }}>
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  )
}
