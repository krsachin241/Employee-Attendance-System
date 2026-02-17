import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/mark-attendance', label: 'Attendance', icon: '📝' },
  { path: '/attendance-history', label: 'History', icon: '📅' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function EmployeeSidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Responsive sidebar: hidden on mobile unless open, shadow removed on mobile
  // Sidebar only shows when mobileOpen is true
  if (!mobileOpen) return null;
  return (
    <aside
      className="employee-sidebar"
      style={{
        width: 260,
        minHeight: '100vh',
        background: '#1A2233',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 999,
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
        borderRight: '1.5px solid #232B3E',
        transition: 'box-shadow 0.2s, left 0.2s',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1.5px solid #232B3E',
        display: 'flex', alignItems: 'center', gap: 12,
        minHeight: 72,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#232B3E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          H
        </div>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>AttendEase</div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          style={{
            display: 'none',
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 28,
            cursor: 'pointer',
          }}
          className="sidebar-close-btn"
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: '4px 12px', overflowY: 'auto' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (onClose) onClose();
              }}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 18px',
                marginBottom: 6,
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'all 0.2s',
                background: isActive
                  ? 'rgba(67,160,71,0.10)'
                  : isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                borderLeft: isActive ? '3px solid #43a047' : '3px solid transparent',
                position: 'relative',
              }}
            >
              <span style={{
                fontSize: 20,
                filter: isActive ? 'none' : 'grayscale(0.3)',
                opacity: isActive ? 1 : 0.8,
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 15, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : '#B3C6E0',
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: 7, height: 7,
                  borderRadius: '50%', background: '#43a047',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div style={{
        padding: '18px 14px',
        borderTop: '1.5px solid #232B3E',
      }}>
        <button
          onClick={handleLogout}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.10)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 18px',
            width: '100%', border: 'none',
            background: 'transparent', borderRadius: 12,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          title="Sign Out"
        >
          <span style={{ fontSize: 20 }}>🚪</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#EF4444' }}>
            Sign Out
          </span>
        </button>
      </div>
      {/* Responsive styles for sidebar */}
      <style>{`
        @media (max-width: 900px) {
          .employee-sidebar {
            width: 220px !important;
          }
        }
        @media (max-width: 700px) {
          .employee-sidebar {
            left: ${mobileOpen ? '0' : '-260px'} !important;
            width: 80vw !important;
            min-width: 0 !important;
            max-width: 320px !important;
            box-shadow: none !important;
            border-right: 1px solid #232B3E !important;
            transition: left 0.2s;
            background: #1A2233 !important;
            z-index: 1200 !important;
          }
          .sidebar-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </aside>
  );
}
