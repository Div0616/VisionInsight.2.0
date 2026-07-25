import { useState, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'

// ============================================
// DETECTION COLOR THEME CARD
//
// NO BACKEND — persists to localStorage only.
// The chosen color is saved under key "vi_bbox_color"
// and can be read by the LivePage canvas drawing code.
//
// STATE:
//   selected — hex string of the active color
// ============================================

const THEMES = [
  {
    id: 'green',
    label: 'Default Green',
    color: '#22c55e',
    description: 'Classic detection look',
  },
  {
    id: 'orange',
    label: 'Orange',
    color: '#f97316',
    description: 'Matches app theme',
  },
  {
    id: 'blue',
    label: 'Blue',
    color: '#3b82f6',
    description: 'Professional look',
  },
  {
    id: 'purple',
    label: 'Purple',
    color: '#8b5cf6',
    description: 'Modern look',
  },
]

const STORAGE_KEY = 'vi_bbox_color'

export default function ColorTheme() {
  // Load persisted color or default to green
  const [selected, setSelected] = useState(
    () => localStorage.getItem(STORAGE_KEY) || '#22c55e'
  )
  const [saved, setSaved] = useState(false)

  // Persist whenever the user picks a new color
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selected)
    setSaved(true)
    const t = setTimeout(() => setSaved(false), 1500)
    return () => clearTimeout(t)
  }, [selected])

  const activeTheme = THEMES.find((t) => t.color === selected) || THEMES[0]

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* ---- Header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
          background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Palette size={20} color="#8b5cf6" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Bounding Box Color
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Color applied to detection overlays in Live view
          </p>
        </div>
        {/* Saved micro-toast */}
        {saved && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', fontWeight: '600', color: '#16a34a',
            animation: 'fadeIn 0.2s ease',
          }}>
            <Check size={13} />
            Saved
          </span>
        )}
      </div>

      {/* ---- Color swatches ---- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {THEMES.map((theme) => {
          const isActive = selected === theme.color
          return (
            <button
              key={theme.id}
              id={`color-theme-${theme.id}`}
              onClick={() => setSelected(theme.color)}
              style={{
                padding: '14px 12px',
                borderRadius: 'var(--radius-md)',
                border: isActive
                  ? `2px solid ${theme.color}`
                  : '1px solid var(--color-border)',
                background: isActive ? `${theme.color}18` : 'var(--color-surface)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--transition-slow)',
                position: 'relative',
              }}
            >
              {/* Checkmark overlay when active */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: theme.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={11} color="#fff" strokeWidth={3} />
                </div>
              )}

              {/* Color circle */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: theme.color,
                margin: '0 auto 10px',
                boxShadow: isActive ? `0 0 0 4px ${theme.color}33` : 'none',
                transition: 'box-shadow var(--transition-slow)',
              }} />

              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {theme.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {theme.description}
              </div>
            </button>
          )
        })}
      </div>

      {/* ---- Bounding box preview ---- */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          Preview
        </p>
        <div style={{
          background: '#1e293b',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Simulated video frame */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Fake bounding box */}
            <div style={{
              width: '120px', height: '70px',
              border: `2.5px solid ${selected}`,
              borderRadius: '4px',
              position: 'relative',
              transition: 'border-color var(--transition-slow)',
            }}>
              {/* Label bar */}
              <div style={{
                position: 'absolute', top: '-22px', left: '-1px',
                background: selected,
                padding: '2px 8px',
                borderRadius: '3px 3px 0 0',
                fontSize: '11px', fontWeight: '700', color: '#fff',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                transition: 'background var(--transition-slow)',
              }}>
                person 94%
              </div>
            </div>
          </div>

          {/* Corner grid dots for "video frame" aesthetic */}
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i % 3) * 33 + 5}%`,
              top: `${Math.floor(i / 3) * 40 + 10}%`,
              width: '2px', height: '2px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }} />
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'center' }}>
          Simulated bounding box — actual rendering depends on Live Detection canvas
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
