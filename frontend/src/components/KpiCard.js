import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function KpiCard({ title, value, total, icon, color, bgGradient }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const data = [
    { name: 'value', val: percentage },
    { name: 'remaining', val: 100 - percentage },
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 16,
      padding: '22px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid #F1F5F9',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
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
      {/* Decorative accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 4, height: '100%',
        background: bgGradient || color,
        borderRadius: '16px 0 0 16px',
      }} />

      {/* Left section */}
      <div style={{ paddingLeft: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
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
        <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>
          {percentage}% of total
        </div>
      </div>

      {/* Right: Circular chart */}
      <div style={{ width: 70, height: 70, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={32}
              startAngle={90}
              endAngle={-270}
              dataKey="val"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#F1F5F9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 13, fontWeight: 800, color: color,
        }}>
          {percentage}%
        </div>
      </div>
    </div>
  );
}
