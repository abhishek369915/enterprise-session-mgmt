import { Navigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
