import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

function MarkAttendance() {
  const user = useSelector(state => state.auth.user);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchToday = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTodayRecord(data.record || null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchToday(); }, [user]);

  const handleCheckIn = async () => {
    setMsg(''); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg('✅ Checked in successfully!');
      fetchToday();
    } catch (err) { setError(err.message); }
  };

  const handleCheckOut = async () => {
    setMsg(''); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg(`🚪 Checked out! Hours: ${data.totalHours}, Status: ${data.status}`);
      fetchToday();
    } catch (err) { setError(err.message); }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString();

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Mark Attendance</h2>
      <p style={{ color: '#888', marginBottom: 28 }}>{dateStr} &bull; {timeStr}</p>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          {/* Status */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Today's Status</div>
            {!todayRecord ? (
              <div style={{ fontSize: 20, fontWeight: 700, color: '#e53935' }}>Not Checked In</div>
            ) : todayRecord.checkOutTime ? (
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2e7d32' }}>
                Day Complete — {todayRecord.totalHours}h ({todayRecord.status})
              </div>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a73e8' }}>
                Checked In at {new Date(todayRecord.checkInTime).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Check In/Out details */}
          {todayRecord && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>Check In</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2e7d32' }}>
                  {todayRecord.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString() : '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>Check Out</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e53935' }}>
                  {todayRecord.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString() : '-'}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button onClick={handleCheckIn} disabled={!!todayRecord} style={{
              padding: '14px 40px', border: 'none', borderRadius: 10,
              background: todayRecord ? '#ccc' : 'linear-gradient(135deg, #43a047, #2e7d32)',
              color: '#fff', fontWeight: 700, fontSize: 16, cursor: todayRecord ? 'not-allowed' : 'pointer',
              boxShadow: todayRecord ? 'none' : '0 2px 8px rgba(46,125,50,0.3)',
            }}>
              ✅ Check In
            </button>
            <button onClick={handleCheckOut} disabled={!todayRecord || !!todayRecord?.checkOutTime} style={{
              padding: '14px 40px', border: 'none', borderRadius: 10,
              background: (!todayRecord || todayRecord?.checkOutTime) ? '#ccc' : 'linear-gradient(135deg, #e53935, #b71c1c)',
              color: '#fff', fontWeight: 700, fontSize: 16,
              cursor: (!todayRecord || todayRecord?.checkOutTime) ? 'not-allowed' : 'pointer',
              boxShadow: (!todayRecord || todayRecord?.checkOutTime) ? 'none' : '0 2px 8px rgba(229,57,53,0.3)',
            }}>
              🚪 Check Out
            </button>
          </div>

          {msg && <div style={{ color: '#2e7d32', background: '#e8f5e9', borderRadius: 8, padding: '10px 14px', marginTop: 20, fontWeight: 600 }}>{msg}</div>}
          {error && <div style={{ color: '#e53935', background: '#ffeaea', borderRadius: 8, padding: '10px 14px', marginTop: 20, fontWeight: 600 }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default MarkAttendance;
