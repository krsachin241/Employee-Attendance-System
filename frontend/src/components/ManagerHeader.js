import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

export default function ManagerHeader({ sidebarCollapsed, onToggleSidebar, isMobile }) {
  const user = useSelector(state => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');


  const location = useLocation();
  // Map pathnames to page titles and subtitles for manager pages
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const pageInfo = (() => {
    if (location.pathname === '/manager/dashboard') return { title: 'Manager Dashboard', subtitle: formattedDate };
    if (location.pathname === '/manager/all-employees') return { title: 'All Employees Attendance', subtitle: 'View and manage all employees' };
    if (location.pathname === '/manager/team-calendar') return { title: 'Team Calendar', subtitle: 'Team attendance overview' };
    if (location.pathname === '/manager/reports') return { title: 'Reports', subtitle: 'Attendance and performance reports' };
    return { title: '', subtitle: '' };
  })();

  return (
    <header
      className="manager-header"
      style={{
        height: 72,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'box-shadow 0.2s, padding 0.2s',
      }}
    >
      {/* Left: Hamburger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Hamburger only on mobile */}
        {isMobile && (
          <button
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              marginRight: 12, padding: 8, display: 'flex', alignItems: 'center',
            }}
          >
            <span style={{ display: 'inline-block', width: 28, height: 28 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="6" width="28" height="3" rx="1.5" fill="#232B3E" />
                <rect y="13" width="28" height="3" rx="1.5" fill="#232B3E" />
                <rect y="20" width="28" height="3" rx="1.5" fill="#232B3E" />
              </svg>
            </span>
          </button>
        )}
        <div>
          <h1 className="manager-header-title" style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
            {pageInfo.title}
          </h1>
          <p className="manager-header-subtitle" style={{ fontSize: 13, color: '#64748B', margin: 0, fontWeight: 500 }}>
            {pageInfo.subtitle}
          </p>
        </div>
      </div>
      {/* Responsive styles for manager header */}
      <style>{`
        @media (max-width: 900px) {
          .manager-header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .manager-header-title {
            font-size: 18px !important;
          }
          .manager-header-subtitle {
            font-size: 11px !important;
          }
        }
        @media (max-width: 700px) {
          .manager-header {
            height: 56px !important;
            padding-left: 4px !important;
            padding-right: 4px !important;
            box-shadow: none !important;
          }
          .manager-header-title {
            font-size: 15px !important;
          }
          .manager-header-subtitle {
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Profile Only (Right) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', cursor: 'pointer' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 16,
          boxShadow: '0 2px 8px rgba(30,58,138,0.3)',
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'M'}
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
            {user?.name || 'Manager'}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, textTransform: 'capitalize' }}>
            {user?.role || 'manager'}
          </div>
        </div>
      </div>
    </header>
  );
}
