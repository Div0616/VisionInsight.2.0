import { useRef, useEffect } from 'react'

// ============================================
// WEBCAM FEED COMPONENT
// Shows webcam video + draws bounding boxes
// on canvas overlay on top of video
//
// HOW BOXES ARE DRAWN:
// 1. <video> tag shows raw webcam feed
// 2. <canvas> tag sits on top (transparent)
// 3. When detections arrive, we draw boxes
//    on the canvas using Canvas 2D API
// 4. Canvas is cleared and redrawn every frame
//
// NO BACKEND CONNECTION HERE
// Detections come as props from LivePage
// LivePage calls the backend every 500ms
// and passes results down as props
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
  default: '#22c55e',
}

export default function WebcamFeed({ videoRef, detections, isStreaming }) {
  const canvasRef = useRef(null)

  // ============================================
  // DRAW BOUNDING BOXES ON CANVAS
  // Runs every time detections change
  // Clears canvas then redraws all boxes
  // Now shows: ID {track_id} | {class} | {conf}%
  // ============================================
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')

    // Match canvas size to video size
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Clear previous frame's boxes
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!isStreaming || detections.length === 0) return

    // Scale factors — YOLO coordinates are based on
    // actual frame size, canvas might be different size
    const scaleX = canvas.width / (video.videoWidth || 640)
    const scaleY = canvas.height / (video.videoHeight || 480)

    // Draw each detection
    detections.forEach(det => {
      const [x1, y1, x2, y2] = det.bbox
      const trackId = det.track_id

      // Use per-object color from backend if available, else class-based
      const color = det.color || CLASS_COLORS[det.class_name] || CLASS_COLORS.default
      const confPercent = Math.round(det.confidence * 100)

      // Build label: "ID 12 | Person | 98%" or "Person 98%" (no tracking)
      const label = trackId >= 0
        ? `ID ${trackId} | ${det.class_name} | ${confPercent}%`
        : `${det.class_name} ${confPercent}%`

      // Scale coordinates
      const sx1 = x1 * scaleX
      const sy1 = y1 * scaleY
      const sx2 = x2 * scaleX
      const sy2 = y2 * scaleY
      const boxWidth = sx2 - sx1
      const boxHeight = sy2 - sy1

      // Draw bounding box rectangle
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.strokeRect(sx1, sy1, boxWidth, boxHeight)

      // Draw label background
      ctx.font = 'bold 12px Inter, sans-serif'
      const textWidth = ctx.measureText(label).width
      ctx.fillStyle = color
      ctx.fillRect(sx1, sy1 - 22, textWidth + 10, 22)

      // Draw label text
      ctx.fillStyle = 'white'
      ctx.fillText(label, sx1 + 5, sy1 - 6)
    })

  }, [detections, isStreaming])

  return (
    <div style={{
      position: 'relative',
      background: '#000',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      aspectRatio: '16/9',
    }}>

      {/* Webcam Video — raw feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isStreaming ? 'block' : 'none',
        }}
      />

      {/* Canvas Overlay — bounding boxes drawn here */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // Let clicks pass through to video
        }}
      />

      {/* Placeholder when not streaming */}
      {!isStreaming && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          gap: '12px',
        }}>
          <div style={{ fontSize: '48px' }}>📷</div>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>
            Camera not started
          </p>
          <p style={{ fontSize: '13px' }}>
            Click "Start Detection" to begin
          </p>
        </div>
      )}

      {/* Live indicator */}
      {isStreaming && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 10px',
          borderRadius: '999px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444',
            animation: 'pulse 1.5s infinite',
          }} />
          <span style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '1px',
          }}>
            LIVE
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}