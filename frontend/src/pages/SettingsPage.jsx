// ============================================
// SETTINGS PAGE
//
// This is the ONLY page file we modify (per project rules).
// It composes 5 section cards + 1 about card, all isolated
// inside frontend/src/components/settings/.
//
// BACKEND CONNECTIONS (via components):
//   DetectionSettings  → POST /api/settings/confidence
//   ModelSelector      → POST /api/settings/model
//   ClearFailedSessions → GET  /api/sessions + DELETE /api/sessions/failed
//
// NO BACKEND (localStorage / static):
//   ColorTheme         → localStorage("vi_bbox_color")
//   FileUploadInfo     → read-only static display
//   AboutSection       → static content + GitHub link
// ============================================

import DetectionSettings    from '../components/settings/DetectionSettings'
import ModelSelector        from '../components/settings/ModelSelector'
import FileUploadInfo       from '../components/settings/FileUploadInfo'
import ClearFailedSessions  from '../components/settings/ClearFailedSessions'
import ColorTheme           from '../components/settings/ColorTheme'
import AboutSection         from '../components/settings/AboutSection'
import { Settings }         from 'lucide-react'

export default function SettingsPage() {
  return (
    <div
      id="settings-page"
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 0 48px',
      }}
    >
      {/* ============================================
          PAGE HEADER
          ============================================ */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(249,115,22,0.25)',
          }}>
            <Settings size={18} color="#fff" />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: 'var(--color-text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Settings
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
          Configure detection, models, and manage your sessions
        </p>
        {/* Separator */}
        <div style={{
          height: '1px',
          background: 'var(--color-border)',
          marginTop: '20px',
        }} />
      </div>

      {/* ============================================
          SECTION 1 — DETECTION SETTINGS
          Confidence threshold slider → POST /api/settings/confidence
          ============================================ */}
      <SectionLabel number="01" title="Detection" />
      <DetectionSettings />

      {/* ============================================
          SECTION 2 — MODEL SELECTOR
          Clickable model cards → POST /api/settings/model
          ============================================ */}
      <SectionLabel number="02" title="YOLO Model" />
      <ModelSelector />

      {/* ============================================
          SECTION 3 — FILE UPLOAD INFO
          Read-only — no backend call
          ============================================ */}
      <SectionLabel number="03" title="Upload Limits" />
      <FileUploadInfo />

      {/* ============================================
          SECTION 4 — CLEAR FAILED SESSIONS
          DELETE /api/sessions/failed
          ============================================ */}
      <SectionLabel number="04" title="Maintenance" />
      <ClearFailedSessions />

      {/* ============================================
          SECTION 5 — BOUNDING BOX COLOR THEME
          Saves to localStorage("vi_bbox_color")
          ============================================ */}
      <SectionLabel number="05" title="Appearance" />
      <ColorTheme />

      {/* ============================================
          SECTION 6 — ABOUT
          Static content + GitHub link
          ============================================ */}
      <SectionLabel number="06" title="About" />
      <AboutSection />
    </div>
  )
}

// ---- Helper: numbered section label above each card ----
function SectionLabel({ number, title }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px',
      marginTop: '4px',
    }}>
      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--color-text-muted)',
        letterSpacing: '0.08em',
        fontFamily: 'monospace',
      }}>
        {number}
      </span>
      <div style={{ height: '1px', width: '18px', background: 'var(--color-border-strong)' }} />
      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        {title}
      </span>
    </div>
  )
}