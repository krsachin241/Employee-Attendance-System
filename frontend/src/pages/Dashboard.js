import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const card = (bg, icon, label, value) => ({
  background: bg,
  borderRadius: 18,
  padding: '22px 16px',
  maxWidth: '100%',
  flex: 1,
  boxShadow: '0 4px 18px rgba(26,115,232,0.07)',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  alignItems: 'flex-start',
  border: '1.5px solid #e3eafc',
  transition: 'box-shadow 0.2s, transform 0.2s',
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
    <div className="dashboard-main" style={{ maxWidth: 900, margin: '32px auto', padding: '0 0', width: '100vw', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>
        Welcome, {user?.name} 👋
      </h2>
      <p style={{ color: '#888', marginBottom: 28, fontSize: 15 }}>Here's your attendance overview</p>

      {/* Today's Status */}
      <div className="dashboard-cards" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 28, flexDirection: 'row', width: '100%' }}>
        <div style={{ ...card('linear-gradient(135deg,#e3f0ff,#f5faff)', '🟢'), flex: 1, maxWidth: '100%' }}>
          <span style={{ fontSize: 15, color: '#1a73e8', fontWeight: 700, marginBottom: 2, letterSpacing: 0.2 }}>🟢 Today's Status</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: stats?.todayStatus === 'Checked In' ? '#2e7d32' : '#e53935', marginBottom: 2 }}>
            {stats?.todayStatus || 'Not Checked In'}
          </span>
        </div>
        <div style={{ ...card('linear-gradient(135deg,#e8f5e9,#f5fff7)', '✅'), flex: 1, maxWidth: '100%' }}>
          <span style={{ fontSize: 15, color: '#43a047', fontWeight: 700, marginBottom: 2 }}>✅ Present Days</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#2e7d32', marginBottom: 2 }}>{stats?.monthlyPresent || 0}</span>
        </div>
        <div style={{ ...card('linear-gradient(135deg,#fff3e0,#fff8e1)', '⏰'), flex: 1, maxWidth: '100%' }}>
          <span style={{ fontSize: 15, color: '#ef6c00', fontWeight: 700, marginBottom: 2 }}>⏰ Late Days</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#ef6c00', marginBottom: 2 }}>{stats?.monthlyLate || 0}</span>
        </div>
        <div style={{ ...card('linear-gradient(135deg,#fce4ec,#fff0f6)', '❌'), flex: 1, maxWidth: '100%' }}>
          <span style={{ fontSize: 15, color: '#e53935', fontWeight: 700, marginBottom: 2 }}>❌ Absent Days</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#e53935', marginBottom: 2 }}>{stats?.monthlyAbsent || 0}</span>
        </div>
        <div style={{ ...card('linear-gradient(135deg,#ede7f6,#f3e8fd)', '⏱️'), flex: 1, maxWidth: '100%' }}>
          <span style={{ fontSize: 15, color: '#5e35b1', fontWeight: 700, marginBottom: 2 }}>⏱️ Total Hours</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#5e35b1', marginBottom: 2 }}>{stats?.totalHours?.toFixed(1) || 0}h</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions" style={{ display: 'flex', gap: 16, marginBottom: 32, flexDirection: 'row', flexWrap: 'wrap' }}>
        <button onClick={handleCheckIn} style={{
          flex: 1,
          padding: '14px 0',
          border: 'none',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #43a047, #2e7d32)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 17,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(46,125,50,0.18)',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(46,125,50,0.22)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(46,125,50,0.18)'; e.currentTarget.style.transform = 'none'; }}
        >
          ✅ Check In
        </button>
        <button onClick={handleCheckOut} style={{
          flex: 1,
          padding: '14px 0',
          border: 'none',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #e53935, #b71c1c)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 17,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(229,57,53,0.18)',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(229,57,53,0.22)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(229,57,53,0.18)'; e.currentTarget.style.transform = 'none'; }}
        >
          🚪 Check Out
        </button>
        <button onClick={() => navigate('/attendance-history')} style={{
          flex: 1,
          padding: '14px 0',
          border: 'none',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 17,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(26,115,232,0.18)',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,115,232,0.22)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,115,232,0.18)'; e.currentTarget.style.transform = 'none'; }}
        >
          📊 View History
        </button>
      </div>

      {/* Recent Attendance */}
      <div className="dashboard-table" style={{ background: '#fff', borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', width: '100%', overflowX: 'auto', marginTop: 18 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Recent Attendance (Last 7 Days)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
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
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-main {
            padding-left: 0 !important;
            padding-right: 0 !important;
            width: 100vw !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
        @media (max-width: 700px) {
          .dashboard-main {
            padding-left: 0 !important;
            padding-right: 0 !important;
            width: 100vw !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .dashboard-cards {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .dashboard-cards > div {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            padding: 16px 10px !important;
            margin-bottom: 8px !important;
          }
          .dashboard-actions {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .dashboard-actions > button {
            min-width: 0 !important;
            width: 100% !important;
            border-radius: 10px !important;
            font-size: 16px !important;
            padding: 12px 0 !important;
          }
          .dashboard-table {
            min-width: 0 !important;
            max-width: 100vw !important;
            box-shadow: none !important;
            padding: 6px 0 !important;
            border-radius: 10px !important;
          }
          .dashboard-table table {
            min-width: 400px !important;
          }
        }
      `}</style>
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
