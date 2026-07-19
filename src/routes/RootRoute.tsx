import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";
import { LandingScreen } from "./lazyScreens";

export function RootRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { pathname } = useLocation();

  // persist rehydration이 끝나기 전에는 렌더 보류
  // (localStorage 복원 전에 isAuthenticated=false로 판단해 /login 으로 튕기는 현상 방지)
  if (!hasHydrated) return null;

  if (!isAuthenticated) {
    // "/" 는 공개 라우트 — 미로그인 사용자의 첫 화면은 랜딩 페이지
    // 그 외 앱 경로는 기존대로 로그인으로 보냄
    return pathname === "/" ? <LandingScreen /> : <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
