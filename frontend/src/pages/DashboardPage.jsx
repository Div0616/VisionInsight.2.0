import { useState, useEffect } from 'react'
import { videoAPI } from '../services/api'
import StatsCard from '../components/dashboard/StatsCard'
import DonutChart from '../components/dashboard/DonutChart'
import SessionsChart from '../components/dashboard/SessionsChart'
import RecentSessions from '../components/dashboard/RecentSessions'
import {
  Film,
  Eye,
  Clock,
  Star,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

// ============================================
// DASHBOARD PAGE
//
// BACKEND CONNECTIONS:
// 1. videoAPI.getDashboardStats() → GET /api/dashboard
//    TRIGGERED BY: Component mounting (useEffect)
//    RETURNS: stats, charts data, recent sessions
//
// FLOW:
// Page loads → fetchData() → GET /api/dashboard
//   → setState with response → render charts + stats
// ============================================

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ============================================
  // fetchData — main data loader
  // BACKEND CONNECTION: GET /api/dashboard
  // TRIGGERED BY: useEffect on mount + refresh button
  // ============================================
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // FRONTEND → BACKEND
      // Calls: GET http://localhost:8000/api/dashboard
      // Via: videoAPI.getDashboardStats() in services/api.js
      const response = await videoAPI.getDashboardStats()
      setData(response)

    } catch (err) {
      setError('Failed to load dashboard data. Is the backend running?')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when page loads
  useEffect(() => {
    fetchData()
  }, [])

  // Stats cards configuration
  // Each card maps to one field from /api/dashboard response
  const statsCards = data ? [
    {
      label: 'Total Videos',
      value: data.total_videos || 0,
      icon: Film,
      color: '#3b82f6',
      bg: '#dbeafe',
      subtitle: `${data.completed_videos || 0} completed`,
    },
    {
      label: 'Unique Objects',
      value: (data.total_unique_objects || data.total_detections || 0).toLocaleString(),
      icon: Eye,
      color: 'var(--color-primary)',
      bg: '#ffedd5',
      subtitle: `${(data.total_detections || 0).toLocaleString()} detection events`,
    },
    {
      label: 'Processing Time',
      value: `${Math.round(data.total_processing_time || 0)}s`,
      icon: Clock,
      color: '#8b5cf6',
      bg: '#ede9fe',
      subtitle: 'Total AI compute time',
    },
    {
      label: 'Top Class',
      value: data.most_detected_class || 'N/A',
      icon: Star,
      color: '#f59e0b',
      bg: '#fef9c3',
      subtitle: 'Most detected object',
    },
  ] : []

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-border)',
          borderTop: '3px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading dashboard...
        </p>
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        gap: '16px',
      }}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
          {error}
        </p>
        <button className="btn-primary" onClick={fetchData}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            Welcome back 👋
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
          }}>
            Here's your AI video analytics overview
          </p>
        </div>

        {/* Refresh Button */}
        <button
          className="btn-secondary"
          onClick={fetchData}
          style={{ padding: '8px 16px' }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {statsCards.map((card) => (
          <StatsCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/*
          DONUT CHART
          DATA: data.class_distribution from GET /api/dashboard
          Shows: Which object classes are most detected
        */}
        <DonutChart classDistribution={data?.class_distribution} />

        {/*
          BAR CHART
          DATA: data.all_sessions from GET /api/dashboard
          Shows: How many objects detected per video
        */}
        <SessionsChart sessions={data?.all_sessions} />
      </div>

      {/* Recent Sessions Table */}
      {/*
        DATA: data.recent_sessions from GET /api/dashboard
        Shows: Last 5 uploaded videos with status
      */}
      <RecentSessions sessions={data?.recent_sessions} />

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}