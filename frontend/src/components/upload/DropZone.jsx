import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Film, AlertCircle } from 'lucide-react'

// ============================================
// DROPZONE COMPONENT
// Handles file selection via drag-drop or click
// Does NOT call backend directly —
// passes file up to UploadPage via onFileSelect()
// BACKEND CONNECTION happens in UploadPage
// ============================================

const ALLOWED_TYPES = {
  'video/mp4': ['.mp4'],
  'video/avi': ['.avi'],
  'video/quicktime': ['.mov'],
  'video/x-matroska': ['.mkv'],
  'video/webm': ['.webm'],
}

const MAX_SIZE = 200 * 1024 * 1024 // 200MB in bytes

export default function DropZone({ onFileSelect, disabled }) {
  const [error, setError] = useState(null)

  // ============================================
  // onDrop — called when user drops or selects file
  // DOES NOT call backend
  // Validates file then passes to parent via onFileSelect()
  // Parent (UploadPage) then calls videoAPI.uploadVideo()
  // ============================================
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File too large. Maximum size is 200MB.')
      } else {
        setError('Invalid file type. Please upload MP4, AVI, MOV, MKV, or WebM.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled,
  })

  return (
    <div>
      {/* Drop Zone Area */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive
            ? 'var(--color-primary)'
            : 'var(--color-border-strong)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-slow)',
          background: isDragActive
            ? 'rgba(249, 115, 22, 0.04)'
            : 'var(--color-surface-2)',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />

        {/* Upload Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isDragActive
            ? 'rgba(249, 115, 22, 0.15)'
            : 'var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          transition: 'all var(--transition-slow)',
        }}>
          {isDragActive
            ? <Film size={28} color="var(--color-primary)" />
            : <Upload size={28} color="var(--color-text-muted)" />
          }
        </div>

        {/* Text */}
        <p style={{
          fontSize: '16px',
          fontWeight: '600',
          color: isDragActive
            ? 'var(--color-primary)'
            : 'var(--color-text-primary)',
          marginBottom: '8px',
          transition: 'color var(--transition-slow)',
        }}>
          {isDragActive
            ? 'Drop your video here!'
            : 'Drag & drop a video or click to browse'
          }
        </p>

        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          marginBottom: '16px',
        }}>
          Supports MP4, AVI, MOV, MKV, WebM — Max 200MB
        </p>

        {/* Browse Button */}
        {!disabled && (
          <button className="btn-primary" style={{ pointerEvents: 'none' }}>
            <Upload size={16} />
            Browse Files
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          padding: '10px 14px',
          background: '#fee2e2',
          borderRadius: 'var(--radius-md)',
          color: '#dc2626',
          fontSize: '13px',
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  )
}