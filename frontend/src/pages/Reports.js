import React, { useEffect, useState } from 'react';

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

function Reports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Filters
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  const buildParams = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (department) params.append('department', department);
    if (status) params.append('status', status);
    return params.toString();
  };

  const fetchPreview = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/manager/all?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load');
      setRecords(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPreview(); }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/manager/export?${buildParams()}`, {
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

  // Summary stats from preview data
  const summary = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    acc.totalHours += Number(r.totalHours || 0);
    return acc;
  }, { present: 0, late: 0, absent: 0, 'half-day': 0, totalHours: 0 });

  return (
    <div style={{ maxWidth: 1050, margin: '32px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Reports & Export</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>Generate and download attendance reports as CSV</p>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={filterLabel}>From Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={filterLabel}>To Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={filterLabel}>Department</label>
            <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="All" style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={filterLabel}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={filterInput}>
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half-day</option>
            </select>
          </div>
          <button onClick={fetchPreview} style={{
            padding: '10px 24px', border: 'none', borderRadius: 8,
            background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', height: 40,
          }}>
            🔍 Preview
          </button>
          <button onClick={handleExportCSV} disabled={exporting || records.length === 0} style={{
            padding: '10px 24px', border: 'none', borderRadius: 8,
            background: records.length === 0 ? '#ccc' : 'linear-gradient(135deg, #43a047, #2e7d32)',
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: records.length === 0 ? 'not-allowed' : 'pointer', height: 40,
          }}>
            {exporting ? '⏳ Exporting...' : '📥 Export CSV'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: records.length, bg: '#e3f0ff', color: '#1a73e8' },
          { label: 'Present', value: summary.present, bg: '#e8f5e9', color: '#2e7d32' },
          { label: 'Late', value: summary.late, bg: '#fff3e0', color: '#ef6c00' },
          { label: 'Absent', value: summary.absent, bg: '#fce4ec', color: '#e53935' },
          { label: 'Half-day', value: summary['half-day'], bg: '#ede7f6', color: '#5e35b1' },
          { label: 'Total Hours', value: `${summary.totalHours.toFixed(1)}h`, bg: '#fff8e1', color: '#f9a825' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 120, background: s.bg, borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Preview Table */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>Report Preview</h3>
        {loading && <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading...</div>}
        {error && <div style={{ color: '#e53935', textAlign: 'center', padding: 20 }}>{error}</div>}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f4f6f9' }}>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Emp ID</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Check In</th>
                <th style={thStyle}>Check Out</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>No records match the filters</td></tr>
              )}
              {records.slice(0, 50).map(rec => (
                <tr key={rec._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}><span style={{ fontWeight: 600 }}>{rec.userId?.name || 'N/A'}</span></td>
                  <td style={tdStyle}><span style={{ fontWeight: 600, color: '#1a73e8' }}>{rec.userId?.employeeId}</span></td>
                  <td style={tdStyle}>{rec.userId?.department || '-'}</td>
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
        {records.length > 50 && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 12 }}>
            Showing first 50 of {records.length} records. Export CSV for full data.
          </div>
        )}
      </div>
    </div>
  );
}

const filterLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 };
const filterInput = { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#555' };
const tdStyle = { padding: '10px 12px', fontSize: 14, color: '#333' };

export default Reports;
