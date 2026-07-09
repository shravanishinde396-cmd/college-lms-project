import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function RoleRoute({ allowed }) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
