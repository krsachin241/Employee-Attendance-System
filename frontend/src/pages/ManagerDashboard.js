import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  const colors = {
    present: { bg: '#e8f5e9', color: '#2e7d32' },
    late: { bg: '#fff3e0', color: '#ef6c00' },
    absent: { bg: '#fce4ec', color: '#e53935' },
    'half-day': { bg: '#ede7f6', color: '#5e35b1' },
  };
  const c = colors[status] || { bg: '#f5f5f5', color: '#888' };
  return (
    <span style={{ background: c.bg, color: c.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {status}
    </span>
  );
}

function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/attendance/manager/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load dashboard');
        setStats(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading manager dashboard...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#e53935' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '32px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Manager Dashboard</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>Team attendance overview</p>

      {/* Today's Stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Total Employees', value: stats?.totalEmployees || 0, bg: '#e3f0ff', color: '#1a73e8' },
          { label: 'Checked In Today', value: stats?.checkedInToday || 0, bg: '#e8f5e9', color: '#2e7d32' },
          { label: 'Late Today', value: stats?.lateToday || 0, bg: '#fff3e0', color: '#ef6c00' },
          { label: 'Absent Today', value: stats?.absentToday || 0, bg: '#fce4ec', color: '#e53935' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 160, background: s.bg, borderRadius: 14, padding: '22px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly Stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Month Present', value: stats?.monthPresent || 0, bg: '#e8f5e9', color: '#2e7d32' },
          { label: 'Month Late', value: stats?.monthLate || 0, bg: '#fff3e0', color: '#ef6c00' },
          { label: 'Month Absent', value: stats?.monthAbsent || 0, bg: '#fce4ec', color: '#e53935' },
          { label: 'Month Half-day', value: stats?.monthHalfDay || 0, bg: '#ede7f6', color: '#5e35b1' },
          { label: 'Total Hours', value: `${(stats?.monthTotalHours || 0).toFixed(1)}h`, bg: '#fff8e1', color: '#f9a825' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 140, background: s.bg, borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: '📋 All Attendance', path: '/manager/attendance', bg: 'linear-gradient(135deg, #1a73e8, #0d47a1)' },
          { label: '📅 Team Calendar', path: '/manager/calendar', bg: 'linear-gradient(135deg, #43a047, #2e7d32)' },
          { label: '📊 Reports & Export', path: '/manager/reports', bg: 'linear-gradient(135deg, #e53935, #b71c1c)' },
        ].map((a, i) => (
          <button key={i} onClick={() => navigate(a.path)} style={{
            flex: 1, minWidth: 160, padding: '14px 0', border: 'none', borderRadius: 10,
            background: a.bg, color: '#fff', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Department Breakdown */}
      {stats?.departmentStats?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>Department Overview</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f6f9' }}>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Total Staff</th>
                <th style={thStyle}>Present Today</th>
                <th style={thStyle}>Absent Today</th>
                <th style={thStyle}>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.departmentStats.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}><span style={{ fontWeight: 600 }}>{d.department}</span></td>
                  <td style={tdStyle}>{d.total}</td>
                  <td style={{ ...tdStyle, color: '#2e7d32', fontWeight: 600 }}>{d.presentToday}</td>
                  <td style={{ ...tdStyle, color: '#e53935', fontWeight: 600 }}>{d.absentToday}</td>
                  <td style={tdStyle}>
                    <div style={{ background: '#f0f0f0', borderRadius: 10, height: 8, width: 100, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
                      <div style={{ background: '#43a047', borderRadius: 10, height: 8, width: `${d.total ? (d.presentToday / d.total * 100) : 0}%` }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{d.total ? Math.round(d.presentToday / d.total * 100) : 0}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Team Activity */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>Recent Team Activity</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6f9' }}>
              <th style={thStyle}>Employee</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Check In</th>
              <th style={thStyle}>Check Out</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(!stats?.recentTeam || stats.recentTeam.length === 0) && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20, color: '#aaa' }}>No records yet</td></tr>
            )}
            {stats?.recentTeam?.map(rec => (
              <tr key={rec._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{rec.userId?.name}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{rec.userId?.employeeId}</div>
                </td>
                <td style={tdStyle}>{rec.userId?.department || '-'}</td>
                <td style={tdStyle}>{rec.date ? new Date(rec.date).toLocaleDateString() : ''}</td>
                <td style={tdStyle}>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-'}</td>
                <td style={tdStyle}>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                <td style={tdStyle}><StatusBadge status={rec.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#555' };
const tdStyle = { padding: '10px 12px', fontSize: 14, color: '#333' };

export default ManagerDashboard;
