// ============================================
// HOW IT WORKS SECTION
// 3 numbered steps explaining the flow
// NO backend connection — static content
// ============================================

const STEPS = [
  {
    num: '1',
    title: 'Upload your video',
    desc: 'Drag and drop any video file up to 200MB. VisionInsight accepts MP4, AVI, MOV, MKV, and WebM formats.',
  },
  {
    num: '2',
    title: 'AI processes every frame',
    desc: 'YOLOv8 runs detection on each frame in the background. A real-time progress bar shows exactly how far along processing is.',
  },
  {
    num: '3',
    title: 'Explore your results',
    desc: 'Watch the annotated output video with bounding boxes, explore charts showing what was detected, and review full analytics.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        background: '#fff',
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
            How it works
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}>
            From upload to insights in 3 steps
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#475569',
          }}>
            The entire pipeline runs automatically — you just upload and watch.
          </p>
        </div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          position: 'relative',
        }}>
          {STEPS.map((step, index) => (
            <div key={step.num} style={{ position: 'relative' }}>
              <div style={{
                background: '#fff',
                border: '0.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '28px',
                height: '100%',
              }}>
                {/* Step number */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#f97316',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '10px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: '1.7',
                }}>
                  {step.desc}
                </p>
              </div>

              {/* Arrow between steps */}
              {index < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: '-16px',
                  top: '40px',
                  fontSize: '20px',
                  color: '#f97316',
                  zIndex: 2,
                  fontWeight: '700',
                }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}