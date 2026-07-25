// ============================================
// DETECTION LIST COMPONENT
// Shows real-time list of tracked objects
// Updates every time a new frame is processed
// DATA SOURCE: POST /api/detect/frame response
// Receives detections as props from LivePage
// Now shows individual tracked objects with IDs
// ============================================

const CLASS_COLORS = {
  person: '#f97316',
  car: '#3b82f6',
  truck: '#8b5cf6',
  bus: '#ec4899',
  motorcycle: '#f59e0b',
  bicycle: '#06b6d4',
  dog: '#22c55e',
  cat: '#14b8a6',
  default: '#94a3b8',
}

export default function DetectionList({
  detections,
  fps,
  frameCount,
  activeObjects = 0,
  totalUnique = 0,
}) {

  const getColor = (det) => {
    return det.color || CLASS_COLORS[det.class_name] || CLASS_COLORS.default
  }

  // Group detections by class name for summary
  const grouped = detections.reduce((acc, det) => {
    const name = det.class_name
    if (!acc[name]) {
      acc[name] = { count: 0, trackIds: new Set(), maxConfidence: 0 }
    }
    acc[name].count++
    if (det.track_id >= 0) acc[name].trackIds.add(det.track_id)
    acc[name].maxConfidence = Math.max(acc[name].maxConfidence, det.confidence)
    return acc
  }, {})

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
    }}>

      {/* Live Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
      }}>
        {[
          { label: 'Active', value: activeObjects, color: '#22c55e' },
          { label: 'Unique', value: totalUnique, color: '#f97316' },
          { label: 'FPS', value: fps || 0, color: '#3b82f6' },
          { label: 'Frames', value: frameCount, color: '#8b5cf6' },
        ].map(stat => (
          <div
            key={stat.label}
            className="card"
            style={{ padding: '10px', textAlign: 'center' }}
          >
            <p style={{
              fontSize: '18px',
              fontWeight: '700',
              color: stat.color,
            }}>
              {stat.value}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              fontWeight: '500',
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Class Summary */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <h4 style={{
          fontSize: '13px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Class Summary
        </h4>

        {Object.keys(grouped).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '16px',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
          }}>
            No objects detected
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            {Object.entries(grouped).map(([className, data]) => {
              const color = CLASS_COLORS[className] || CLASS_COLORS.default
              return (
                <div
                  key={className}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      textTransform: 'capitalize',
                    }}>
                      {className}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      background: color + '22',
                      color: color,
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontWeight: '600',
                    }}>
                      ×{data.count}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {Math.round(data.maxConfidence * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Individual Tracked Objects */}
      <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
        <h4 style={{
          fontSize: '13px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Tracked Objects
        </h4>

        {detections.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
          }}>
            No objects detected
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '280px',
            overflowY: 'auto',
          }}>
            {detections.map((det, i) => {
              const color = getColor(det)
              const trackId = det.track_id
              return (
                <div
                  key={trackId >= 0 ? `track-${trackId}` : `det-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {trackId >= 0 && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        background: color,
                        color: '#fff',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        minWidth: '28px',
                        textAlign: 'center',
                      }}>
                        #{trackId}
                      </span>
                    )}
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      textTransform: 'capitalize',
                    }}>
                      {det.class_name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: color,
                  }}>
                    {Math.round(det.confidence * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}