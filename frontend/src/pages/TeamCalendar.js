import React, { useEffect, useState } from 'react';

function TeamCalendar() {
  const [calendarData, setCalendarData] = useState({});
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/attendance/calendar/${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load calendar');
        setCalendarData(data.calendarData || {});
        setTotalEmployees(data.totalEmployees || 0);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchCalendar();
    setSelectedDate(null);
  }, [month]);

  // Build calendar grid
  const [year, m] = month.split('-').map(Number);
  const firstDay = new Date(year, m - 1, 1).getDay();
  const daysInMonth = new Date(year, m, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const getDateStr = (day) => `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayColor = (day) => {
    const ds = getDateStr(day);
    const data = calendarData[ds];
    if (!data) return '#fafafa';
    const total = data.present + data.late + data['half-day'];
    const rate = totalEmployees ? total / totalEmployees : 0;
    if (rate >= 0.9) return '#c8e6c9';
    if (rate >= 0.7) return '#fff9c4';
    if (rate >= 0.5) return '#ffe0b2';
    return '#ffcdd2';
  };

  const selectedData = selectedDate ? calendarData[getDateStr(selectedDate)] : null;

  return (
    <div className="team-calendar-main" style={{ maxWidth: 1000, margin: '32px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Team Calendar View</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>Visual team attendance for the month</p>

      {/* Month picker */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => {
          const d = new Date(year, m - 2, 1);
          setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }} style={navBtn}>← Prev</button>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 15 }} />
        <button onClick={() => {
          const d = new Date(year, m, 1);
          setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }} style={navBtn}>Next →</button>
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</div>}
      {error && <div style={{ color: '#e53935', textAlign: 'center', padding: 20 }}>{error}</div>}

      {!loading && !error && (
        <div className="team-calendar-content" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Calendar Grid */}
          <div className="team-calendar-grid" style={{ flex: 2, minWidth: 340, background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {/* Day Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontWeight: 700, fontSize: 12, color: '#888', padding: 6 }}>{d}</div>
              ))}
            </div>
            {/* Day Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {calDays.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />;
                const ds = getDateStr(day);
                const data = calendarData[ds];
                const isToday = ds === todayStr;
                const isSelected = selectedDate === day;
                const isWeekend = new Date(year, m - 1, day).getDay() % 6 === 0;
                return (
                  <div key={day} onClick={() => setSelectedDate(day)} style={{
                    background: isSelected ? '#1a73e8' : getDayColor(day),
                    border: isToday ? '2px solid #1a73e8' : '1px solid #eee',
                    borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.15s', minHeight: 60,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? '#fff' : isWeekend ? '#bbb' : '#333' }}>{day}</div>
                    {data && (
                      <div style={{ marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: isSelected ? '#ddd' : '#2e7d32', fontWeight: 600 }}>
                          {data.present + data.late + data['half-day']}
                        </span>
                        <span style={{ fontSize: 10, color: isSelected ? '#eee' : '#999' }}>/{totalEmployees}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { color: '#c8e6c9', label: '≥90%' },
                { color: '#fff9c4', label: '70-89%' },
                { color: '#ffe0b2', label: '50-69%' },
                { color: '#ffcdd2', label: '<50%' },
                { color: '#fafafa', label: 'No data' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: '1px solid #ddd' }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Day Detail Panel */}
          <div className="team-calendar-detail" style={{ flex: 1, minWidth: 280, background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxHeight: 500, overflowY: 'auto' }}>
            {!selectedDate ? (
              <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
                <div>Click a day to see details</div>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>
                  {new Date(year, m - 1, selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                {!selectedData ? (
                  <div style={{ color: '#aaa', padding: '20px 0' }}>No attendance data for this day</div>
                ) : (
                  <>
                    {/* Summary pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      <span style={{ ...pill, background: '#e8f5e9', color: '#2e7d32' }}>Present: {selectedData.present}</span>
                      <span style={{ ...pill, background: '#fff3e0', color: '#ef6c00' }}>Late: {selectedData.late}</span>
                      <span style={{ ...pill, background: '#ede7f6', color: '#5e35b1' }}>Half-day: {selectedData['half-day']}</span>
                    </div>
                    {/* Employee list */}
                    {selectedData.records.map((r, i) => (
                      <div key={i} style={{ padding: '10px 0', borderBottom: i < selectedData.records.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: '#999' }}>{r.employeeId} • {r.department || 'N/A'}</div>
                          </div>
                          <span style={{
                            padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                            background: r.status === 'present' ? '#e8f5e9' : r.status === 'late' ? '#fff3e0' : '#ede7f6',
                            color: r.status === 'present' ? '#2e7d32' : r.status === 'late' ? '#ef6c00' : '#5e35b1',
                          }}>{r.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'} → {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}
                          {r.totalHours && <span> ({r.totalHours}h)</span>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    {/* Responsive styles */}
    <style>{`
      @media (max-width: 900px) {
        .team-calendar-main {
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        .team-calendar-content {
          flex-direction: column !important;
          gap: 12px !important;
        }
        .team-calendar-grid, .team-calendar-detail {
          width: 100% !important;
          min-width: 0 !important;
          border-radius: 10px !important;
          box-shadow: none !important;
        }
      }
      @media (max-width: 600px) {
        .team-calendar-main {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .team-calendar-content {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .team-calendar-grid, .team-calendar-detail {
          width: 100% !important;
          min-width: 0 !important;
          border-radius: 8px !important;
          box-shadow: none !important;
          padding-left: 6px !important;
          padding-right: 6px !important;
        }
      }
    `}</style>
    </div>
  );
}

const navBtn = {
  padding: '8px 18px', border: '1.5px solid #ddd', borderRadius: 8,
  background: '#fff', color: '#333', fontWeight: 600, fontSize: 14, cursor: 'pointer',
};
const pill = { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 };

export default TeamCalendar;
