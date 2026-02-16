import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export default function ManagerHeader() {
  const user = useSelector(state => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header style={{
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
    }}>
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
            Manager Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0, fontWeight: 500 }}>
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div style={{
        flex: '0 1 400px',
        position: 'relative',
        margin: '0 24px',
      }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 16, color: '#94A3B8', pointerEvents: 'none',
        }}>
          🔍
        </span>
        <input
          type="text"
          placeholder="Search employees, departments..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px 10px 42px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            fontSize: 14,
            background: '#F8FAFC',
            color: '#334155',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#3B82F6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#E2E8F0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right: Notifications + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notification bell */}
        <button style={{
          position: 'relative', border: 'none', background: '#F1F5F9',
          width: 42, height: 42, borderRadius: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
        >
          🔔
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: '#EF4444', border: '2px solid #fff',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
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
      </div>
    </header>
  );
}
