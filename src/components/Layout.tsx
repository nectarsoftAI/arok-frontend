import { Outlet, useLocation, useParams, useNavigate } from "react-router";
import { Suspense, useState, useEffect } from "react";
import { meetingsApi } from "../api/meetings";
import { logout as apiLogout } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useSidebarState } from "../hooks/useSidebarState";
import { Sidebar } from "./layout/Sidebar";
import { Header } from "./layout/Header";
import { MobileTabBar } from "./layout/MobileTabBar";
import { LogoutConfirmDialog } from "./common/dialogs/LogoutConfirmDialog";
import { RouteFallback } from "./common/RouteFallback";
import type { OpenedMeeting } from "./layout/types";

export function Layout() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [isMeetingsExpanded, setIsMeetingsExpanded] = useState(true);
  const [openedMeetings, setOpenedMeetings] = useState<OpenedMeeting[]>([]);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const sidebar = useSidebarState();

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const displayName = user?.displayName || user?.email || '';
  const email = user?.email || '';

  const handleLogout = async () => {
    if (token) {
      try { await apiLogout(token); } catch { /* 실패해도 로컬 상태 초기화 */ }
    }
    logout();
    setIsLogoutDialogOpen(false);
    navigate('/login');
  };

  const currentMeetingId = params.id;

  useEffect(() => {
    if (!currentMeetingId) return;
    if (openedMeetings.some((m) => m.id === currentMeetingId)) return;

    meetingsApi.getById(currentMeetingId).then(({ data }) => {
      setOpenedMeetings((prev) => [...prev, { id: data.meetingId, title: data.title }]);
      setIsMeetingsExpanded(true);
    }).catch(() => {});
  }, [currentMeetingId]);

  const handleRemoveMeeting = (meetingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenedMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    if (currentMeetingId === meetingId) navigate("/meetings");
  };

  return (
    <>
    <div className="flex h-screen bg-background">
      {!sidebar.isSidebarCollapsed && (
        <Sidebar
          currentPath={location.pathname}
          sidebarWidth={sidebar.sidebarWidth}
          isSidebarCompact={sidebar.isSidebarCompact}
          isResizingSidebar={sidebar.isResizingSidebar}
          onResizeStart={sidebar.handleResizeStart}
          onCollapse={sidebar.collapseSidebar}
          isMeetingsExpanded={isMeetingsExpanded}
          onToggleMeetingsExpanded={() => setIsMeetingsExpanded((v) => !v)}
          openedMeetings={openedMeetings}
          onRemoveMeeting={handleRemoveMeeting}
          displayName={displayName}
          email={email}
          onLogoutClick={() => setIsLogoutDialogOpen(true)}
        />
      )}

      {/* ── 메인 영역 ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isSidebarCollapsed={sidebar.isSidebarCollapsed}
          onExpandSidebar={sidebar.expandSidebar}
          displayName={displayName}
          onLogoutClick={() => setIsLogoutDialogOpen(true)}
        />

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>

        <MobileTabBar currentPath={location.pathname} />
      </div>
    </div>

    <LogoutConfirmDialog
      isOpen={isLogoutDialogOpen}
      onConfirm={handleLogout}
      onClose={() => setIsLogoutDialogOpen(false)}
    />
    </>
  );
}
