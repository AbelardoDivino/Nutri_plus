import { Navigate } from 'react-router-dom';
export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('access');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!token) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}
