import { useNavigate } from 'react-router-dom'

// ============================================
// NAVBAR COMPONENT
// Top navigation bar for landing page
// Has its own style — NOT using MainLayout
// "Launch App" button navigates to /upload
// NO backend connection
// ============================================

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '0.5px solid #e2e8f0',
      padding: '0 48px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="38" height="38" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="#f97316" strokeWidth="2"/>
          <circle cx="18" cy="18" r="9" fill="#f97316" opacity="0.15"/>
          <circle cx="18" cy="18" r="5" fill="#f97316"/>
          <line x1="2" y1="18" x2="9" y2="18" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2,2"/>
          <line x1="27" y1="18" x2="34" y2="18" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2,2"/>
          <path d="M10 8 L5 8 L5 13" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M26 8 L31 8 L31 13" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 28 L5 28 L5 23" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M26 28 L31 28 L31 23" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
            VisionInsight
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            AI Video Analytics
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {['Features', 'How it works', 'Tech stack'].map(link => (
          <a                             
            key={link}
            href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            style={{
              fontSize: '14px',
              color: '#475569',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => e.target.style.color = '#f97316'}
            onMouseLeave={e => e.target.style.color = '#475569'}
          >
            {link}
          </a>
        ))}


        {/* 
          LAUNCH APP BUTTON
          NAVIGATES TO: /upload page
          No backend call — just routing
        */}
        <button
          onClick={() => navigate('/upload')}
          style={{
            background: '#f97316',
            color: '#fff',
            border: 'none',
            padding: '9px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#ea6c0a'}
          onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
        >
          Launch app →
        </button>
      </div>
    </nav>
  )
}