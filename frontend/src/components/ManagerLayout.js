import React from 'react';
import ManagerSidebar from './ManagerSidebar';
import ManagerHeader from './ManagerHeader';

export default function ManagerLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F1F5F9',
    }}>
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: 260,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <ManagerHeader />

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
