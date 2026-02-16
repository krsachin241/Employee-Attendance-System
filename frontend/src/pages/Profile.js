import React, { useEffect, useState } from 'react';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        setProfile(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 80, color: '#888', fontSize: 18 }}>Loading profile...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: 80, color: '#e53935', fontSize: 16 }}>{error}</div>;
  if (!profile) return null;

  const fields = [
    { label: 'Full Name', value: profile.name },
    { label: 'Email', value: profile.email },
    { label: 'Employee ID', value: profile.employeeId },
    { label: 'Department', value: profile.department || 'N/A' },
    { label: 'Role', value: profile.role },
    { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
  ];

  return (
    <div style={{ maxWidth: 540, margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>My Profile</h2>
      <p style={{ color: '#888', marginBottom: 28, fontSize: 15 }}>Your account details</p>

      {/* Avatar */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '32px 0', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8
          }}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{profile.name}</div>
          <div style={{
            display: 'inline-block', marginTop: 6, padding: '3px 14px', borderRadius: 20,
            background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
          }}>
            {profile.role}
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: '24px 28px' }}>
          {fields.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < fields.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <span style={{ fontSize: 14, color: '#888', fontWeight: 600 }}>{f.label}</span>
              <span style={{ fontSize: 14, color: '#333', fontWeight: 600, textTransform: f.label === 'Role' ? 'capitalize' : 'none' }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
