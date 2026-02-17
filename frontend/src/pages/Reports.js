import React, { useEffect, useState, useMemo } from 'react';

const STATUS_COLORS = {
  present: { bg: '#e8f5e9', color: '#2e7d32', label: 'Present' },
  late: { bg: '#fff3e0', color: '#ef6c00', label: 'Late' },
  absent: { bg: '#fce4ec', color: '#e53935', label: 'Absent' },
  'half-day': { bg: '#ede7f6', color: '#5e35b1', label: 'Half Day' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f5f5f5', color: '#888' };
  return (
    <span style={{ background: c.bg, color: c.color, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function Reports() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  // Filters
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/attendance/employees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setEmployees(data);
      } catch {}
    };
    fetchEmployees();
  }, []);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    return params.toString();
  };

  const fetchPreview = async () => {
    setLoading(true); setError(''); setPage(1);
    try {
      const token = localStorage.getItem('token');
      let url;
      if (selectedEmployee) {
        url = `/api/attendance/employee/${selectedEmployee}?${buildParams()}`;
      } else {
        url = `/api/attendance/all?${buildParams()}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load');
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPreview(); }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/export?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Export failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); }
    finally { setExporting(false); }
  };

  // Client-side export (if backend export doesn't support employee filter)
  const handleClientCSVExport = () => {
    if (records.length === 0) return;
    const headers = ['Employee', 'Emp ID', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Hours'];
    const rows = records.map(rec => [
      rec.userId?.name || 'N/A',
      rec.userId?.employeeId || '',
      rec.userId?.department || '',
      rec.date ? new Date(rec.date).toLocaleDateString() : '',
      rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '',
      rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '',
      rec.status || '',
      rec.totalHours != null ? rec.totalHours : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Summary stats
  const summary = useMemo(() => records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    acc.totalHours += Number(r.totalHours || 0);
    return acc;
  }, { present: 0, late: 0, absent: 0, 'half-day': 0, totalHours: 0 }), [records]);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let va, vb;
      if (sortField === 'date') { va = new Date(a.date); vb = new Date(b.date); }
      else if (sortField === 'name') { va = a.userId?.name || ''; vb = b.userId?.name || ''; }
      else if (sortField === 'status') { va = a.status; vb = b.status; }
      else if (sortField === 'hours') { va = Number(a.totalHours || 0); vb = Number(b.totalHours || 0); }
      else { va = a[sortField]; vb = b[sortField]; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortField, sortDir]);

  const totalPages = Math.ceil(sortedRecords.length / PAGE_SIZE) || 1;
  const paginatedRecords = sortedRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: 4 }}>⇅</span>;
    return <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // Quick date range presets
  const setPreset = (key) => {
    const today = new Date();
    let start;
    if (key === 'today') { start = todayStr; setStartDate(start); setEndDate(todayStr); }
    else if (key === 'week') {
      const d = new Date(today); d.setDate(d.getDate() - d.getDay());
      start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setStartDate(start); setEndDate(todayStr);
    }
    else if (key === 'month') { setStartDate(firstOfMonth); setEndDate(todayStr); }
    else if (key === 'last30') {
      const d = new Date(today); d.setDate(d.getDate() - 30);
      start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setStartDate(start); setEndDate(todayStr);
    }
  };

  return (
    <div className="manager-reports-main" style={{ maxWidth: 1100, margin: '32px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4, margin: 0 }}>📊 Reports & Export</h2>
        <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>Generate attendance reports, filter by employee, and export to CSV</p>
      </div>

      {/* Quick Date Presets */}
      <div className="reports-date-presets" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
          { key: 'last30', label: 'Last 30 Days' },
        ].map(p => (
          <button key={p.key} onClick={() => setPreset(p.key)} style={{
            padding: '6px 16px', border: '1.5px solid #ddd', borderRadius: 20,
            background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#555',
            transition: 'all 0.15s',
          }}
            onMouseOver={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.color = '#1a73e8'; }}
            onMouseOut={e => { e.target.style.borderColor = '#ddd'; e.target.style.color = '#555'; }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="reports-filters" style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div className="reports-filters-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={filterLabel}>📅 From Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={filterLabel}>📅 To Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={filterInput} />
          </div>
          <div style={{ flex: 1.5, minWidth: 180 }}>
            <label style={filterLabel}>👤 Employee</label>
            <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} style={filterInput}>
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={filterLabel}>📋 Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={filterInput}>
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half-day</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={fetchPreview} style={{
            padding: '10px 28px', border: 'none', borderRadius: 10,
            background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', height: 42,
            boxShadow: '0 2px 8px rgba(26,115,232,0.3)',
          }}>
            🔍 Generate Report
          </button>
          <button onClick={selectedEmployee ? handleClientCSVExport : handleExportCSV}
            disabled={exporting || records.length === 0} style={{
              padding: '10px 28px', border: 'none', borderRadius: 10,
              background: records.length === 0 ? '#ccc' : 'linear-gradient(135deg, #43a047, #2e7d32)',
              color: '#fff', fontWeight: 700, fontSize: 14, height: 42,
              cursor: records.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: records.length === 0 ? 'none' : '0 2px 8px rgba(67,160,71,0.3)',
            }}>
            {exporting ? '⏳ Exporting...' : '📥 Export CSV'}
          </button>
          {records.length > 0 && (
            <span style={{ alignSelf: 'center', fontSize: 13, color: '#888', fontWeight: 500 }}>
              {records.length} record{records.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="reports-summary-cards" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: records.length, icon: '📄', bg: '#e3f0ff', color: '#1a73e8' },
          { label: 'Present', value: summary.present, icon: '✅', bg: '#e8f5e9', color: '#2e7d32' },
          { label: 'Late', value: summary.late, icon: '⏰', bg: '#fff3e0', color: '#ef6c00' },
          { label: 'Absent', value: summary.absent, icon: '❌', bg: '#fce4ec', color: '#e53935' },
          { label: 'Half-day', value: summary['half-day'], icon: '🌗', bg: '#ede7f6', color: '#5e35b1' },
          { label: 'Total Hours', value: `${summary.totalHours.toFixed(1)}h`, icon: '⏱️', bg: '#fff8e1', color: '#f9a825' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, minWidth: 120, background: '#fff', borderRadius: 14, padding: '16px 14px',
            textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Status Distribution Bar */}
      {records.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 10 }}>Status Distribution</div>
          <div style={{ display: 'flex', height: 28, borderRadius: 10, overflow: 'hidden', background: '#f0f0f0' }}>
            {['present', 'late', 'half-day', 'absent'].map(s => {
              const pct = records.length > 0 ? ((summary[s] / records.length) * 100) : 0;
              if (pct === 0) return null;
              return (
                <div key={s} title={`${STATUS_COLORS[s].label}: ${summary[s]} (${pct.toFixed(1)}%)`}
                  style={{
                    width: `${pct}%`, background: STATUS_COLORS[s].color, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11,
                    fontWeight: 700, transition: 'width 0.3s',
                  }}>
                  {pct >= 8 && `${pct.toFixed(0)}%`}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            {['present', 'late', 'half-day', 'absent'].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#666' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[s].color, display: 'inline-block' }}></span>
                {STATUS_COLORS[s].label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="reports-table-container" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>📋 Report Data</h3>
          <span style={{ fontSize: 12, color: '#888' }}>Click column headers to sort</span>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</div>}
        {error && <div style={{ color: '#e53935', textAlign: 'center', padding: 20 }}>{error}</div>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto', padding: '0 0 16px' }}>
            <table className="reports-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f4f6f9' }}>
                  <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Employee <SortIcon field="name" />
                  </th>
                  <th style={thStyle}>Emp ID</th>
                  <th style={thStyle}>Department</th>
                  <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('date')}>
                    Date <SortIcon field="date" />
                  </th>
                  <th style={thStyle}>Check In</th>
                  <th style={thStyle}>Check Out</th>
                  <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('status')}>
                    Status <SortIcon field="status" />
                  </th>
                  <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('hours')}>
                    Hours <SortIcon field="hours" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                      No records match the filters. Try adjusting the date range or filters.
                    </td>
                  </tr>
                )}
                {paginatedRecords.map((rec, idx) => (
                  <tr key={rec._id || idx} style={{
                    borderBottom: '1px solid #f0f0f0',
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    transition: 'background 0.15s',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0f4ff'}
                    onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}>
                    <td style={tdStyle}><span style={{ fontWeight: 600 }}>{rec.userId?.name || 'N/A'}</span></td>
                    <td style={tdStyle}><span style={{ fontWeight: 600, color: '#1a73e8', fontFamily: 'monospace' }}>{rec.userId?.employeeId}</span></td>
                    <td style={tdStyle}>{rec.userId?.department || '-'}</td>
                    <td style={tdStyle}>{rec.date ? new Date(rec.date).toLocaleDateString() : ''}</td>
                    <td style={tdStyle}>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-'}</td>
                    <td style={tdStyle}>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                    <td style={tdStyle}><StatusBadge status={rec.status} /></td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600 }}>{rec.totalHours != null ? `${rec.totalHours}h` : '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {sortedRecords.length > PAGE_SIZE && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderTop: '1px solid #f0f0f0'
          }}>
            <button onClick={() => setPage(1)} disabled={page === 1} style={pageBtnStyle(page === 1)}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle(page === 1)}>‹</button>
            <span style={{ fontSize: 13, color: '#555', fontWeight: 600, margin: '0 8px' }}>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtnStyle(page === totalPages)}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={pageBtnStyle(page === totalPages)}>»</button>
          </div>
        )}
      </div>
    {/* Responsive styles */}
    <style>{`
      @media (max-width: 1100px) {
        .manager-reports-main {
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
      }
      @media (max-width: 900px) {
        .manager-reports-main {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .reports-summary-cards {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .reports-summary-cards > div {
          min-width: 0 !important;
          width: 100% !important;
          border-radius: 10px !important;
          box-shadow: none !important;
        }
        .reports-filters-row {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .reports-filters {
          padding: 10px 4px !important;
        }
        .reports-table-container {
          border-radius: 10px !important;
          box-shadow: none !important;
        }
        .reports-table {
          min-width: 500px !important;
        }
      }
      @media (max-width: 700px) {
        .manager-reports-main {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .reports-summary-cards {
          flex-direction: column !important;
          gap: 6px !important;
        }
        .reports-summary-cards > div {
          min-width: 0 !important;
          width: 100% !important;
          border-radius: 8px !important;
          box-shadow: none !important;
          padding-left: 6px !important;
          padding-right: 6px !important;
        }
        .reports-filters-row {
          flex-direction: column !important;
          gap: 6px !important;
        }
        .reports-filters {
          padding: 6px 2px !important;
        }
        .reports-table-container {
          border-radius: 8px !important;
          box-shadow: none !important;
        }
        .reports-table {
          min-width: 400px !important;
        }
      }
      @media (max-width: 480px) {
        .manager-reports-main {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .reports-summary-cards > div {
          border-radius: 6px !important;
          box-shadow: none !important;
          padding-left: 2px !important;
          padding-right: 2px !important;
        }
        .reports-table {
          min-width: 320px !important;
        }
      }
    `}</style>
    </div>
  );
}

const pageBtnStyle = (disabled) => ({
  border: '1px solid #ddd', background: disabled ? '#f5f5f5' : '#fff', color: disabled ? '#ccc' : '#555',
  padding: '6px 10px', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700,
});
const filterLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 };
const filterInput = { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#555', userSelect: 'none' };
const tdStyle = { padding: '10px 12px', fontSize: 14, color: '#333' };

export default Reports;
