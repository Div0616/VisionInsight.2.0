import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// ============================================
// DONUT CHART COMPONENT
// Shows distribution of detected object classes
// DATA SOURCE: GET /api/dashboard
// Uses class_distribution field from response
// Rendered using Recharts PieChart
// ============================================

// Color palette for chart slices
const COLORS = [
  '#f97316', // orange (primary)
  '#3b82f6', // blue
  '#22c55e', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
]

export default function DonutChart({ classDistribution }) {
  // Convert class_distribution object to array for Recharts
  // Input:  { "person": 800, "car": 400 }
  // Output: [{ name: "person", value: 800 }, ...]
  const data = Object.entries(classDistribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) // Highest first
    .slice(0, 8) // Max 8 classes to keep chart clean

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
        No detection data yet
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
        Object Class Distribution
      </h3>
      <p style={{
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        marginBottom: '20px',
      }}>
        Total detections across all processed videos
      </p>

      {/* 
        ResponsiveContainer — makes chart resize with window
        PieChart with innerRadius = Donut style
        DATA: comes from class_distribution in /api/dashboard
      */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              value.toLocaleString(),
              name
            ]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                textTransform: 'capitalize',
              }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}