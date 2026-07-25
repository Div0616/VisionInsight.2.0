import { useState } from 'react'
import { Cpu, Save, CheckCircle, AlertCircle, Loader, Zap, Target, AlertTriangle } from 'lucide-react'
import { videoAPI } from '../../services/api'

// ============================================
// MODEL SELECTOR CARD
//
// BACKEND CONNECTION:
//   videoAPI.updateModel(modelName) → POST /api/settings/model
//   TRIGGERED BY: Save button click
//   RETURNS: { success, model_name, message }
//
// STATE:
//   selectedModel — the model the user has clicked (not yet saved)
//   saving        — true while API call is in flight
//   toast         — { type: 'success'|'error', text } shown after save
// ============================================

// Model metadata — displayed as clickable cards
const MODELS = [
  {
    id: 'yolo11n.pt',
    label: 'Nano',
    tagline: 'Fastest, Good accuracy',
    speed: 5,       // out of 5 bars
    accuracy: 3,
    size: '5.4 MB',
    badge: 'Default',
    badgeClass: 'badge-info',
  },
  {
    id: 'yolo11s.pt',
    label: 'Small',
    tagline: 'Fast, Better accuracy',
    speed: 4,
    accuracy: 4,
    size: '~19 MB',
    badge: 'Balanced',
    badgeClass: 'badge-success',
  },
  {
    id: 'yolo11m.pt',
    label: 'Medium',
    tagline: 'Balanced, Very good accuracy',
    speed: 3,
    accuracy: 5,
    size: '~49 MB',
    badge: 'Accurate',
    badgeClass: 'badge-warning',
  },
]

/** Renders N filled dots out of 5 as a speed/accuracy indicator. */
function DotMeter({ value, color }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i < value ? color : 'var(--color-border-strong)',
            transition: 'background var(--transition-slow)',
          }}
        />
      ))}
    </div>
  )
}

export default function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState('yolo11n.pt')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)   // { type, text }

  /**
   * handleSave — calls POST /api/settings/model
   * Hot-swaps the YOLO model on the running FastAPI server.
   * The backend will download weights if not already cached.
   */
  const handleSave = async () => {
    setSaving(true)
    setToast(null)
    try {
      // FRONTEND → BACKEND
      // Via videoAPI.updateModel() in services/api.js
      // Calls POST /api/settings/model with { model_name: selectedModel }
      const res = await videoAPI.updateModel(selectedModel)
      setToast({ type: 'success', text: res.message })
    } catch (err) {
      const msg =
        err?.response?.data?.detail || 'Failed to switch model. Is the backend running?'
      setToast({ type: 'error', text: msg })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* ---- Header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
          background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Cpu size={20} color="#8b5cf6" />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            YOLO Model
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Select the detection model — affects speed vs. accuracy
          </p>
        </div>
      </div>

      {/* ---- Model cards grid ---- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {MODELS.map((model) => {
          const isActive = selectedModel === model.id
          return (
            <button
              key={model.id}
              id={`model-card-${model.id}`}
              onClick={() => setSelectedModel(model.id)}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: isActive
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                background: isActive ? '#fff7ed' : 'var(--color-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-slow)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                boxShadow: isActive ? '0 4px 16px rgba(249,115,22,0.18)' : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: 'var(--color-primary)',
                  boxShadow: '0 0 0 3px rgba(249,115,22,0.2)',
                }} />
              )}

              {/* Badge */}
              <span className={`badge ${model.badgeClass}`} style={{ marginBottom: '10px' }}>
                {model.badge}
              </span>

              {/* Model name */}
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {model.id}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                {model.label} · {model.size}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                {model.tagline}
              </div>

              {/* Speed meter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Zap size={11} color="#f97316" />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', width: '50px' }}>Speed</span>
                <DotMeter value={model.speed} color="#f97316" />
              </div>

              {/* Accuracy meter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={11} color="#8b5cf6" />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', width: '50px' }}>Accuracy</span>
                <DotMeter value={model.accuracy} color="#8b5cf6" />
              </div>
            </button>
          )
        })}
      </div>

      {/* ---- Warning notice ---- */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '12px 14px', borderRadius: 'var(--radius-md)',
        background: '#fef9c3', border: '1px solid #fde047',
        marginBottom: '20px',
      }}>
        <AlertTriangle size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
          Changing the model will download it on first use if not cached locally.
          The first inference after switching may take a few extra seconds.
        </p>
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
        id="btn-save-model"
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        {saving
          ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
          : <Save size={15} />}
        {saving ? 'Switching Model…' : `Apply ${selectedModel}`}
      </button>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
