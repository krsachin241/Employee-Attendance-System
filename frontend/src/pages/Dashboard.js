import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const card = (bg, icon, label, value) => ({
  background: bg, borderRadius: 14, padding: '24px 20px', minWidth: 160, flex: 1,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4,
});

function Dashboard() {
  const user = useSelector(state => state.auth.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/dashboard/employee`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load dashboard');
        setStats(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    if (user) fetchDashboard();
  }, [user]);

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert('Checked in successfully!');
      window.location.reload();
    } catch (err) { alert(err.message); }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(`Checked out! Hours: ${data.totalHours}, Status: ${data.status}`);
      window.location.reload();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#e53935' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>
        Welcome, {user?.name} 👋
      </h2>
      <p style={{ color: '#888', marginBottom: 28, fontSize: 15 }}>Here's your attendance overview</p>

      {/* Today's Status */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ ...card('#e3f0ff'), flex: 1 }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Today's Status</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: stats?.todayStatus === 'Checked In' ? '#2e7d32' : '#e53935' }}>
            {stats?.todayStatus || 'Not Checked In'}
          </span>
        </div>
        <div style={{ ...card('#e8f5e9'), flex: 1 }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Present Days</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#2e7d32' }}>{stats?.monthlyPresent || 0}</span>
        </div>
        <div style={{ ...card('#fff3e0'), flex: 1 }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Late Days</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#ef6c00' }}>{stats?.monthlyLate || 0}</span>
        </div>
        <div style={{ ...card('#fce4ec'), flex: 1 }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Absent Days</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#e53935' }}>{stats?.monthlyAbsent || 0}</span>
        </div>
        <div style={{ ...card('#ede7f6'), flex: 1 }}>
          <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Total Hours</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#5e35b1' }}>{stats?.totalHours?.toFixed(1) || 0}h</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <button onClick={handleCheckIn} style={{
          flex: 1, padding: '14px 0', border: 'none', borderRadius: 10,
          background: 'linear-gradient(135deg, #43a047, #2e7d32)', color: '#fff',
          fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(46,125,50,0.3)',
        }}>
          ✅ Check In
        </button>
        <button onClick={handleCheckOut} style={{
          flex: 1, padding: '14px 0', border: 'none', borderRadius: 10,
          background: 'linear-gradient(135deg, #e53935, #b71c1c)', color: '#fff',
          fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(229,57,53,0.3)',
        }}>
          🚪 Check Out
        </button>
        <button onClick={() => navigate('/attendance-history')} style={{
          flex: 1, padding: '14px 0', border: 'none', borderRadius: 10,
          background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: '#fff',
          fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(26,115,232,0.3)',
        }}>
          📊 View History
        </button>
      </div>

      {/* Recent Attendance */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Recent Attendance (Last 7 Days)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f6f9' }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Check In</th>
              <th style={thStyle}>Check Out</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Hours</th>
            </tr>
          </thead>
          <tbody>
            {(!stats?.recentAttendance || stats.recentAttendance.length === 0) && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20, color: '#aaa' }}>No records yet</td></tr>
            )}
            {stats?.recentAttendance?.map(rec => (
              <tr key={rec._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>{new Date(rec.date).toLocaleDateString()}</td>
                <td style={tdStyle}>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-'}</td>
                <td style={tdStyle}>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                <td style={tdStyle}><StatusBadge status={rec.status} /></td>
                <td style={tdStyle}>{rec.totalHours != null ? rec.totalHours : '-'}</td>
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

export default Dashboard;
