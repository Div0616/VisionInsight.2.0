import { HardDrive, FolderOpen, FileVideo } from 'lucide-react'

// ============================================
// FILE UPLOAD SETTINGS CARD
//
// This card is READ-ONLY — informational display only.
// No backend calls needed.
// All values are hard-coded to match backend/app/core/config.py
// (MAX_FILE_SIZE = 200 MB, ALLOWED_EXTENSIONS, upload/processed dirs)
// ============================================

const ALLOWED_FORMATS = ['MP4', 'AVI', 'MOV', 'MKV', 'WebM']

function InfoRow({ icon: Icon, label, value, iconColor = 'var(--color-primary)' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
        background: '#fff', border: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={16} color={iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
          {label}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default function FileUploadInfo() {
  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* ---- Header ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
          background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HardDrive size={20} color="#3b82f6" />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            File Upload Settings
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Read-only — configured in backend/app/core/config.py
          </p>
        </div>
        {/* Read-only badge */}
        <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Read-only</span>
      </div>

      {/* ---- Info rows ---- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <InfoRow
          icon={HardDrive}
          label="Maximum File Size"
          value="200 MB"
          iconColor="#3b82f6"
        />
        <InfoRow
          icon={FolderOpen}
          label="Upload Directory"
          value="backend/uploads/"
          iconColor="#f97316"
        />
        <InfoRow
          icon={FolderOpen}
          label="Processed Directory"
          value="backend/processed/"
          iconColor="#22c55e"
        />
      </div>

      {/* ---- Allowed formats ---- */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '12px',
        }}>
          <FileVideo size={15} color="var(--color-text-secondary)" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            Allowed Formats
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALLOWED_FORMATS.map((fmt) => (
            <span
              key={fmt}
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border-strong)',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--color-text-secondary)',
                fontFamily: 'monospace',
                letterSpacing: '0.03em',
              }}
            >
              .{fmt.toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
