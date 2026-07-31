import axios from 'axios'

// ============================================
// BASE CONFIGURATION
// All API calls go through this single instance
// Set VITE_API_URL in .env to change for deployment
// ============================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// ============================================
// REQUEST INTERCEPTOR
// Runs before every request
// ============================================
API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// ============================================
// RESPONSE INTERCEPTOR
// Runs after every response — catches errors
// ============================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================
// HEALTH API
// ============================================
export const healthAPI = {
  /**
   * Check if backend is running
   * TRIGGERED BY: TopBar component on mount
   * CALLS: GET http://localhost:8000/health
   * RETURNS: { status, service, version }
   */
  check: async () => {
    const response = await API.get('/health')
    return response.data
  }
}

// ============================================
// VIDEO API
// All video upload and processing calls
// ============================================
export const videoAPI = {

  /**
   * Upload video file to backend
   * TRIGGERED BY: Upload button / file drop in UploadPage
   * CALLS: POST http://localhost:8000/api/upload
   * SENDS: FormData with video file
   * RETURNS: { session_id, filename, file_size_mb, status, message }
   * 
   * @param {File} file - Video file from file input or drop zone
   * @param {Function} onProgress - Callback receiving upload % (0-100)
   */
  uploadVideo: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await API.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        if (onProgress) onProgress(percent)
      }
    })
    return response.data
  },

  /**
   * Poll processing status
   * TRIGGERED BY: setInterval every 2000ms after upload
   * CALLS: GET http://localhost:8000/api/status/{sessionId}
   * RETURNS: { session_id, status, progress, error }
   * STATUS VALUES: "pending" | "processing" | "completed" | "failed"
   * 
   * @param {string} sessionId - ID returned from uploadVideo()
   */
  getStatus: async (sessionId) => {
    const response = await API.get(`/api/status/${sessionId}`)
    return response.data
  },

  /**
   * Fetch full analytics results
   * TRIGGERED BY: Automatically when getStatus returns "completed"
   * CALLS: GET http://localhost:8000/api/results/{sessionId}
   * RETURNS: { session_id, filename, status, analytics, created_at }
   * analytics includes: total_frames, total_detections, class_distribution, etc.
   * 
   * @param {string} sessionId - ID returned from uploadVideo()
   */
  getResults: async (sessionId) => {
    const response = await API.get(`/api/results/${sessionId}`)
    return response.data
  },

  /**
   * Get all past sessions
   * TRIGGERED BY: HistoryPage on component mount
   * CALLS: GET http://localhost:8000/api/sessions
   * RETURNS: { sessions: [{ session_id, filename, status, created_at }] }
   */
  getAllSessions: async () => {
    const response = await API.get('/api/sessions')
    return response.data

  
  },
  /**
   * Get aggregated dashboard statistics
   * TRIGGERED BY: DashboardPage on component mount
   * CALLS: GET http://localhost:8000/api/dashboard
   * RETURNS: {
   *   total_videos, completed_videos, total_detections,
   *   total_processing_time, most_detected_class,
   *   class_distribution, recent_sessions, all_sessions
   * }
   */
  getDashboardStats: async () => {
    const response = await API.get('/api/dashboard')
    return response.data
  },

  /**
   * Get full analytics for a specific session
   * TRIGGERED BY: User clicking a session in HistoryPage
   * CALLS: GET http://localhost:8000/api/session/{sessionId}/analytics
   * RETURNS: { session_id, filename, status, analytics, created_at }
   * 
   * @param {string} sessionId - Session ID from history table
   */
  getSessionAnalytics: async (sessionId) => {
    const response = await API.get(`/api/session/${sessionId}/analytics`)
    return response.data
  },

  /**
   * Get URL for processed video with bounding boxes
   * TRIGGERED BY: ResultsCard rendering after completion
   * CALLS: GET http://localhost:8000/api/video/{sessionId}
   * RETURNS: Direct video file URL for browser playback
   * 
   * @param {string} sessionId - Session ID of completed session
   */
  getVideoUrl: (sessionId) => {
    // Returns direct URL — no axios needed
    // Browser's <video> tag fetches this directly
    return `${API_BASE_URL}/api/video/${sessionId}`
  },

  /**
   * Send a single webcam frame for detection + tracking
   * TRIGGERED BY: setInterval every 500ms in LivePage
   * CALLS: POST /api/detect/frame
   * SENDS: { frame_data: base64_string }
   * RETURNS: {
   *   detections: [{ track_id, bbox, confidence, class_name, class_id, color }],
   *   total_detections: number,
   *   active_objects: number,
   *   total_unique_objects: number,
   *   frame_width: number,
   *   frame_height: number
   * }
   *
   * @param {string} base64Frame - Base64 encoded JPEG frame
   */
  detectFrame: async (base64Frame) => {
    const response = await API.post('/api/detect/frame', {
      frame_data: base64Frame
    })
    return response.data
  },

  /**
   * Reset tracking state (IDs start fresh)
   * TRIGGERED BY: LivePage when user starts/stops detection
   * CALLS: POST /api/detect/reset
   */
  resetTracking: async () => {
    const response = await API.post('/api/detect/reset')
    return response.data
  },

  /**
   * Start an IP camera / phone camera stream
   * TRIGGERED BY: LivePage when user enters stream URL
   * CALLS: POST /api/stream/start
   * SENDS: { url: "rtsp://..." or "http://192.168.1.5:4747/video" }
   *
   * @param {string} url - RTSP or HTTP stream URL
   */
  startStream: async (url) => {
    const response = await API.post('/api/stream/start', { url })
    return response.data
  },

  /**
   * Stop an active IP camera stream
   * TRIGGERED BY: LivePage when user disconnects IP camera
   * CALLS: POST /api/stream/stop
   */
  stopStream: async () => {
    const response = await API.post('/api/stream/stop')
    return response.data
  },

  /**
   * Get latest detections from IP camera stream
   * TRIGGERED BY: setInterval every 500ms in LivePage while IP stream is active
   * CALLS: GET /api/stream/status
   * RETURNS: { active, detections, active_objects, total_unique_objects, frame_count, fps, error }
   */
  getStreamStatus: async () => {
    const response = await API.get('/api/stream/status')
    return response.data
  },

  // ============================================
  // SETTINGS API — NEW FUNCTIONS
  // These call the 3 new endpoints added to
  // backend/app/api/upload.py (settings section)
  // ============================================

  /**
   * Update the global YOLO confidence threshold
   * TRIGGERED BY: SettingsPage — Detection Settings card Save button
   * CALLS: POST http://localhost:8000/api/settings/confidence
   * SENDS: { confidence: float }  e.g. 0.35
   * RETURNS: { success, confidence, message }
   *
   * @param {number} confidence - Value between 0.1 and 0.9
   */
  updateConfidence: async (confidence) => {
    const response = await API.post('/api/settings/confidence', { confidence })
    return response.data
  },

  /**
   * Swap the active YOLO model on the running backend
   * TRIGGERED BY: SettingsPage — Model Selector card Save button
   * CALLS: POST http://localhost:8000/api/settings/model
   * SENDS: { model_name: string }  e.g. "yolo11s.pt"
   * RETURNS: { success, model_name, message }
   *
   * NOTE: First inference after a model change may be slow if
   * Ultralytics needs to download the weights file.
   *
   * @param {string} modelName - One of: yolo11n.pt | yolo11s.pt | yolo11m.pt
   */
  updateModel: async (modelName) => {
    const response = await API.post('/api/settings/model', { model_name: modelName })
    return response.data
  },

  /**
   * Delete all failed sessions from MongoDB
   * TRIGGERED BY: SettingsPage — Clear Failed Sessions card button
   * CALLS: DELETE http://localhost:8000/api/sessions/failed
   * RETURNS: { deleted_count, message }
   *
   * Does NOT affect pending, processing, or completed sessions.
   */
  clearFailedSessions: async () => {
    const response = await API.delete('/api/sessions/failed')
    return response.data
  },
}

export default API