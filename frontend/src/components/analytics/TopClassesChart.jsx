import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { BarChart2 } from 'lucide-react'

// ============================================
// TOP DETECTED CLASSES — Horizontal bar chart
//
// DATA SOURCE: GET /api/dashboard → class_distribution
//   { person: 432, car: 218, ... }
//   Received as `classDistribution` prop from AnalyticsPage.
//
// Shows top 8 classes sorted by detection count descending.
// Each bar gets a unique color from BAR_COLORS palette.
// ============================================

const BAR_COLORS = [
  '#f97316', '#3b82f6', '#22c55e', '#8b5cf6',
  '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6',
]

// Custom tooltip rendered on bar hover
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
      fontSize: '13px',
    }}>
      <p style={{ fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{name}</p>
      <p style={{ color: 'var(--color-primary)', fontWeight: '600', margin: 0 }}>
        {value.toLocaleString()} detections
      </p>
    </div>
  )
}

export default function TopClassesChart({ classDistribution }) {
  // Transform object → sorted array, take top 8
  const data = Object.entries(classDistribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    // Reverse so highest value appears at top of horizontal chart
    .reverse()

  const isEmpty = data.length === 0

  return (
    <div className="card">
      {/* ---- Header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
          background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChart2 size={18} color="var(--color-primary)" />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Most Detected Object Classes
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
            Across all processed videos
          </p>
        </div>
      </div>

      {/* ---- Chart or empty state ---- */}
      {isEmpty ? (
        <div style={{
          height: '300px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <BarChart2 size={36} color="var(--color-border-strong)" />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
            No detection data yet. Upload and process a video first.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 16, right: 24, left: 16, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-2)' }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
