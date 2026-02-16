import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceHistory from './pages/AttendanceHistory';
import Profile from './pages/Profile';
import ManagerDashboard from './pages/ManagerDashboard';
import AllEmployeesAttendance from './pages/AllEmployeesAttendance';
import TeamCalendar from './pages/TeamCalendar';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: '#f4f6f9' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/mark-attendance" element={
            <ProtectedRoute>
              <MarkAttendance />
            </ProtectedRoute>
          } />
          <Route path="/attendance-history" element={
            <ProtectedRoute>
              <AttendanceHistory />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/manager/dashboard" element={
            <ProtectedRoute>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/attendance" element={
            <ProtectedRoute>
              <AllEmployeesAttendance />
            </ProtectedRoute>
          } />
          <Route path="/manager/calendar" element={
            <ProtectedRoute>
              <TeamCalendar />
            </ProtectedRoute>
          } />
          <Route path="/manager/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
