// ============================================
// TECH STACK SECTION
// Shows all 8 technologies used in the project
// NO backend connection — static content
// Great for impressing professors and interviewers
// ============================================

const TECHS = [
  { name: 'React + Vite', role: 'Frontend UI', color: '#61dafb' },
  { name: 'FastAPI', role: 'Backend API', color: '#f97316' },
  { name: 'YOLOv8', role: 'AI detection', color: '#8b5cf6' },
  { name: 'MongoDB Atlas', role: 'Database', color: '#22c55e' },
  { name: 'OpenCV', role: 'Video processing', color: '#3b82f6' },
  { name: 'Tailwind CSS', role: 'Styling', color: '#f59e0b' },
  { name: 'Recharts', role: 'Data charts', color: '#ec4899' },
  { name: 'Python 3.13', role: 'Backend runtime', color: '#06b6d4' },
]

export default function TechStack() {
  return (
    <section
      id="tech-stack"
      style={{
        background: '#f8fafc',
        padding: '80px 48px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block',
            background: '#fff7ed',
            border: '0.5px solid #fed7aa',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            color: '#c2410c',
            fontWeight: '600',
            marginBottom: '14px',
          }}>
            Tech stack
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}>
            Built with modern technologies
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#475569',
          }}>
            A full-stack AI platform combining the best tools for performance and scalability.
          </p>
        </div>

        {/* Tech grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
        }}>
          {TECHS.map(tech => (
            <div
              key={tech.name}
              style={{
                background: '#fff',
                border: '0.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = tech.color
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: tech.color,
                flexShrink: 0,
              }} />
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0f172a',
                }}>
                  {tech.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginTop: '2px',
                }}>
                  {tech.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}