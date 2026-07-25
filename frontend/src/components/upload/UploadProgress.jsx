// ============================================
// UPLOAD PROGRESS COMPONENT
// Shows two progress bars:
// 1. Upload progress — file bytes sent to server
//    (driven by axios onUploadProgress in api.js)
// 2. Processing progress — YOLOv8 detection progress
//    (driven by polling GET /api/status/{id} every 2s)
// ============================================

export default function UploadProgress({
  uploadProgress,    // 0-100: how much of file has been sent
  processingProgress,// 0-100: how many frames have been processed
  status,           // "uploading" | "pending" | "processing" | "completed" | "failed"
  filename,
  error,
}) {

  const statusLabels = {
    uploading: 'Uploading video to server...',
    pending: 'Video received — starting AI processing...',
    processing: 'YOLOv8 detecting objects frame by frame...',
    completed: 'Processing complete!',
    failed: 'Processing failed',
  }

  const statusColors = {
    uploading: 'var(--color-primary)',
    pending: '#f59e0b',
    processing: 'var(--color-primary)',
    completed: '#22c55e',
    failed: '#ef4444',
  }

  return (
    <div className="card" style={{ marginTop: '16px' }}>

      {/* File Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
          }}>
            {filename}
          </p>
          <p style={{
            fontSize: '12px',
            color: statusColors[status] || 'var(--color-text-muted)',
            marginTop: '2px',
            fontWeight: '500',
          }}>
            {statusLabels[status] || status}
          </p>
        </div>

        {/* Status Badge */}
        <span className={`badge badge-${
          status === 'completed' ? 'success' :
          status === 'failed' ? 'error' :
          'info'
        }`}>
          {status}
        </span>
      </div>

      {/* Upload Progress Bar */}
      {(status === 'uploading' || uploadProgress > 0) && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Upload Progress
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}>
              {uploadProgress}%
            </span>
          </div>
          {/* Progress Bar Track */}
          <div style={{
            height: '6px',
            background: 'var(--color-border)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            {/* Progress Bar Fill */}
            <div style={{
              height: '100%',
              width: `${uploadProgress}%`,
              background: 'var(--color-primary)',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Processing Progress Bar */}
      {/* 
        BACKEND CONNECTION: GET /api/status/{session_id}
        This bar updates as UploadPage polls the backend
        every 2 seconds for processing progress
      */}
      {(status === 'processing' || status === 'completed') && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              AI Processing Progress
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}>
              {Math.round(processingProgress)}%
            </span>
          </div>
          <div style={{
            height: '6px',
            background: 'var(--color-border)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${processingProgress}%`,
              background: status === 'completed'
                ? '#22c55e'
                : 'var(--color-primary)',
              borderRadius: '999px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === 'failed' && error && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          background: '#fee2e2',
          borderRadius: 'var(--radius-md)',
          color: '#dc2626',
          fontSize: '13px',
        }}>
          Error: {error}
        </div>
      )}
    </div>
  )
}