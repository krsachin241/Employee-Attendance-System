import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../slices/authSlice';

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e3f0ff 0%, #f4f6f9 100%)',
  },
  card: {
    width: 420,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    padding: '40px 36px',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#1a73e8',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 28,
  },
  inputGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 },
  input: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8,
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8,
    fontSize: 15, outline: 'none', background: '#fff', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '12px 0', border: 'none', borderRadius: 8,
    background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: '#fff',
    fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8,
  },
  switchBtn: {
    background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer',
    fontSize: 14, fontWeight: 600, marginTop: 16, display: 'block', textAlign: 'center', width: '100%',
  },
  error: { color: '#e53935', background: '#ffeaea', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  success: { color: '#2e7d32', background: '#e8f5e9', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 12, textAlign: 'center' },
};

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role: 'employee' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        setSuccess(`Registration successful! Your Employee ID: ${data.employeeId}. Please login.`);
        setIsRegister(false);
      } else {
        const result = await dispatch(login({ email: form.email, password: form.password })).unwrap();
        navigate(result.role === 'manager' ? '/manager/dashboard' : '/dashboard');
      }
    } catch (err) { setError(err.message || err); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.title}>📋 AttendEase</div>
        <div style={styles.subtitle}>{isRegister ? 'Create your account' : 'Employee Attendance System'}</div>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input style={styles.input} name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Department</label>
                <input style={styles.input} name="department" placeholder="Engineering" value={form.department} onChange={handleChange} />
              </div>
            </>
          )}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select style={styles.select} name="role" value={form.role} onChange={handleChange}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <button style={styles.switchBtn} onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
          {isRegister ? '← Back to Login' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}

export default Login;
