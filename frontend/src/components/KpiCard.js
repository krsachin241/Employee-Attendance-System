import React from 'react';
export default function KpiCard({ title, value, icon, color, bgGradient }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 16,
      padding: '22px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #F1F5F9',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
      minWidth: 180,
      minHeight: 90,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)';
      }}
    >
      {/* Icon and title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B', letterSpacing: 0.2 }}>
          {title}
        </span>
      </div>
      {/* Value */}
      <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', lineHeight: 1, marginLeft: 'auto' }}>
        {value}
      </div>
    </div>
  );
}
