import { useNavigate } from 'react-router-dom'

// ============================================
// CTA SECTION
// Orange call-to-action banner
// "Start analyzing" → navigates to /upload
// NO backend connection
// ============================================

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section style={{
      background: '#fff7ed',
      borderTop: '0.5px solid #fed7aa',
      borderBottom: '0.5px solid #fed7aa',
      padding: '64px 48px',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '10px',
        letterSpacing: '-0.5px',
      }}>
        Ready to analyze your video?
      </h2>
      <p style={{
        fontSize: '15px',
        color: '#92400e',
        marginBottom: '28px',
      }}>
        Upload a video and get full AI-powered detection results in minutes.
      </p>
      <button
        onClick={() => navigate('/upload')}
        style={{
          background: '#f97316',
          color: '#fff',
          border: 'none',
          padding: '14px 36px',
          borderRadius: '12px',
          fontSize: '16px',
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
        Start analyzing for free →
      </button>
    </section>
  )
}