import React from 'react';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeHeader from './EmployeeHeader';

export default function EmployeeLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F1F5F9',
    }}>
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: 260,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <EmployeeHeader />

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
