import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { healthAPI } from '../../services/api'

const PAGE_TITLES = {
  '/': 'VisionInsight',
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Video',
  '/live': 'Live Feed',
  '/analytics': 'Analytics',
  '/history': 'History',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'VisionInsight'

  // ============================================
  // API STATUS STATE
  // Tracks whether backend is reachable
  // ============================================
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    // ============================================
    // BACKEND CONNECTION: GET /health
    // TRIGGERED BY: TopBar mounting on app load
    // CALLS: healthAPI.check() in services/api.js
    // PURPOSE: Show green/red indicator in topbar
    // ============================================
    const checkAPI = async () => {
      try {
        await healthAPI.check()
        setApiStatus('connected')
      } catch {
        setApiStatus('disconnected')
      }
    }

    checkAPI()
    // Recheck every 30 seconds
    const interval = setInterval(checkAPI, 30000)
    return () => clearInterval(interval)
  }, [])

  const statusConfig = {
    connected: { color: '#22c55e', label: 'API Connected' },
    disconnected: { color: '#ef4444', label: 'API Offline' },
    checking: { color: '#f59e0b', label: 'Connecting...' },
  }

  const status = statusConfig[apiStatus]

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div>
        <h1 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.3px',
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          marginTop: '1px',
        }}>
          Visual Insight for Object Detection and Tracking
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* 
          API STATUS INDICATOR
          Green = backend running, Red = backend down
          Updates every 30 seconds via healthAPI.check()
        */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'var(--color-surface-2)',
          borderRadius: '999px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: status.color,
            boxShadow: `0 0 6px ${status.color}`,
          }} />
          {status.label}
        </div>

        <button style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Bell size={16} color="var(--color-text-secondary)" />
        </button>
      </div>
    </header>
  )
}