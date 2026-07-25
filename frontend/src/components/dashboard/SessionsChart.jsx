import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// ============================================
// SESSIONS BAR CHART
// Shows detections per video session
// DATA SOURCE: GET /api/dashboard
// Uses recent_sessions from response
// Each bar = one uploaded video
// ============================================

export default function SessionsChart({ sessions }) {
  // Transform session data for chart
  // Input:  [{ filename, analytics: { total_detections } }]
  // Output: [{ name: "video.mp4", detections: 1200 }]
  const data = (sessions || [])
    .filter(s => s.status === 'completed')
    .map(s => ({
      // Shorten filename for display
      name: s.filename?.length > 15
        ? s.filename.substring(0, 15) + '...'
        : s.filename || 'Unknown',
      detections: s.analytics?.total_detections || 0,
      frames: s.analytics?.total_frames || 0,
    }))
    .reverse() // Oldest first so chart reads left to right

  if (data.length === 0) {
    return (
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '14px',
      }}>
        No completed sessions yet
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '4px',
      }}>
        Detections Per Video
      </h3>
      <p style={{
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        marginBottom: '20px',
      }}>
        Total objects detected in each processed video
      </p>

      {/*
        DATA: comes from recent_sessions in /api/dashboard
        Each bar represents one uploaded video
        Height = number of objects detected
      */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip
            formatter={(value) => [value.toLocaleString(), 'Detections']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
            }}
          />
          <Bar
            dataKey="detections"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}