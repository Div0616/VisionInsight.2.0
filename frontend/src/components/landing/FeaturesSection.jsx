import { Upload, Video, BarChart3 } from 'lucide-react'

// ============================================
// FEATURES SECTION
// 3 feature cards explaining what app does
// NO backend connection — static content
// ============================================

const FEATURES = [
  {
    icon: Upload,
    color: '#f97316',
    bg: '#fff7ed',
    title: 'Video upload and analysis',
    desc: 'Upload MP4, AVI, MOV and more. YOLOv8 processes every frame and saves an annotated output video with bounding boxes drawn around each detected object.',
  },
  {
    icon: Video,
    color: '#8b5cf6',
    bg: '#ede9fe',
    title: 'Live webcam detection',
    desc: 'Connect your webcam for real-time object detection. Colored bounding boxes and labels appear live on screen as the AI identifies objects frame by frame.',
  },
  {
    icon: BarChart3,
    color: '#3b82f6',
    bg: '#dbeafe',
    title: 'Analytics dashboard',
    desc: 'Visualize detections with interactive charts showing object class distribution, detections per video, processing stats, and complete session history.',
  },
]

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        background: '#f8fafc',
        padding: '80px 48px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block',
            background: '#fff7ed',
            border: '0.5px solid #fed7aa',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            color: '#c2410c',
            fontWeight: '600',
            marginBottom: '14px',
          }}>
            Features
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}>
            Everything you need for video analytics
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#475569',
            maxWidth: '480px',
          }}>
            From upload to insights in minutes — no setup required.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                style={{
                  background: '#fff',
                  border: '0.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '28px',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'
                  e.currentTarget.style.borderColor = '#f97316'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: f.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  <Icon size={22} color={f.color} />
                </div>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '10px',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: '1.7',
                }}>
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}