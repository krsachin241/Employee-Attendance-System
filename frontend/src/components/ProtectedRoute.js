import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const user = useSelector(state => state.auth.user);
  const location = useLocation();

  if (!user) return <Navigate to="/" />;

  // Role-based route protection
  const isManagerRoute = location.pathname.startsWith('/manager');
  if (user.role === 'manager' && !isManagerRoute) {
    // Manager trying to access employee route, redirect to manager dashboard
    return <Navigate to="/manager/dashboard" replace />;
  }
  if (user.role !== 'manager' && isManagerRoute) {
    // Employee trying to access manager route, redirect to employee dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
