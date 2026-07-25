import { useNavigate } from 'react-router-dom'

// ============================================
// HERO SECTION
// Split layout — text left, mock dashboard right
// Mock dashboard shows fake data to preview the app
// "Start analyzing" → navigates to /upload
// "View dashboard" → navigates to /
// NO backend connection — all mock data
// ============================================

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section style={{
      background: '#fff',
      padding: '80px 48px',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center',
      }}>

        {/* LEFT — Text content */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fff7ed',
            border: '0.5px solid #fed7aa',
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            color: '#c2410c',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#f97316',
            }} />
            Powered by YOLOv8 AI
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#0f172a',
            lineHeight: '1.15',
            marginBottom: '20px',
            letterSpacing: '-1px',
          }}>
            Detect. Track.<br />
            <span style={{ color: '#f97316' }}>Analyze.</span><br />
            Every frame.
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#475569',
            lineHeight: '1.75',
            marginBottom: '32px',
            maxWidth: '440px',
          }}>
            Upload any video or connect a live camera feed.
            VisionInsight uses state-of-the-art AI to detect
            80+ object classes in real time — delivering a
            full analytics dashboard instantly.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '40px',
          }}>
            <button
              onClick={() => navigate('/upload')}
              style={{
                background: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '13px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ea6c0a'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f97316'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Start analyzing →
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#fff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                padding: '13px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#f97316'
                e.currentTarget.style.color = '#f97316'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.color = '#0f172a'
              }}
            >
              View dashboard
            </button>
          </div>

          {/* Feature Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              '80+ object classes',
              'Real-time detection',
              'Live webcam feed',
              'Analytics dashboard',
            ].map(pill => (
              <span key={pill} style={{
                background: '#f8fafc',
                border: '0.5px solid #e2e8f0',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500',
              }}>
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT — Mock Dashboard Preview */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}>
          {/* Window chrome */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '0.5px solid #f1f5f9',
          }}>
            {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
              <div key={c} style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: c,
              }} />
            ))}
            <span style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginLeft: '6px',
            }}>
              VisionInsight — Analysis complete
            </span>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}>
            {[
              { val: '1,248', label: 'Objects detected', color: '#f97316' },
              { val: '450', label: 'Frames processed', color: '#0f172a' },
              { val: '30.0', label: 'Video FPS', color: '#0f172a' },
              { val: '3', label: 'Unique classes', color: '#22c55e' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#f8fafc',
                border: '0.5px solid #f1f5f9',
                borderRadius: '10px',
                padding: '12px 14px',
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: stat.color,
                }}>
                  {stat.val}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginTop: '2px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Class distribution bars */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Class distribution
            </div>
            {[
              { label: 'Person', pct: 75, count: '936', color: '#f97316' },
              { label: 'Car', pct: 22, count: '274', color: '#3b82f6' },
              { label: 'Phone', pct: 3, count: '38', color: '#8b5cf6' },
            ].map(bar => (
              <div key={bar.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#475569',
                  width: '44px',
                  fontWeight: '500',
                }}>
                  {bar.label}
                </span>
                <div style={{
                  flex: 1,
                  height: '6px',
                  background: '#f1f5f9',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${bar.pct}%`,
                    height: '100%',
                    background: bar.color,
                    borderRadius: '999px',
                  }} />
                </div>
                <span style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  width: '30px',
                  textAlign: 'right',
                }}>
                  {bar.count}
                </span>
              </div>
            ))}
          </div>

          {/* Mock video with bounding boxes */}
          <div style={{
            background: '#3e5769',
            borderRadius: '10px',
            height: '100px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Bounding boxes */}
            <div style={{
              position: 'absolute',
              left: '20px', top: '16px',
              width: '48px', height: '60px',
              border: '2px solid #f97316',
              borderRadius: '2px',
            }}>
              <span style={{
                position: 'absolute',
                top: '-1px', left: '-1px',
                background: '#f97316',
                color: '#fff',
                fontSize: '9px',
                padding: '1px 4px',
                fontWeight: '600',
              }}>
                person 94%
              </span>
            </div>
            <div style={{
              position: 'absolute',
              left: '90px', top: '28px',
              width: '70px', height: '44px',
              border: '2px solid #3b82f6',
              borderRadius: '2px',
            }}>
              <span style={{
                position: 'absolute',
                top: '-1px', left: '-1px',
                background: '#3b82f6',
                color: '#fff',
                fontSize: '9px',
                padding: '1px 4px',
                fontWeight: '600',
              }}>
                car 88%
              </span>
            </div>
            <div style={{
              position: 'absolute',
              right: '24px', top: '20px',
              width: '42px', height: '52px',
              border: '2px solid #8b5cf6',
              borderRadius: '2px',
            }}>
              <span style={{
                position: 'absolute',
                top: '-1px', left: '-1px',
                background: '#8b5cf6',
                color: '#fff',
                fontSize: '9px',
                padding: '1px 4px',
                fontWeight: '600',
              }}>
                person 91%
              </span>
            </div>
            {/* Live badge */}
            <div style={{
              position: 'absolute',
              bottom: '8px', right: '10px',
              background: 'rgba(239,68,68,0.9)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
            }}>
              ● PROCESSED
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
