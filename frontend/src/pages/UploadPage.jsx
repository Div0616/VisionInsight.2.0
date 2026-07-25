import { useState, useRef, useCallback } from 'react'
import { videoAPI } from '../services/api'
import DropZone from '../components/upload/DropZone'
import UploadProgress from '../components/upload/UploadProgress'
import ResultsCard from '../components/upload/ResultsCard'
import { RefreshCw, X } from 'lucide-react'

// ============================================
// UPLOAD PAGE — Main orchestrator
// 
// BACKEND CONNECTIONS IN THIS FILE:
// 1. videoAPI.uploadVideo()  → POST /api/upload
// 2. videoAPI.getStatus()    → GET /api/status/{id}
// 3. videoAPI.getResults()   → GET /api/results/{id}
//
// FLOW:
// File selected → handleUpload() → uploadVideo()
//   → session_id received → startPolling()
//   → getStatus() every 2s → when complete
//   → fetchResults() → display ResultsCard
// ============================================

export default function UploadPage() {

  // File selected by user (from DropZone)
  const [selectedFile, setSelectedFile] = useState(null)

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0)

  // Processing state
  const [sessionId, setSessionId] = useState(null)
  const [processingStatus, setProcessingStatus] = useState(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingError, setProcessingError] = useState(null)

  // Results
  const [results, setResults] = useState(null)

  // Overall UI state
  const [uiState, setUiState] = useState('idle')
  // idle | uploading | polling | completed | failed

  // Ref to store polling interval so we can clear it
  const pollingRef = useRef(null)

  // ============================================
  // STEP 1: File selected from DropZone
  // No backend call here — just store the file
  // ============================================
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file)
    setUiState('idle')
    setResults(null)
    setUploadProgress(0)
    setProcessingProgress(0)
    setProcessingError(null)
  }, [])

  // ============================================
  // STEP 3: Poll backend for processing status
  // BACKEND CONNECTION: GET /api/status/{sessionId}
  // CALLED BY: handleUpload() after upload completes
  // RUNS: Every 2000ms until status is completed/failed
  // ============================================
  const startPolling = useCallback((id) => {
    setUiState('polling')

    pollingRef.current = setInterval(async () => {
      try {
        // FRONTEND → BACKEND
        // Calls: GET http://localhost:8000/api/status/{id}
        // Via: videoAPI.getStatus() in services/api.js
        const statusData = await videoAPI.getStatus(id)

        setProcessingStatus(statusData.status)
        setProcessingProgress(statusData.progress || 0)

        if (statusData.status === 'completed') {
          // Stop polling
          clearInterval(pollingRef.current)

          // ============================================
          // STEP 4: Fetch full results
          // BACKEND CONNECTION: GET /api/results/{id}
          // TRIGGERED BY: status === "completed"
          // ============================================ 
          const resultData = await videoAPI.getResults(id)
          const finalResults = { ...resultData, session_id: id }
          console.log('RESULTS BEING SET:', finalResults)
          setResults(finalResults)
          setUiState('completed')

        } else if (statusData.status === 'failed') {
          clearInterval(pollingRef.current)
          setProcessingError(statusData.error)
          setUiState('failed')
        }

      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 2000) // Poll every 2 seconds
  }, [])
  
  // ============================================
  // STEP 2: Upload button clicked
  // BACKEND CONNECTION: POST /api/upload
  // TRIGGERED BY: "Start Analysis" button click
  // SENDS: FormData with video file
  // RETURNS: session_id for polling
  // ============================================
  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUiState('uploading')
      setUploadProgress(0)

      // FRONTEND → BACKEND
      // Calls: POST http://localhost:8000/api/upload
      // Via: videoAPI.uploadVideo() in services/api.js
      // onProgress updates the upload progress bar
      const uploadData = await videoAPI.uploadVideo(
        selectedFile,
        setUploadProgress // This updates upload progress bar in real time
      )

      // Store session ID for polling
      setSessionId(uploadData.session_id)

      // Start polling for processing status
      startPolling(uploadData.session_id)

    } catch (err) {
      console.error('Upload error:', err)
      setUiState('failed')
      setProcessingError(err.response?.data?.detail || 'Upload failed')
    }
  }

  // ============================================
  // Reset everything to start over
  // No backend call — just clears local state
  // ============================================
  const handleReset = () => {
    clearInterval(pollingRef.current)
    setSelectedFile(null)
    setUploadProgress(0)
    setSessionId(null)
    setProcessingStatus(null)
    setProcessingProgress(0)
    setProcessingError(null)
    setResults(null)
    setUiState('idle')
  }

  const isProcessing = ['uploading', 'polling'].includes(uiState)

  return (
    <div style={{ maxWidth: '800px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '6px',
        }}>
          Upload Video for Analysis
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Upload a video file and our AI will detect and track all objects frame by frame.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="card">

        {/* Drop Zone */}
        {/* 
          DropZone does NOT call backend
          It calls handleFileSelect() which stores the file in state
          Backend is only called when user clicks "Start Analysis"
        */}
        <DropZone
          onFileSelect={handleFileSelect}
          disabled={isProcessing}
        />

        {/* Selected File Info + Upload Button */}
        {selectedFile && uiState === 'idle' && (
          <div style={{
            marginTop: '16px',
            padding: '14px 16px',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
              }}>
                {selectedFile.name}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}>
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Clear button */}
              <button
                className="btn-secondary"
                onClick={handleReset}
                style={{ padding: '8px 14px' }}
              >
                <X size={14} />
                Clear
              </button>

              {/* 
                START ANALYSIS BUTTON
                TRIGGERS: handleUpload()
                WHICH CALLS: videoAPI.uploadVideo()
                WHICH SENDS: POST /api/upload
              */}
              <button
                className="btn-primary"
                onClick={handleUpload}
              >
                Start Analysis
              </button>
            </div>
          </div>
        )}

        {/* Progress Display */}
        {uiState !== 'idle' && selectedFile && (
          <UploadProgress
            uploadProgress={uploadProgress}
            processingProgress={processingProgress}
            status={uiState === 'polling'
              ? processingStatus || 'pending'
              : uiState
            }
            filename={selectedFile.name}
            error={processingError}
          />
        )}
      </div>

      {/* Results */}
      {uiState === 'completed' && results && (
        <>
          {/* 
            RESULTS DATA SOURCE: GET /api/results/{session_id}
            Fetched by fetchResults() when polling detects "completed"
            Passed directly to ResultsCard as props
          */}
          <ResultsCard results={results} />

          {/* Analyze Another Video */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button className="btn-secondary" onClick={handleReset}>
              <RefreshCw size={16} />
              Analyze Another Video
            </button>
          </div>
        </>
      )}
    </div>
  )
}