import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

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

function AttendanceHistory() {
  const user = useSelector(state => state.auth.user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/attendance/history/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error fetching history');
        setHistory(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    if (user) fetchHistory();
  }, [user]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/attendance/monthly-summary/${user.id}/${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error fetching summary');
        setSummary(data);
      } catch (err) { setSummary(null); }
    };
    if (user) fetchSummary();
  }, [month, user]);

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Attendance History</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>View your past attendance and monthly summary</p>

      {/* Month Picker & Summary */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8 }}>Select Month</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            style={{ padding: '8px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 15, width: '100%', boxSizing: 'border-box' }} />
        </div>
        {summary && (
          <>
            <div style={{ background: '#e8f5e9', borderRadius: 14, padding: 20, flex: 1, minWidth: 120, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Present</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2e7d32' }}>{summary.present}</div>
            </div>
            <div style={{ background: '#fce4ec', borderRadius: 14, padding: 20, flex: 1, minWidth: 120, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Absent</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e53935' }}>{summary.absent}</div>
            </div>
            <div style={{ background: '#fff3e0', borderRadius: 14, padding: 20, flex: 1, minWidth: 120, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Late</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ef6c00' }}>{summary.late}</div>
            </div>
            <div style={{ background: '#ede7f6', borderRadius: 14, padding: 20, flex: 1, minWidth: 120, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Half-day</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#5e35b1' }}>{summary['half-day']}</div>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {loading && <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading...</div>}
        {error && <div style={{ color: '#e53935', textAlign: 'center', padding: 20 }}>{error}</div>}
        {!loading && !error && (
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
              {history.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20, color: '#aaa' }}>No records found</td></tr>
              )}
              {history.map(rec => (
                <tr key={rec._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{rec.date ? new Date(rec.date).toLocaleDateString() : ''}</td>
                  <td style={tdStyle}>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-'}</td>
                  <td style={tdStyle}>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                  <td style={tdStyle}><StatusBadge status={rec.status} /></td>
                  <td style={tdStyle}>{rec.totalHours != null ? rec.totalHours : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#555' };
const tdStyle = { padding: '10px 12px', fontSize: 14, color: '#333' };

export default AttendanceHistory;
