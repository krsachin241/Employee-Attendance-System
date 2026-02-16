import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KpiCard from '../components/KpiCard';

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const map = {
    present: { bg: '#DCFCE7', color: '#166534', label: 'Present' },
    late: { bg: '#FEF3C7', color: '#92400E', label: 'Late' },
    absent: { bg: '#FEE2E2', color: '#991B1B', label: 'Absent' },
    'half-day': { bg: '#EDE9FE', color: '#5B21B6', label: 'Half Day' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '4px 14px',
      borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
      display: 'inline-block',
    }}>
      {s.label}
    </span>
  );
}

/* ── Mini Calendar ── */
function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12, textAlign: 'center' }}>
        {monthName}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94A3B8', padding: '4px 0' }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          return (
            <div key={day} style={{
              textAlign: 'center', fontSize: 12, fontWeight: isToday ? 800 : 500,
              padding: '5px 0', borderRadius: 8,
              background: isToday ? '#1E3A8A' : 'transparent',
              color: isToday ? '#fff' : '#334155',
              cursor: 'default',
            }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Custom Recharts Tooltip ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0F172A', color: '#fff', padding: '10px 14px',
      borderRadius: 10, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div>Attendance: <span style={{ fontWeight: 700, color: '#60A5FA' }}>{payload[0].value}</span></div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ════════════════════════════════════════════ */
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
        const res = await fetch('/api/dashboard/manager', {
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>📊</div>
        <div style={{ fontSize: 15, color: '#64748B', fontWeight: 500 }}>Loading dashboard data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 16,
      padding: '24px 32px', margin: 32, color: '#991B1B',
    }}>
      <strong>Error:</strong> {error}
    </div>
  );

  // Prepare weekly chart data for Recharts
  const weeklyChartData = (stats?.weeklyTrend || []).map(d => ({
    name: d.dayLabel,
    attendance: d.total,
    present: d.present,
    late: d.late,
  }));

  // Dept colors
  const deptColors = ['#3B82F6', '#0D9488', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

  // Calc on-leave as absent (since no separate leave field)
  const totalEmp = stats?.totalEmployees || 0;
  const presentToday = stats?.checkedInToday || 0;
  const lateToday = stats?.lateToday || 0;
  const absentToday = stats?.absentToday || 0;

  return (
    <div style={{ display: 'flex', gap: 24, minHeight: 'calc(100vh - 120px)' }}>
      {/* ═══ LEFT MAIN CONTENT ═══ */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* KPI Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          <KpiCard title="Total Employees" value={totalEmp} total={totalEmp} icon="👥" color="#1E3A8A" bgGradient="linear-gradient(135deg, #1E3A8A, #3B82F6)" />
          <KpiCard title="Present Today" value={presentToday} total={totalEmp} icon="✅" color="#0D9488" bgGradient="linear-gradient(135deg, #0D9488, #14B8A6)" />
          <KpiCard title="Absent Today" value={absentToday} total={totalEmp} icon="❌" color="#DC2626" bgGradient="linear-gradient(135deg, #DC2626, #EF4444)" />
          <KpiCard title="Late Arrivals" value={lateToday} total={totalEmp} icon="⏰" color="#D97706" bgGradient="linear-gradient(135deg, #D97706, #F59E0B)" />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

          {/* Weekly Attendance Trend - Recharts BarChart */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            border: '1px solid #F1F5F9',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Weekly Attendance Trend</h3>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0', fontWeight: 500 }}>Last 7 days employee check-in</p>
              </div>
              <div style={{
                padding: '4px 12px', borderRadius: 8,
                background: '#F0FDF4', color: '#166534',
                fontSize: 12, fontWeight: 700,
              }}>
                📈 {weeklyChartData.length} days
              </div>
            </div>
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyChartData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    domain={[0, totalEmp || 'auto']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                  <Bar dataKey="attendance" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: 40 }}>No weekly data available</div>
            )}
          </div>

          {/* Department Attendance */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            border: '1px solid #F1F5F9',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, marginBottom: 4 }}>Department Attendance</h3>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 18px', fontWeight: 500 }}>Present today by department</p>
            {(stats?.departmentStats || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(stats?.departmentStats || []).map((d, i) => {
                  const rate = d.total ? Math.round((d.presentToday / d.total) * 100) : 0;
                  const clr = deptColors[i % deptColors.length];
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{d.department}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: clr }}>
                          {d.presentToday}/{d.total}
                        </span>
                      </div>
                      <div style={{
                        background: '#F1F5F9', borderRadius: 10, height: 8, overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${rate}%`, height: '100%', borderRadius: 10,
                          background: clr, transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: 30 }}>No departments</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'All Attendance', icon: '📋', path: '/manager/attendance', color: '#1E3A8A', bg: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' },
            { label: 'Team Calendar', icon: '📅', path: '/manager/calendar', color: '#0D9488', bg: 'linear-gradient(135deg, #0D9488, #14B8A6)' },
            { label: 'Reports & Export', icon: '📊', path: '/manager/reports', color: '#DC2626', bg: 'linear-gradient(135deg, #DC2626, #F87171)' },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 12px ${a.color}30`; }}
              style={{
                padding: '16px 20px', border: 'none', borderRadius: 14,
                background: a.bg, color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                boxShadow: `0 4px 12px ${a.color}30`,
              }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>

        {/* Employee Attendance Table */}
        <div style={{
          background: '#fff', borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #F1F5F9', overflow: 'hidden', marginBottom: 24,
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Employee Attendance</h3>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0', fontWeight: 500 }}>Recent team activity</p>
            </div>
            <button onClick={() => navigate('/manager/attendance')}
              style={{
                padding: '6px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8,
                background: '#fff', color: '#3B82F6', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#3B82F6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
            >
              View All →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Check In</th>
                  <th style={thStyle}>Check Out</th>
                  <th style={thStyle}>Hours</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!stats?.recentTeam || stats.recentTeam.length === 0) && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                      No attendance records yet
                    </td>
                  </tr>
                )}
                {stats?.recentTeam?.map((rec, idx) => {
                  const hours = rec.totalHours != null ? rec.totalHours : '-';
                  return (
                    <tr key={rec._id} style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: idx % 2 === 0 ? '#fff' : '#FAFBFC',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F0F7FF'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFBFC'}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: `hsl(${((rec.userId?.name?.charCodeAt(0) || 65) * 37) % 360}, 60%, 50%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                          }}>
                            {rec.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{rec.userId?.name || 'N/A'}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, fontFamily: 'monospace' }}>{rec.userId?.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          background: '#F1F5F9', padding: '3px 10px', borderRadius: 6,
                          fontSize: 12, fontWeight: 600, color: '#475569',
                        }}>
                          {rec.userId?.department || '-'}
                        </span>
                      </td>
                      <td style={tdStyle}>{rec.date ? new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</td>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0D9488', fontSize: 13 }}>
                          {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748B', fontSize: 13 }}>
                          {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 700, color: '#334155', fontSize: 13 }}>
                          {hours !== '-' ? `${hours}h` : '-'}
                        </span>
                      </td>
                      <td style={tdStyle}><StatusBadge status={rec.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Absent Employees */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, background: '#FEE2E2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>❌</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Absent Today
            </h3>
            <span style={{
              background: '#FEE2E2', color: '#DC2626', padding: '2px 10px',
              borderRadius: 12, fontSize: 12, fontWeight: 700, marginLeft: 4,
            }}>
              {stats?.absentEmployees?.length || 0}
            </span>
          </div>

          {(!stats?.absentEmployees || stats.absentEmployees.length === 0) ? (
            <div style={{
              textAlign: 'center', padding: '24px 0', color: '#0D9488',
              background: '#F0FDFA', borderRadius: 12,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>All employees are present today!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {stats.absentEmployees.map((emp, i) => (
                <div key={i} style={{
                  background: '#FEF2F2', borderRadius: 12, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: '1px solid #FECACA', transition: 'transform 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}>
                    {emp.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{emp.employeeId} • {emp.department || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT SIDEBAR PANEL ═══ */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Mini Calendar */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, background: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>📅</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Calendar</h4>
          </div>
          <MiniCalendar />
        </div>

        {/* Top Performing Employees */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, background: '#FEF3C7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>🏆</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Top Performers</h4>
          </div>
          {/* Use recentTeam data (show top employees by hours) */}
          {(() => {
            const topEmployees = (stats?.recentTeam || [])
              .filter(r => r.totalHours != null && r.totalHours > 0)
              .sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0))
              .slice(0, 5);

            if (topEmployees.length === 0) {
              return <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '16px 0' }}>No data yet</div>;
            }

            return topEmployees.map((emp, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: i < topEmployees.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i === 0 ? '#FEF3C7' : i === 1 ? '#F1F5F9' : '#FED7AA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  color: i === 0 ? '#92400E' : i === 1 ? '#475569' : '#9A3412',
                }}>
                  {i + 1}
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `hsl(${((emp.userId?.name?.charCodeAt(0) || 65) * 37) % 360}, 55%, 55%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {emp.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.userId?.name || 'N/A'}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>{emp.userId?.department || ''}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0D9488' }}>
                  {emp.totalHours}h
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Leave Requests Summary (Placeholder) */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, background: '#EDE9FE',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>📝</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Leave Requests</h4>
          </div>
          {/* Static placeholders */}
          {[
            { label: 'Pending', count: absentToday > 0 ? Math.min(absentToday, 3) : 0, color: '#F59E0B', bg: '#FEF3C7' },
            { label: 'Approved', count: 0, color: '#10B981', bg: '#D1FAE5' },
            { label: 'Rejected', count: 0, color: '#EF4444', bg: '#FEE2E2' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none',
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>{item.label}</span>
              <span style={{
                background: item.bg, color: item.color,
                padding: '2px 12px', borderRadius: 12,
                fontSize: 12, fontWeight: 700,
              }}>
                {item.count}
              </span>
            </div>
          ))}
          <div style={{
            marginTop: 12, textAlign: 'center',
            fontSize: 12, color: '#94A3B8', fontWeight: 500,
            padding: '8px 0', background: '#F8FAFC', borderRadius: 8,
          }}>
            Leave module coming soon
          </div>
        </div>

        {/* Team Overview */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
          borderRadius: 16, padding: 20, color: '#fff',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Team Overview</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{totalEmp}</div>
              <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{presentToday}</div>
              <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>Present</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{absentToday}</div>
              <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>Absent</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, height: 6, overflow: 'hidden' }}>
            <div style={{
              width: totalEmp > 0 ? `${Math.round((presentToday / totalEmp) * 100)}%` : '0%',
              height: '100%', background: '#fff', borderRadius: 10,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8, textAlign: 'right' }}>
            {totalEmp > 0 ? Math.round((presentToday / totalEmp) * 100) : 0}% attendance rate
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700,
  color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5,
};
const tdStyle = { padding: '12px 16px', fontSize: 13, color: '#334155' };

export default ManagerDashboard;
