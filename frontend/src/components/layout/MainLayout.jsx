import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area — pushed right by sidebar width */}
      <div style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}>

        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '24px',
          maxWidth: '1400px',
          width: '100%',
        }}>
          {/* 
            Outlet renders whichever child route is active.
            When user goes to /upload, Outlet = <UploadPage />
            When user goes to /dashboard, Outlet = <DashboardPage />
          */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}