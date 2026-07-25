import { useState } from 'react'
import { SlidersHorizontal, Save, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { videoAPI } from '../../services/api'

// ============================================
// DETECTION SETTINGS CARD
//
// BACKEND CONNECTION:
//   videoAPI.updateConfidence(value) → POST /api/settings/confidence
//   TRIGGERED BY: Save button click
//   RETURNS: { success, confidence, message }
//
// STATE:
//   confidence — current slider value (0.1–0.9)
//   saving     — true while API call is in flight
//   toast      — { type: 'success'|'error', text } shown after save
// ============================================

/**
 * Returns label and colour info based on the slider value.
 * Below 0.3  → Low  (more detections, some false positives)
 * 0.3–0.6    → Balanced (recommended)
 * Above 0.6  → High (fewer but very accurate)
 */
function getConfidenceLevel(value) {
  if (value < 0.3) {
    return {
      label: 'Low',
      sub: 'More detections, some false positives',
      color: '#ef4444',
      bg: '#fee2e2',
    }
  }
  if (value <= 0.6) {
    return {
      label: 'Balanced',
      sub: 'Recommended — good precision / recall',
      color: '#f97316',
      bg: '#ffedd5',
    }
  }
  return {
    label: 'High',
    sub: 'Fewer but very accurate detections',
    color: '#22c55e',
    bg: '#dcfce7',
  }
}

export default function DetectionSettings() {
  const [confidence, setConfidence] = useState(0.25)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)   // { type, text }

  const level = getConfidenceLevel(confidence)

  /**
   * handleSave — calls POST /api/settings/confidence
   * Shows a brief success or error toast then clears it after 3.5 s.
   */
  const handleSave = async () => {
    setSaving(true)
    setToast(null)
    try {
      // FRONTEND → BACKEND
      // Via videoAPI.updateConfidence() in services/api.js
      // Calls POST /api/settings/confidence with { confidence }
      const res = await videoAPI.updateConfidence(confidence)
      setToast({ type: 'success', text: res.message })
    } catch (err) {
      const msg =
        err?.response?.data?.detail || 'Failed to save confidence. Is the backend running?'
      setToast({ type: 'error', text: msg })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3500)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* ---- Header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
          background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SlidersHorizontal size={20} color="var(--color-primary)" />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Detection Settings
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Confidence threshold for YOLO object detection
          </p>
        </div>
      </div>

      {/* ---- Slider row ---- */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
            Confidence Threshold
          </label>
          {/* Live percentage badge */}
          <span style={{
            padding: '3px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: '700',
            background: level.bg, color: level.color, transition: 'all var(--transition-slow)',
          }}>
            {Math.round(confidence * 100)}%
          </span>
        </div>

        {/* HTML range slider */}
        <input
          id="confidence-slider"
          type="range"
          min={0.1}
          max={0.9}
          step={0.05}
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--color-primary)',
            height: '6px',
            cursor: 'pointer',
          }}
        />

        {/* Tick labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>10%</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>50%</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>90%</span>
        </div>
      </div>

      {/* ---- Level indicator pill ---- */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: level.bg,
        border: `1px solid ${level.color}33`,
        marginBottom: '20px',
        transition: 'background var(--transition-slow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: level.color }} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: level.color }}>
            {level.label}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            — {level.sub}
          </span>
        </div>
      </div>

      {/* ---- Toast message ---- */}
      {toast && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px',
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#16a34a' : '#dc2626',
          fontSize: '13px', fontWeight: '600',
          animation: 'fadeIn 0.25s ease',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />}
          {toast.text}
        </div>
      )}

      {/* ---- Save button ---- */}
      <button
        id="btn-save-confidence"
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        {saving
          ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
          : <Save size={15} />}
        {saving ? 'Saving…' : 'Save Threshold'}
      </button>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
