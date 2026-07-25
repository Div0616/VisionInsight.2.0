import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import LivePage from './pages/LivePage'
import AnalyticsPage from './pages/AnalyticsPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    /*
      BrowserRouter — enables URL-based routing
      Routes — container for all route definitions
      Route — maps a URL path to a page component
    */
    <BrowserRouter>
      <Routes>
        {/* Landing page renders standalone — has its own Navbar and Footer */}
        <Route path="/" element={<LandingPage />} />

        {/* All app pages use MainLayout (Sidebar + TopBar) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}