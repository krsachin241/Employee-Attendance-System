import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
    padding: '0 32px',
    height: 60,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 1,
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  link: (active) => ({
    color: active ? '#fff' : 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    fontWeight: active ? 700 : 500,
    fontSize: 14,
    background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
    transition: 'all 0.2s',
  }),
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 18px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    marginLeft: 8,
    transition: 'all 0.2s',
  },
  userInfo: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginRight: 12,
  },
};

export default function Navbar() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!user) return null;

  const isManager = user.role === 'manager';

  const employeeItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/mark-attendance', label: 'Attendance' },
    { path: '/attendance-history', label: 'History' },
    { path: '/profile', label: 'Profile' },
  ];

  const managerItems = [
    { path: '/manager/dashboard', label: 'Dashboard' },
    { path: '/manager/attendance', label: 'All Attendance' },
    { path: '/manager/calendar', label: 'Calendar' },
    { path: '/manager/reports', label: 'Reports' },
    { path: '/profile', label: 'Profile' },
  ];

  const navItems = isManager ? managerItems : employeeItems;

  return (
    <nav style={styles.nav}>
      <Link to={isManager ? '/manager/dashboard' : '/dashboard'} style={styles.brand}>
        📋 AttendEase
      </Link>
      <div style={styles.links}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={styles.link(location.pathname === item.path)}
          >
            {item.label}
          </Link>
        ))}
        <span style={styles.userInfo}>
          {user.name} ({user.role})
        </span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
