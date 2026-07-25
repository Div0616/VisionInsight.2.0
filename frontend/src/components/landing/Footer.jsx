import { useNavigate } from 'react-router-dom'

// ============================================
// FOOTER
// Dark footer with logo, links and credit
// NO backend connection — static content
// ============================================

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer style={{
      background: '#3e5769',
      padding: '40px 48px 24px',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
      }}>

        {/* Top row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="32" height="32" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#f97316" strokeWidth="2"/>
              <circle cx="18" cy="18" r="5" fill="#f97316"/>
              <line x1="2" y1="18" x2="9" y2="18" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2,2"/>
              <line x1="27" y1="18" x2="34" y2="18" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2,2"/>
            </svg>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#f97316',
              }}>
                VisionInsight
              </div>
              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                marginTop: '2px',
              }}>
                AI-Powered Video Analytics
              </div>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '28px' }}>
            {[
              { label: 'Dashboard', action: () => navigate('/dashboard') },
              { label: 'Upload', action: () => navigate('/upload') },
              { label: 'Live Feed', action: () => navigate('/live') },
              { label: 'History', action: () => navigate('/history') },
            ].map(link => (
              <span
                key={link.label}
                onClick={link.action}
                style={{
                  fontSize: '13px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.target.style.color = '#f97316'}
                onMouseLeave={e => e.target.style.color = '#cbd5e1'}
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '0.5px',
          background: '#475569',
          marginBottom: '20px',
        }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
          }}>
            Built with React, FastAPI, YOLOv8 and MongoDB Atlas
          </p>
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
          }}>
            VisionInsight v1.0.0 · B.Sc Data Science Project
          </p>
        </div>
      </div>
    </footer>
  )
}