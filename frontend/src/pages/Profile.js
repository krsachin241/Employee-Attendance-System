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
        const res = await fetch('/api/auth/me', {
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
    <div
      className="profile-container"
      style={{
        maxWidth: 540,
        margin: '40px auto',
        padding: '0 8px',
        width: '100%',
        boxSizing: 'border-box',
        background: 'none',
        boxShadow: 'none',
      }}
    >
      <h2
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#1a1a2e',
          marginBottom: 4,
          textAlign: 'left',
        }}
      >
        
      </h2>
      <p
        style={{
          color: '#888',
          marginBottom: 28,
          fontSize: 15,
          textAlign: 'left',
        }}
      >
        
      </p>

      {/* Avatar and Details, flat layout */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#e3e8f0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 800,
            color: '#4a4a4a',
            marginBottom: 8,
          }}
        >
          {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#222', wordBreak: 'break-word', marginTop: 4 }}>{profile.name}</div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 6,
            padding: '3px 14px',
            borderRadius: 20,
            background: '#f0f0f0',
            color: '#444',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'capitalize',
            wordBreak: 'break-word',
          }}
        >
          {profile.role}
        </div>
      </div>
      <div className="profile-details" style={{ width: '100%', boxSizing: 'border-box', padding: 0, background: 'none', boxShadow: 'none' }}>
        {fields.map((f, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '12px 0',
              borderBottom: i < fields.length - 1 ? '1px solid #f0f0f0' : 'none',
              flexWrap: 'wrap',
              gap: 8,
              width: '100%',
              background: 'none',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: 14, color: '#888', fontWeight: 600, minWidth: 100 }}>{f.label}</span>
            <span
              style={{
                fontSize: 14,
                color: '#333',
                fontWeight: 600,
                textTransform: f.label === 'Role' ? 'capitalize' : 'none',
                wordBreak: 'break-word',
                textAlign: 'right',
                flex: 1,
                maxWidth: 180,
              }}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 700px) {
          .profile-container {
            margin: 18px 0 0 0 !important;
            padding: 0 4px !important;
          }
          .profile-details {
            padding: 10px 4px !important;
          }
          .profile-details > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }
        }
        @media (max-width: 480px) {
          .profile-details {
            padding: 6px 2px !important;
          }
          .profile-details > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;
