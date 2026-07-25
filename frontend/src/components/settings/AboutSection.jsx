import { GitBranch, ExternalLink, Code2, Database, Cpu, Eye, FlaskConical, User } from 'lucide-react'

// ============================================
// ABOUT SECTION CARD
//
// NO BACKEND — static content only.
// Displays project metadata, tech stack pills,
// and GitHub link.
// ============================================

const TECH_STACK = [
  { label: 'React', color: '#61dafb', bg: '#e0f7fe' },
  { label: 'FastAPI', color: '#059669', bg: '#d1fae5' },
  { label: 'YOLOv8', color: '#f97316', bg: '#ffedd5' },
  { label: 'MongoDB Atlas', color: '#22c55e', bg: '#dcfce7' },
  { label: 'OpenCV', color: '#3b82f6', bg: '#dbeafe' },
  { label: 'Python 3.13', color: '#8b5cf6', bg: '#ede9fe' },
]

export default function AboutSection() {
  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* ---- Hero banner ---- */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        borderRadius: 'var(--radius-md)',
        padding: '28px 24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orange glow */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* App icon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
          }}>
            <Eye size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              VisionInsight
            </h2>
            <span style={{
              fontSize: '12px', color: '#94a3b8', fontWeight: '500',
            }}>
              v1.0.0 · AI-Powered Multi-Object Detection Platform
            </span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, margin: 0, maxWidth: '520px' }}>
          Real-time and batch multi-object detection powered by YOLO11.
          Upload videos, watch live webcam detection, or connect IP cameras —
          all analytics stored in MongoDB Atlas.
        </p>
      </div>

      {/* ---- Tech stack pills ---- */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={14} />
          Tech Stack
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TECH_STACK.map(({ label, color, bg }) => (
            <span key={label} style={{
              padding: '5px 14px',
              borderRadius: '999px',
              background: bg,
              color: color,
              fontSize: '12px',
              fontWeight: '700',
              border: `1px solid ${color}33`,
              transition: 'transform var(--transition-slow)',
              cursor: 'default',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ---- Author info ---- */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <User size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Divyanshu
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            B.Sc Data Science · Portfolio Project
          </div>
        </div>

        {/* GitHub button */}
        <a
          id="link-github"
          href="https://github.com/Div0616/VisionInsight"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ marginLeft: 'auto', textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}
        >
          <GitBranch size={15} />
          GitHub
          <ExternalLink size={12} style={{ opacity: 0.6 }} />
        </a>
      </div>

      {/* ---- Feature highlights ---- */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px',
      }}>
        {[
          { icon: Eye,         label: 'Live Detection',    sub: 'Webcam + IP camera' },
          { icon: Cpu,         label: 'YOLO11 Engine',     sub: 'Nano to Medium' },
          { icon: Database,    label: 'MongoDB Atlas',     sub: 'Cloud analytics' },
          { icon: FlaskConical, label: 'FastAPI Backend',  sub: 'Async REST API' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <Icon size={16} color="var(--color-primary)" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
