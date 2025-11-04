/**
 * Protected Route Component
 *
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * - 미인증 사용자는 로그인 페이지로 리다이렉트
 * - 로그인 후 원래 요청한 페이지로 이동
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  // 로그인 후 원래 페이지로 돌아오기 위해 현재 위치를 state로 전달
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 children 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
