import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const STATUS_COLORS = {
  present: { bg: '#4caf50', text: '#fff', light: '#e8f5e9', dark: '#2e7d32', label: 'Present' },
  late: { bg: '#ffc107', text: '#fff', light: '#fff3e0', dark: '#ef6c00', label: 'Late' },
  absent: { bg: '#f44336', text: '#fff', light: '#fce4ec', dark: '#e53935', label: 'Absent' },
  'half-day': { bg: '#ff9800', text: '#fff', light: '#fff3e0', dark: '#e65100', label: 'Half Day' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { light: '#f5f5f5', dark: '#888' };
  return (
    <span style={{ background: c.light, color: c.dark, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/attendance/my-history', {
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
        const res = await fetch(`/api/attendance/my-summary?month=${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error fetching summary');
        setSummary(data);
      } catch (err) { setSummary(null); }
    };
    if (user) fetchSummary();
  }, [month, user]);

  // Calendar helpers
  const [calYear, calMonth] = month.split('-').map(Number);
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay(); // 0=Sun

  // Build a map: dateStr -> record
  const recordMap = {};
  history.forEach(rec => {
    if (rec.date) {
      const d = new Date(rec.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      recordMap[key] = rec;
    }
  });

  const todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })();

  const navigateMonth = (dir) => {
    let y = calYear, m = calMonth + dir;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(`${y}-${String(m).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const selectedRecord = selectedDate ? recordMap[selectedDate] : null;
  const monthName = new Date(calYear, calMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: 1000,
      margin: '0 auto',
      padding: '0 8px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, width: '100%', maxWidth: 900 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4, margin: 0 }}>📅 Attendance History</h2>
          <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>Track your attendance with calendar & table views</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#f0f2f5', borderRadius: 10, padding: 3 }}>
          <button onClick={() => setViewMode('calendar')}
            style={{ ...viewBtnStyle, ...(viewMode === 'calendar' ? viewBtnActive : {}) }}>📅 Calendar</button>
          <button onClick={() => setViewMode('table')}
            style={{ ...viewBtnStyle, ...(viewMode === 'table' ? viewBtnActive : {}) }}>📋 Table</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap',
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 900,
      }}>
        {[
          { key: 'present', icon: '✅', label: 'Present', color: STATUS_COLORS.present },
          { key: 'absent', icon: '❌', label: 'Absent', color: STATUS_COLORS.absent },
          { key: 'late', icon: '⏰', label: 'Late', color: STATUS_COLORS.late },
          { key: 'half-day', icon: '🌗', label: 'Half Day', color: STATUS_COLORS['half-day'] },
        ].map(s => (
          <div key={s.key} style={{
            flex: 1,
            minWidth: 130,
            background: '#fff',
            borderRadius: 14,
            padding: '18px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${s.color.bg}`,
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 8,
            maxWidth: '100%',
          }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color.dark }}>{summary ? (summary[s.key] || 0) : '-'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', width: '100%', maxWidth: 900 }}>
        {Object.entries(STATUS_COLORS).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: val.bg, display: 'inline-block' }}></span>
            {val.label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: '#e0e0e0', display: 'inline-block' }}></span>
          No Record
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</div>}
      {error && <div style={{ color: '#e53935', textAlign: 'center', padding: 20 }}>{error}</div>}

      {!loading && !error && viewMode === 'calendar' && (
        <div style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 900,
        }}>
          {/* Calendar */}
          <div style={{
            flex: 2,
            minWidth: 240,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            overflow: 'hidden',
            width: '100%',
            maxWidth: 600,
          }}>
            {/* Month Navigation */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', background: '#f5f8fd', color: '#232B3E',
              borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottom: '1.5px solid #e0e0e0',
            }}>
              <button onClick={() => navigateMonth(-1)} style={navBtnStyle}>◀</button>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{monthName}</div>
              <button onClick={() => navigateMonth(1)} style={navBtnStyle}>▶</button>
            </div>

            {/* Day Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8f9fb' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#888' }}>{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: 8 }}>
              {/* Empty cells for first week offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`e-${i}`} style={{ height: 58 }}></div>
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const rec = recordMap[dateStr];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const isPast = new Date(dateStr) < new Date(todayStr);
                const isWeekend = new Date(calYear, calMonth - 1, day).getDay() === 0 || new Date(calYear, calMonth - 1, day).getDay() === 6;

                let bgColor = '#f5f5f5';
                let dotColor = null;
                if (rec) {
                  const sc = STATUS_COLORS[rec.status];
                  bgColor = sc ? sc.bg : '#e0e0e0';
                  dotColor = null;
                } else if (isPast && !isWeekend) {
                  bgColor = '#e0e0e0'; // no record, past weekday
                }

                return (
                  <div key={day} onClick={() => setSelectedDate(dateStr)}
                    style={{
                      height: 58, borderRadius: 10, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      background: isSelected ? '#1a73e8' : bgColor,
                      color: isSelected ? '#fff' : (rec ? '#fff' : '#555'),
                      border: isToday ? '2.5px solid #1a73e8' : '2px solid transparent',
                      transition: 'all 0.15s', position: 'relative',
                      fontWeight: isToday ? 800 : 500,
                    }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{day}</span>
                    {rec && !isSelected && (
                      <span style={{ fontSize: 9, fontWeight: 700, marginTop: 2, textTransform: 'uppercase', opacity: 0.9 }}>
                        {rec.status === 'half-day' ? 'HALF' : rec.status.slice(0, 4).toUpperCase()}
                      </span>
                    )}
                    {isSelected && rec && (
                      <span style={{ fontSize: 9, fontWeight: 700, marginTop: 2, textTransform: 'uppercase' }}>
                        {rec.status === 'half-day' ? 'HALF' : rec.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          <div style={{
            flex: 1,
            minWidth: 180,
            width: '100%',
            maxWidth: 400,
            marginTop: 12,
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
              padding: 16,
              minHeight: 220,
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: 16 }}>
                📋 Day Details
              </h3>
              {!selectedDate && (
                <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👆</div>
                  Click on a date in the calendar to view details
                </div>
              )}
              {selectedDate && !selectedRecord && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{
                    display: 'inline-block', background: '#fce4ec', color: '#e53935',
                    padding: '6px 20px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginTop: 8
                  }}>
                    No attendance record
                  </div>
                </div>
              )}
              {selectedDate && selectedRecord && (() => {
                const rec = selectedRecord;
                const sc = STATUS_COLORS[rec.status] || STATUS_COLORS.present;
                return (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16 }}>
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{
                      display: 'inline-block', background: sc.bg, color: '#fff',
                      padding: '6px 20px', borderRadius: 20, fontSize: 14, fontWeight: 700, marginBottom: 20, textTransform: 'capitalize'
                    }}>
                      {rec.status}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                      <DetailRow icon="🕐" label="Check In" value={rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : 'N/A'} />
                      <DetailRow icon="🕕" label="Check Out" value={rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : 'N/A'} />
                      <DetailRow icon="⏱️" label="Total Hours" value={rec.totalHours != null ? `${rec.totalHours} hrs` : 'N/A'} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {!loading && !error && viewMode === 'table' && (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', width: '100%', maxWidth: 900, overflowX: 'auto', margin: '0 auto' }}>
          {/* Month picker inside table view */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>Month:</label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              style={{ padding: '6px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          </div>
          <div style={{ padding: '0 8px 16px', overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#f4f6f9' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Day</th>
                  <th style={thStyle}>Check In</th>
                  <th style={thStyle}>Check Out</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Hours</th>
                </tr>
              </thead>
              <style>{`
                @media (max-width: 900px) {
                  .attendance-history-main {
                    padding-left: 8px !important;
                    padding-right: 8px !important;
                  }
                }
                @media (max-width: 700px) {
                  .attendance-history-main {
                    padding-left: 4px !important;
                    padding-right: 4px !important;
                  }
                  .attendance-history-cards {
                    flex-direction: column !important;
                    gap: 8px !important;
                  }
                  .attendance-history-calendar {
                    min-width: 0 !important;
                    max-width: 100vw !important;
                    box-shadow: none !important;
                  }
                  .attendance-history-detail {
                    min-width: 0 !important;
                    max-width: 100vw !important;
                    margin-top: 8px !important;
                    box-shadow: none !important;
                  }
                  .attendance-history-table {
                    min-width: 0 !important;
                    max-width: 100vw !important;
                    box-shadow: none !important;
                    overflow-x: auto !important;
                  }
                  .attendance-history-table table {
                    min-width: 400px !important;
                  }
                }
              `}</style>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8f9fb', borderRadius: 10 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#333' }}>{value}</div>
      </div>
    </div>
  );
}

const navBtnStyle = { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', borderRadius: 8, padding: '6px 12px', fontWeight: 700 };
const viewBtnStyle = { border: 'none', background: 'transparent', padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 8, color: '#666' };
const viewBtnActive = { background: '#fff', color: '#1a73e8', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#555' };
const tdStyle = { padding: '10px 12px', fontSize: 14, color: '#333' };

export default AttendanceHistory;
