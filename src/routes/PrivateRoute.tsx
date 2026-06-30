import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";

export function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // persist rehydration이 끝나기 전에는 렌더 보류
  // (localStorage 복원 전에 isAuthenticated=false로 판단해 /login 으로 튕기는 현상 방지)
  if (!hasHydrated) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
