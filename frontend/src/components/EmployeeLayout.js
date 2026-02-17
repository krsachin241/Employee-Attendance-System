import React from 'react';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeHeader from './EmployeeHeader';

export default function EmployeeLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  // Hide sidebar on route change
  React.useEffect(() => {
    const handleRoute = () => setSidebarCollapsed(true);
    window.addEventListener('employee-nav', handleRoute);
    return () => window.removeEventListener('employee-nav', handleRoute);
  }, []);
  // Always show sidebar on desktop, togglable on mobile
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 900;
  return (
    <div className="employee-layout" style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9', overflowX: 'hidden', position: 'relative' }}>
      {/* Sidebar overlays only content, not header */}
      {(!sidebarCollapsed || isDesktop) && (
        <div style={{ position: isDesktop ? 'relative' : 'fixed', top: 0, left: 0, zIndex: 100 }}>
          <EmployeeSidebar mobileOpen={true} onClose={() => setSidebarCollapsed(true)} />
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.2s',
        }}
      >
        {/* Header always on top */}
        <div style={{ zIndex: 200, position: 'relative' }}>
          <EmployeeHeader sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(s => !s)} />
        </div>
        <main
          style={{
            flex: 1,
            padding: '24px 28px',
            overflowY: 'auto',
            maxWidth: '100vw',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .employee-layout {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
