import { Outlet, Link, useLocation, useParams, useNavigate } from "react-router";
import { Mic, FileText, BarChart3, Search, Bell, User, ChevronDown, ChevronRight, X, LogOut } from "lucide-react";
import { meetingsApi } from "../api/meetings";
import { logout as apiLogout } from "../api/auth";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { DialogShell } from "./common/dialogs/DialogShell";
import { Button } from "./common/Button";

interface OpenedMeeting {
  id: string;
  title: string;
}

export function Layout() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [isMeetingsExpanded, setIsMeetingsExpanded] = useState(true);
  const [openedMeetings, setOpenedMeetings] = useState<OpenedMeeting[]>([]);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

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

  const navItems = [
    { to: "/", icon: Mic, label: "새 회의" },
    { to: "/meetings", icon: FileText, label: "회의록" },
    { to: "/insights", icon: BarChart3, label: "인사이트" },
  ];

  return (
    <>
    <div className="flex h-screen bg-background">
      {/* ── 사이드바 (데스크톱 전용) ── */}
      <aside className="hidden lg:flex w-60 bg-[#0F1624] flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Arok</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link
                to="/"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all relative
                  ${location.pathname === "/" ? "bg-[#5B5FF5] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                {location.pathname === "/" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
                )}
                <Mic className="w-5 h-5" />
                <span className="text-sm">새 회의</span>
              </Link>
            </li>

            <li>
              <div className="flex items-center gap-1">
                <Link
                  to="/meetings"
                  className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all relative
                    ${location.pathname === "/meetings" ? "bg-[#5B5FF5] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  {location.pathname === "/meetings" && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
                  )}
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">회의록 목록</span>
                </Link>
                {openedMeetings.length > 0 && (
                  <button
                    onClick={() => setIsMeetingsExpanded(!isMeetingsExpanded)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {isMeetingsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {isMeetingsExpanded && openedMeetings.length > 0 && (
                <ul className="ml-4 mt-1 space-y-1">
                  {openedMeetings.map((meeting) => (
                    <li key={meeting.id}>
                      <div className="flex items-center gap-1 group pr-2">
                        <Link
                          to={`/meetings/${meeting.id}`}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm relative flex-1 min-w-0
                            ${location.pathname === `/meetings/${meeting.id}` ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 flex-shrink-0" />
                          <span className="truncate block" style={{ maxWidth: "120px" }}>{meeting.title}</span>
                        </Link>
                        <button
                          onClick={(e) => handleRemoveMeeting(meeting.id, e)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <Link
                to="/insights"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all relative
                  ${location.pathname === "/insights" ? "bg-[#5B5FF5] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                {location.pathname === "/insights" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
                )}
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">인사이트</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{displayName}</div>
              <div className="text-gray-400 text-xs truncate">{email}</div>
            </div>
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── 메인 영역 ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <header className="h-14 lg:h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          {/* 모바일: 로고 */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] rounded-lg flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#1A1D2E]">Arok</span>
          </div>

          {/* 데스크톱: 검색바 */}
          <div className="hidden lg:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="회의 검색, 날짜, 참여자..."
                className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Search className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-[#6B7280]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#5B5FF5] rounded-full" />
            </button>
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="로그아웃"
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="hidden lg:block text-sm font-medium text-[#1A1D2E]">{displayName}</span>
            </button>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </main>

        {/* ── 하단 탭바 (모바일 전용) ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] flex z-50 safe-area-inset-bottom">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors
                  ${isActive ? "text-[#5B5FF5]" : "text-[#9CA3AF]"}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>

    <DialogShell
      isOpen={isLogoutDialogOpen}
      onClose={() => setIsLogoutDialogOpen(false)}
      icon={<LogOut className="w-4 h-4 text-red-500" />}
      iconBg="bg-red-100"
      title="로그아웃"
    >
      <div className="p-6">
        <p className="text-sm text-[#6B7280] mb-6">정말 로그아웃 하시겠습니까?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsLogoutDialogOpen(false)} className="flex-1">
            취소
          </Button>
          <Button variant="danger" onClick={handleLogout} className="flex-1">
            로그아웃
          </Button>
        </div>
      </div>
    </DialogShell>
    </>
  );
}
