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

function AllEmployeesAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');

  const fetchRecords = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      if (department) params.append('department', department);

      const res = await fetch(`/api/attendance/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load records');
      setRecords(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const clearFilters = () => {
    setEmployeeId(''); setStartDate(''); setEndDate(''); setStatus(''); setDepartment('');
    setTimeout(fetchRecords, 0);
  };

  return (
    <div className="all-employees-attendance-main" style={{ maxWidth: 1050, margin: '32px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>All Employees Attendance</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>View & filter attendance records for all team members</p>

      {/* Filters */}
      <form onSubmit={handleFilter} className="all-employees-attendance-filters" style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div className="all-employees-attendance-filters-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={filterLabel}>Employee (Name/ID)</label>
            <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="EMP001 or John"
              style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={filterLabel}>Department</label>
            <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Engineering"
              style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={filterLabel}>From Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label style={filterLabel}>To Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={filterInput} />
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
          <button type="submit" style={{
            padding: '10px 24px', border: 'none', borderRadius: 8,
            background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', height: 40,
          }}>
            🔍 Search
          </button>
          <button type="button" onClick={clearFilters} style={{
            padding: '10px 18px', border: '1.5px solid #ddd', borderRadius: 8,
            background: '#fff', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', height: 40,
          }}>
            Clear
          </button>
        </div>
      </form>

      {/* Results count */}
      <div style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>
        Showing <strong style={{ color: '#333' }}>{records.length}</strong> records
      </div>

      {/* Table */}
      <div className="all-employees-attendance-table-container" style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        {loading && <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading...</div>}
        {error && <div style={{ color: '#e53935', textAlign: 'center', padding: 20 }}>{error}</div>}
        {!loading && !error && (
          <table className="all-employees-attendance-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
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
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>No records found</td></tr>
              )}
              {records.map(rec => (
                <tr key={rec._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{rec.userId?.name || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{rec.userId?.email}</div>
                  </td>
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
      </div>
    {/* Responsive styles */}
    <style>{`
      @media (max-width: 900px) {
        .all-employees-attendance-main {
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        .all-employees-attendance-filters-row {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .all-employees-attendance-filters {
          padding: 10px 4px !important;
        }
        .all-employees-attendance-table-container {
          border-radius: 10px !important;
          box-shadow: none !important;
        }
        .all-employees-attendance-table {
          min-width: 500px !important;
        }
      }
      @media (max-width: 600px) {
        .all-employees-attendance-main {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .all-employees-attendance-filters-row {
          flex-direction: column !important;
          gap: 6px !important;
        }
        .all-employees-attendance-filters {
          padding: 6px 2px !important;
        }
        .all-employees-attendance-table-container {
          border-radius: 8px !important;
          box-shadow: none !important;
        }
        .all-employees-attendance-table {
          min-width: 320px !important;
        }
      }
    `}</style>
    </div>
  );
}

const filterLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 };
const filterInput = { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#555' };
const tdStyle = { padding: '10px 12px', fontSize: 14, color: '#333' };

export default AllEmployeesAttendance;
