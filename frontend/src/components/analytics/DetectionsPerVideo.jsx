import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

// ============================================
// DETECTIONS PER VIDEO — Vertical bar chart
//
// DATA SOURCE: GET /api/dashboard → all_sessions
//   Received as `sessions` prop (all_sessions array) from AnalyticsPage.
//
// Filters to completed sessions only, picks up to 10,
// sorts by total_detections descending, shows orange bars.
// ============================================

// Shorten filename for X-axis label (max 12 chars + …)
function shortName(filename, max = 12) {
  if (!filename) return '—'
  const base = filename.replace(/\.[^.]+$/, '')  // strip extension
  return base.length > max ? base.slice(0, max) + '…' : base
}

// Custom tooltip — shows full filename + exact detection count
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { fullName, value } = payload[0].payload
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
      fontSize: '13px',
      maxWidth: '220px',
    }}>
      <p style={{ fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 4px', wordBreak: 'break-all' }}>
        {fullName}
      </p>
      <p style={{ color: 'var(--color-primary)', fontWeight: '600', margin: 0 }}>
        {value.toLocaleString()} detections
      </p>
    </div>
  )
}

export default function DetectionsPerVideo({ sessions }) {
  // Only completed sessions have analytics data
  const data = (sessions || [])
    .filter((s) => s.status === 'completed' && s.analytics)
    .sort((a, b) =>
      (b.analytics?.total_detections ?? 0) - (a.analytics?.total_detections ?? 0)
    )
    .slice(0, 10)
    .map((s) => ({
      name: shortName(s.filename),
      fullName: s.filename,
      value: s.analytics?.total_detections ?? 0,
    }))

  const isEmpty = data.length === 0

  return (
    <div className="card">
      {/* ---- Header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
          background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingUp size={18} color="var(--color-primary)" />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Detections Per Video
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
            Top 10 completed sessions by detection count
          </p>
        </div>
      </div>

      {/* ---- Chart or empty state ---- */}
      {isEmpty ? (
        <div style={{
          height: '300px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <TrendingUp size={36} color="var(--color-border-strong)" />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
            No completed videos yet.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 16, right: 16, left: 0, bottom: 32 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-2)' }} />
            <Bar
              dataKey="value"
              fill="var(--color-primary)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
