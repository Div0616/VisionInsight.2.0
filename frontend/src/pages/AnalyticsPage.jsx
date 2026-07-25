import { useState, useEffect, useCallback } from 'react'
import { videoAPI } from '../services/api'
import SummaryStats        from '../components/analytics/SummaryStats'
import TopClassesChart     from '../components/analytics/TopClassesChart'
import DetectionsPerVideo  from '../components/analytics/DetectionsPerVideo'
import StatusBreakdown     from '../components/analytics/StatusBreakdown'
import SessionTable        from '../components/analytics/SessionTable'
import { BarChart2, AlertCircle, RefreshCw, Loader } from 'lucide-react'

// ============================================
// ANALYTICS PAGE
//
// BACKEND CONNECTION:
//   videoAPI.getDashboardStats() → GET /api/dashboard
//   TRIGGERED BY: component mount + Refresh button
//   RETURNS: { total_videos, completed_videos, total_detections,
//              total_processing_time, most_detected_class,
//              class_distribution, recent_sessions, all_sessions }
//
// All child components are passed slices of this single response.
// No new backend endpoints or api.js functions are added.
//
// LAYOUT (top → bottom):
//   1. Page header + Refresh button
//   2. SummaryStats     — 4 KPI cards
//   3. TopClassesChart  — horizontal bar: top 8 classes
//   4. DetectionsPerVideo — vertical bar: detections per video
//   5. StatusBreakdown  — 4-cell status grid
//   6. SessionTable     — sortable completed-sessions table
// ============================================

export default function AnalyticsPage() {
  const [data, setData]       = useState(null)   // raw GET /api/dashboard response
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // ============================================
  // fetchData — main data loader
  // BACKEND: GET /api/dashboard via videoAPI.getDashboardStats()
  // TRIGGERED BY: useEffect on mount + Refresh button click
  // ============================================
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Single call — all Analytics sections derive data from this response
      const res = await videoAPI.getDashboardStats()
      setData(res)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError('Could not load analytics data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ============================================
  // Derived values computed once from raw data
  // so child components receive clean primitives
  // ============================================
  const allSessions       = data?.all_sessions   ?? []
  const classDistribution = data?.class_distribution ?? {}

  const completedSessions = allSessions.filter((s) => s.status === 'completed')

  // Average processing time across completed sessions (rounded to 1 dp)
  const avgProcessingTime = completedSessions.length > 0
    ? (
        completedSessions.reduce((sum, s) =>
          sum + (s.analytics?.processing_time_seconds ?? 0), 0
        ) / completedSessions.length
      ).toFixed(1)
    : 0

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', gap: '16px',
      }}>
        <Loader
          size={38}
          color="var(--color-primary)"
          style={{ animation: 'spin 0.9s linear infinite' }}
        />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading analytics…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', gap: '16px',
      }}>
        <AlertCircle size={42} color="#ef4444" />
        <p style={{ color: 'var(--color-text-primary)', fontWeight: '600', textAlign: 'center' }}>
          {error}
        </p>
        <button className="btn-primary" onClick={fetchData}>
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div id="analytics-page">

      {/* ---- Page Header ---- */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(249,115,22,0.25)',
          }}>
            <BarChart2 size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontSize: '22px', fontWeight: '800',
              color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em',
            }}>
              Analytics
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Aggregate insights across all processed videos
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          id="btn-refresh-analytics"
          className="btn-secondary"
          onClick={fetchData}
          style={{ padding: '8px 16px' }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '24px' }} />

      {/* ============================================
          SECTION 1 — SUMMARY STATS (4 KPI cards)
          DATA: top-level fields from /api/dashboard
          ============================================ */}
      <SummaryStats
        completedVideos={data?.completed_videos ?? 0}
        totalDetections={data?.total_detections ?? 0}
        avgProcessingTime={avgProcessingTime}
        mostDetectedClass={data?.most_detected_class}
      />

      {/* ============================================
          SECTION 2 — TOP CLASSES CHART (horizontal bars)
          DATA: data.class_distribution from /api/dashboard
          ============================================ */}
      <div style={{ marginTop: '24px' }}>
        <TopClassesChart classDistribution={classDistribution} />
      </div>

      {/* ============================================
          SECTION 3 — DETECTIONS PER VIDEO (vertical bars)
          DATA: data.all_sessions from /api/dashboard
          ============================================ */}
      <div style={{ marginTop: '24px' }}>
        <DetectionsPerVideo sessions={allSessions} />
      </div>

      {/* ============================================
          SECTION 4 — STATUS BREAKDOWN (4-cell grid)
          DATA: data.all_sessions from /api/dashboard
          ============================================ */}
      <div style={{ marginTop: '24px' }}>
        <StatusBreakdown sessions={allSessions} />
      </div>

      {/* ============================================
          SECTION 5 — SESSION PERFORMANCE TABLE
          DATA: data.all_sessions from /api/dashboard
          ============================================ */}
      <div style={{ marginTop: '24px', paddingBottom: '48px' }}>
        <SessionTable sessions={allSessions} />
      </div>

    </div>
  )
}