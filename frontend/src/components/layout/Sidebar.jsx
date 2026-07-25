import { NavLink } from 'react-router-dom'
import { 
  Home,
  LayoutDashboard, 
  Upload, 
  Video, 
  BarChart3, 
  History, 
  Settings,
  Eye
} from 'lucide-react'

// Navigation items — add new pages here
const NAV_ITEMS = [
  {
    path: '/', 
    icon: Home, 
    label: 'Home',
    description: 'About the app'
  },
  { 
    path: '/dashboard', 
    icon: LayoutDashboard, 
    label: 'Dashboard',
    description: 'Overview & stats'
  },
  { 
    path: '/upload', 
    icon: Upload, 
    label: 'Upload Video',
    description: 'Analyze a video file'
  },
  { 
    path: '/live', 
    icon: Video, 
    label: 'Live Feed',
    description: 'Real-time detection'
  },
  { 
    path: '/analytics', 
    icon: BarChart3, 
    label: 'Analytics',
    description: 'Charts & insights'
  },
  { 
    path: '/history', 
    icon: History, 
    label: 'History',
    description: 'Past sessions'
  },
  { 
    path: '/settings', 
    icon: Settings, 
    label: 'Settings',
    description: 'Configuration'
  },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--sidebar-bg)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      zIndex: 100,
      transition: 'width var(--transition-slow)',
    }}>

      {/* Logo Area */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* VI Logo Mark */}
        <div style={{
          width: '40px',
          height: '40px',
          background: 'var(--color-primary)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Eye size={20} color="white" strokeWidth={2.5} />
        </div>

        {/* Brand Text */}
        <div>
          <div style={{
            color: 'white',
            fontWeight: '700',
            fontSize: '16px',
            letterSpacing: '-0.3px',
          }}>
            VisionInsight
          </div>
          <div style={{
            color: 'var(--sidebar-text)',
            fontSize: '11px',
            opacity: 0.6,
          }}>
            AI Video Analytics
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '12px 0', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 20px',
                margin: '2px 8px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all var(--transition-slow)',
                background: isActive 
                  ? 'rgba(249, 115, 22, 0.15)' 
                  : 'transparent',
                borderLeft: isActive 
                  ? '3px solid var(--color-primary)' 
                  : '3px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={18} 
                    color={isActive 
                      ? 'var(--color-primary)' 
                      : 'var(--sidebar-text)'
                    }
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <div>
                    <div style={{
                      color: isActive ? 'white' : 'var(--sidebar-text)',
                      fontSize: '13px',
                      fontWeight: isActive ? '600' : '400',
                      transition: 'color var(--transition-slow)',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      color: 'var(--sidebar-text)',
                      fontSize: '11px',
                      opacity: 0.5,
                    }}>
                      {item.description}
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Version Tag */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: 'var(--sidebar-text)',
        fontSize: '11px',
        opacity: 0.4,
      }}>
        VisionInsight v1.0.0
      </div>
    </aside>
  )
}