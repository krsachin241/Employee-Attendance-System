import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export default function EmployeeHeader() {
  const user = useSelector(state => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header style={{
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
    }}>
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 12 }}>
            Employee Dashboard
          </div>
          <div style={{ fontSize: 15, color: '#B3C6E0', fontWeight: 500, marginTop: 2 }}>
            Welcome
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div style={{
        flex: '0 1 400px',
        position: 'relative',
        margin: '0 24px',
      }}>
        <span style={{
          position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
          fontSize: 18, color: '#B3C6E0', pointerEvents: 'none',
        }}>
          <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" stroke="#B3C6E0" strokeWidth="2"/><path d="M16 16L13 13" stroke="#B3C6E0" strokeWidth="2" strokeLinecap="round"/></svg>
        </span>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 18px 12px 48px',
            border: '1.5px solid #232B3E',
            borderRadius: 14,
            fontSize: 16,
            background: '#1A2233',
            color: '#fff',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#43a047';
            e.target.style.boxShadow = '0 0 0 3px rgba(67,160,71,0.10)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#232B3E';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right: Notifications + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Notification bell */}
        <button style={{
          position: 'relative', border: 'none', background: 'transparent',
          width: 44, height: 44, borderRadius: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, transition: 'background 0.2s', color: '#B3C6E0',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#232B3E'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{fontSize:22}}>🔔</span>
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 10, height: 10, borderRadius: '50%',
            background: '#43a047', border: '2px solid #232B3E',
          }} />
        </button>

        {/* User Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{user?.name || 'John Doe'}</div>
          <div style={{ fontSize: 13, color: '#B3C6E0', fontWeight: 500 }}>{user?.role ? user.role.replace(/\b\w/g, l => l.toUpperCase()) : 'Software Engineer'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginLeft: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: '#1A2233',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 18,
            border: '2px solid #232B3E',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'J'}
          </div>
        </div>
      </div>
    </header>
  );
}
