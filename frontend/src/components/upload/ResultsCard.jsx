import { videoAPI } from '../../services/api'
import {
  Film,
  Eye,
  Clock,
  Layers,
  TrendingUp,
  CheckCircle,
  Play,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

// ============================================
// VIDEO PLAYER
// BACKEND CONNECTION: GET /api/video/{session_id}
// TRIGGERED BY: "Watch Detection Video" button
// Browser fetches video directly from FastAPI
// ============================================
function VideoPlayer({ sessionId, cloudinaryUrl }) {
  const [showVideo, setShowVideo] = useState(false)

  // Use Cloudinary URL directly if available
  // Otherwise fall back to backend endpoint
  const videoUrl = `http://localhost:8000/api/video/${sessionId}`

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: showVideo ? '16px' : '0',
      }}>
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
          }}>
            Detection Video
          </h4>
          <p style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            marginTop: '2px',
          }}>
            Watch AI detecting objects with bounding boxes
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowVideo(!showVideo)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {showVideo
            ? <><X size={15} /> Hide Video</>
            : <><Play size={15} /> Watch Detection Video</>
          }
        </button>
      </div>

      {showVideo && (
        <div style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: '#000',
          marginTop: '12px',
        }}>
          <video
            src={videoUrl}
            controls
            autoPlay
            style={{
              width: '100%',
              maxHeight: '480px',
              display: 'block',
            }}
          />
        </div>
      )}
    </div>
  )
}
// ============================================
// RESULTS CARD
// DATA SOURCE: GET /api/results/{session_id}
// Receives full results object as props
// ============================================
export default function ResultsCard({ results }) {
  // session_id is critical — needed for video player
  const { analytics, filename, session_id } = results

  const formatTime = (seconds) => {
    if (!seconds) return '0s'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const stats = [
    {
      label: 'Total Frames',
      value: analytics?.total_frames?.toLocaleString() || '0',
      icon: Film,
      color: '#3b82f6',
      bg: '#dbeafe',
    },
    {
      label: 'Objects Detected',
      value: analytics?.total_detections?.toLocaleString() || '0',
      icon: Eye,
      color: 'var(--color-primary)',
      bg: '#ffedd5',
    },
    {
      label: 'Processing Time',
      value: formatTime(analytics?.processing_time_seconds),
      icon: Clock,
      color: '#8b5cf6',
      bg: '#ede9fe',
    },
    {
      label: 'Unique Classes',
      value: analytics?.unique_classes?.length || '0',
      icon: Layers,
      color: '#22c55e',
      bg: '#dcfce7',
    },
    {
      label: 'Video FPS',
      value: analytics?.fps || '0',
      icon: TrendingUp,
      color: '#f59e0b',
      bg: '#fef9c3',
    },
    {
      label: 'Resolution',
      value: analytics?.resolution || 'N/A',
      icon: CheckCircle,
      color: '#06b6d4',
      bg: '#cffafe',
    },
  ]

  return (
    <div style={{ marginTop: '24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CheckCircle size={18} color="#16a34a" />
        </div>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
          }}>
            Analysis Complete
          </h3>
          <p style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}>
            {filename}
          </p>
        </div>
      </div>

      {/* 
        VIDEO PLAYER
        Only renders if session_id exists
        session_id comes from GET /api/results response
      */}
      {session_id
? <VideoPlayer sessionId={session_id} cloudinaryUrl={analytics?.output_video} />
        : (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            borderRadius: 'var(--radius-md)',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            session_id missing — video player unavailable
          </div>
        )
      }

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="card"
              style={{ padding: '16px', textAlign: 'center' }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
              }}>
                <Icon size={20} color={stat.color} />
              </div>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
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
          )
        })}
      </div>

      {/* Class Distribution */}
      {analytics?.class_distribution &&
        Object.keys(analytics.class_distribution).length > 0 && (
          <div className="card">
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              marginBottom: '16px',
            }}>
              Detected Object Classes
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {Object.entries(analytics.class_distribution)
                .sort(([, a], [, b]) => b - a)
                .map(([className, count]) => {
                  const percentage = Math.round(
                    (count / analytics.total_detections) * 100
                  )
                  return (
                    <div key={className}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: 'var(--color-text-primary)',
                          textTransform: 'capitalize',
                        }}>
                          {className}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: 'var(--color-text-secondary)',
                        }}>
                          {count.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: 'var(--color-border)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'var(--color-primary)',
                          borderRadius: '999px',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
    </div>
  )
}