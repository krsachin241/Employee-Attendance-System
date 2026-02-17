import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

export default function EmployeeHeader({ sidebarCollapsed, onToggleSidebar }) {
  const user = useSelector(state => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const location = useLocation();
  // Map pathnames to page titles and subtitles
  const pageInfo = (() => {
    if (location.pathname === '/dashboard') return { title: 'Employee Dashboard', subtitle: 'Welcome' };
    if (location.pathname === '/profile') return { title: 'My Profile', subtitle: 'Your account details' };
    if (location.pathname === '/attendance-history') return { title: 'Attendance History', subtitle: 'Your attendance records' };
    if (location.pathname === '/mark-attendance') return { title: 'Mark Attendance', subtitle: 'Check in or out' };
    return { title: '', subtitle: '' };
  })();

  return (
    <header
      className="employee-header"
      style={{
        height: 80,
        background: '#232B3E',
        borderBottom: '1.5px solid #232B3E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 44px',
        boxShadow: '0 1.5px 6px rgba(0,0,0,0.10)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'box-shadow 0.2s, padding 0.2s',
      }}
    >
      {/* Left: Hamburger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            marginRight: 12, padding: 8, display: 'flex', alignItems: 'center',
            display: 'none',
          }}
          className="sidebar-hamburger"
        >
          <span style={{ display: 'inline-block', width: 28, height: 28 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="6" width="28" height="3" rx="1.5" fill="#fff" />
              <rect y="13" width="28" height="3" rx="1.5" fill="#fff" />
              <rect y="20" width="28" height="3" rx="1.5" fill="#fff" />
            </svg>
          </span>
        </button>
        <div>
          <div className="header-title" style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 12 }}>
            {pageInfo.title}
          </div>
          <div className="header-subtitle" style={{ fontSize: 15, color: '#B3C6E0', fontWeight: 500, marginTop: 2 }}>
            {pageInfo.subtitle}
          </div>
        </div>
      </div>

      {/* Center: (search removed) */}

      {/* Right: Profile only */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, justifyContent: 'flex-end' }}>
        <div className="employee-header-userinfo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 60, maxWidth: 220, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'right' }}>
            {user && user.name ? user.name : 'Employee'}
          </span>
        </div>
      </div>
      {/* Responsive styles for header */}
      <style>{`
        @media (max-width: 900px) {
          .employee-header {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .sidebar-hamburger {
            display: flex !important;
          }
        }
        @media (max-width: 700px) {
          .employee-header-role {
            display: none !important;
          }
          .employee-header {
            height: 60px !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
            box-shadow: none !important;
          }
          .header-title {
            font-size: 18px !important;
          }
          .header-subtitle {
            font-size: 12px !important;
          }
          .sidebar-hamburger {
            margin-right: 4px !important;
          }
          .employee-header-userinfo {
            flex-direction: row !important;
            align-items: center !important;
            gap: 6px !important;
            max-width: 100vw !important;
            justify-content: flex-end !important;
          }
        }
        @media (max-width: 500px) {
          .employee-header-userinfo {
            flex-direction: row !important;
            align-items: center !important;
            gap: 4px !important;
            max-width: 100vw !important;
            justify-content: flex-end !important;
          }
        }
      `}</style>
    </header>
  );
}
