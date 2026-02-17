import React from 'react';
import ManagerSidebar from './ManagerSidebar';
import ManagerHeader from './ManagerHeader';

export default function ManagerLayout({ children }) {
  // Responsive: always show sidebar on desktop, collapsible on mobile
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(isMobile);
  React.useEffect(() => { setSidebarCollapsed(isMobile); }, [isMobile]);
  React.useEffect(() => {
    const handleRoute = () => setSidebarCollapsed(isMobile);
    window.addEventListener('manager-nav', handleRoute);
    return () => window.removeEventListener('manager-nav', handleRoute);
  }, [isMobile]);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Sidebar: always visible on web/desktop, collapsible on mobile */}
      {(!isMobile || !sidebarCollapsed) && <ManagerSidebar onNavigate={() => setSidebarCollapsed(true)} />}

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: !isMobile ? 260 : 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.2s',
      }}>
        {/* Header */}
        <ManagerHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(s => !s)}
          isMobile={isMobile}
        />

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '24px 28px',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
