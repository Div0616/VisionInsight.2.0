import { useState, useRef, useCallback, useEffect } from 'react'
import { videoAPI } from '../services/api'
import WebcamFeed from '../components/live/WebcamFeed'
import DetectionList from '../components/live/DetectionList'
import { Play, Square, Camera, AlertCircle, Wifi, WifiOff, Smartphone } from 'lucide-react'

// ============================================
// LIVE PAGE — Real-time webcam & IP camera detection
//
// TWO MODES:
// 1. WEBCAM MODE — browser captures frames, sends to backend
//    POST /api/detect/frame — every 500ms while streaming
// 2. IP CAMERA MODE — backend processes stream directly
//    POST /api/stream/start — starts stream
//    GET /api/stream/status — polls for detections
//    POST /api/stream/stop — stops stream
//
// TRACKING:
// Both modes now use YOLO BoT-SORT tracking
// Objects get persistent IDs across frames
// POST /api/detect/reset — resets IDs on start/stop
// ============================================

export default function LivePage() {
  // Shared state
  const [isStreaming, setIsStreaming] = useState(false)
  const [detections, setDetections] = useState([])
  const [fps, setFps] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [activeObjects, setActiveObjects] = useState(0)
  const [totalUnique, setTotalUnique] = useState(0)
  const [error, setError] = useState(null)
  const [isDetecting, setIsDetecting] = useState(false)

  // Mode: 'webcam' or 'ipcam'
  const [mode, setMode] = useState('webcam')
  const [streamUrl, setStreamUrl] = useState('')
  const [isIpStreamActive, setIsIpStreamActive] = useState(false)

  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const captureCanvasRef = useRef(null)
  const fpsCounterRef = useRef(0)
  const fpsTimerRef = useRef(null)

  // ============================================
  // WEBCAM MODE — Start
  // ============================================
  const startWebcam = async () => {
    try {
      setError(null)

      // Reset tracking state for fresh IDs
      try { await videoAPI.resetTracking() } catch (e) { /* ignore */ }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      setIsStreaming(true)
      startDetectionLoop()

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else {
        setError(`Camera error: ${err.message}`)
      }
    }
  }

  // ============================================
  // CAPTURE FRAME FROM VIDEO
  // ============================================
  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = captureCanvasRef.current

    if (!video || !canvas || video.readyState < 2) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const base64 = canvas.toDataURL('image/jpeg', 0.8)
    return base64.split(',')[1]
  }, [])

  // ============================================
  // WEBCAM DETECTION LOOP
  // Captures frame → sends to backend → updates UI
  // Now receives track_id and tracking stats
  // ============================================
  const startDetectionLoop = useCallback(() => {
    // FPS counter
    fpsTimerRef.current = setInterval(() => {
      setFps(fpsCounterRef.current)
      fpsCounterRef.current = 0
    }, 1000)

    // Main detection interval — every 500ms
    intervalRef.current = setInterval(async () => {
      const base64Frame = captureFrame()
      if (!base64Frame) return

      try {
        setIsDetecting(true)
        const result = await videoAPI.detectFrame(base64Frame)

        setDetections(result.detections || [])
        setActiveObjects(result.active_objects || 0)
        setTotalUnique(result.total_unique_objects || 0)
        setFrameCount(prev => prev + 1)
        fpsCounterRef.current++

      } catch (err) {
        // Don't crash on detection errors
      } finally {
        setIsDetecting(false)
      }
    }, 500)
  }, [captureFrame])

  // ============================================
  // IP CAMERA MODE — Start
  // ============================================
  const startIpStream = async () => {
    if (!streamUrl.trim()) {
      setError('Please enter a stream URL')
      return
    }

    try {
      setError(null)
      await videoAPI.startStream(streamUrl.trim())
      setIsIpStreamActive(true)
      setIsStreaming(true)
      startIpPolling()
    } catch (err) {
      setError(`Failed to connect: ${err.response?.data?.detail || err.message}`)
    }
  }

  // ============================================
  // IP CAMERA POLLING LOOP
  // Polls backend for latest detections every 500ms
  // ============================================
  const startIpPolling = useCallback(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const result = await videoAPI.getStreamStatus()

        if (result.error) {
          setError(result.error)
          stopStream()
          return
        }

        if (!result.active) {
          stopStream()
          return
        }

        setDetections(result.detections || [])
        setActiveObjects(result.active_objects || 0)
        setTotalUnique(result.total_unique_objects || 0)
        setFrameCount(result.frame_count || 0)
        setFps(result.fps || 0)

      } catch (err) {
        // Don't crash on polling errors
      }
    }, 500)
  }, [])

  // ============================================
  // STOP EVERYTHING
  // ============================================
  const stopStream = useCallback(async () => {
    // Stop intervals
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (fpsTimerRef.current) clearInterval(fpsTimerRef.current)

    // Stop webcam tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Stop IP camera stream
    if (isIpStreamActive) {
      try { await videoAPI.stopStream() } catch (e) { /* ignore */ }
    }

    // Reset tracking state
    try { await videoAPI.resetTracking() } catch (e) { /* ignore */ }

    // Reset state
    setIsStreaming(false)
    setIsIpStreamActive(false)
    setDetections([])
    setFps(0)
    setFrameCount(0)
    setActiveObjects(0)
    setTotalUnique(0)
    fpsCounterRef.current = 0
  }, [isIpStreamActive])

  // Cleanup on page unmount
  useEffect(() => {
    return () => stopStream()
  }, [stopStream])

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          Live Detection Feed
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
        }}>
          Real-time AI object detection & tracking using your webcam or IP camera
        </p>
      </div>

      {/* Mode Selector Tabs */}
      {!isStreaming && (
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '16px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          width: 'fit-content',
        }}>
          <button
            onClick={() => setMode('webcam')}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: mode === 'webcam' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: mode === 'webcam' ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            <Camera size={15} />
            Webcam
          </button>
          <button
            onClick={() => setMode('ipcam')}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              borderLeft: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: mode === 'ipcam' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: mode === 'ipcam' ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            <Smartphone size={15} />
            IP Camera / Phone
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#fee2e2',
          borderRadius: 'var(--radius-md)',
          color: '#dc2626',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Main Layout — Video + Detection List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        alignItems: 'start',
      }}>

        {/* LEFT — Webcam Feed / IP Camera Placeholder */}
        <div>
          {mode === 'webcam' ? (
            <>
              <WebcamFeed
                videoRef={videoRef}
                detections={detections}
                isStreaming={isStreaming}
              />
              <canvas
                ref={captureCanvasRef}
                style={{ display: 'none' }}
              />
            </>
          ) : (
            /* IP Camera Mode — show detection info panel */
            <div style={{
              background: '#000',
              borderRadius: 'var(--radius-lg)',
              aspectRatio: '16/9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {isIpStreamActive ? (
                <>
                  {/* Live stream info overlay */}
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
                      background: '#22c55e',
                      animation: 'pulse 1.5s infinite',
                    }} />
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>
                      IP STREAM
                    </span>
                  </div>

                  {/* Stats in center */}
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <Wifi size={48} color="#22c55e" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                      {activeObjects} Active Objects
                    </p>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                      {totalUnique} unique tracked · {fps} FPS · {frameCount} frames
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', maxWidth: '400px' }}>
                      {streamUrl}
                    </p>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                  <Smartphone size={48} style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    Connect IP Camera or Phone
                  </p>
                  <p style={{ fontSize: '13px', maxWidth: '360px', lineHeight: '1.6' }}>
                    Enter your camera's stream URL below. Use apps like
                    <strong style={{ color: '#f97316' }}> DroidCam</strong>,
                    <strong style={{ color: '#f97316' }}> IP Webcam</strong>, or
                    <strong style={{ color: '#f97316' }}> Iriun Webcam</strong> on
                    your phone to get a stream URL.
                  </p>
                </div>
              )}

              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}</style>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {mode === 'webcam' ? (
              /* Webcam controls */
              !isStreaming ? (
                <button
                  className="btn-primary"
                  onClick={startWebcam}
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  <Play size={18} />
                  Start Detection
                </button>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={stopStream}
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  <Square size={18} />
                  Stop Detection
                </button>
              )
            ) : (
              /* IP Camera controls */
              !isIpStreamActive ? (
                <>
                  <input
                    type="text"
                    value={streamUrl}
                    onChange={e => setStreamUrl(e.target.value)}
                    placeholder="http://192.168.1.5:4747/video"
                    style={{
                      padding: '10px 16px',
                      fontSize: '14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      width: '320px',
                      outline: 'none',
                    }}
                    onKeyDown={e => e.key === 'Enter' && startIpStream()}
                  />
                  <button
                    className="btn-primary"
                    onClick={startIpStream}
                    style={{ padding: '10px 24px', fontSize: '14px' }}
                  >
                    <Wifi size={16} />
                    Connect
                  </button>
                </>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={stopStream}
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  <WifiOff size={18} />
                  Disconnect
                </button>
              )
            )}
          </div>
        </div>

        {/* RIGHT — Detection List + Stats */}
        <DetectionList
          detections={detections}
          fps={fps}
          frameCount={frameCount}
          activeObjects={activeObjects}
          totalUnique={totalUnique}
        />
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Camera size={18} color="var(--color-primary)" />
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
            }}>
              {mode === 'webcam' ? 'Webcam Detection' : 'IP Camera / Phone Detection'}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
            }}>
              {mode === 'webcam'
                ? 'Your webcam feed is captured every 500ms and sent to the YOLO AI model. Each object gets a persistent tracking ID that follows it across frames.'
                : 'Enter the stream URL from your phone camera app (DroidCam, IP Webcam, Iriun Webcam). The AI processes the stream directly on the server with real-time tracking.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}