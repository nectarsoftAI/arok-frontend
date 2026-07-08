import { Link } from "react-router";
import { Mic, FileText, BarChart3, User, ChevronDown, ChevronRight, X, LogOut, PanelLeftClose } from "lucide-react";
import logoArok from "../../assets/logo_arok.webp";
import type { OpenedMeeting } from "./types";

interface SidebarProps {
  currentPath: string;
  sidebarWidth: number;
  isSidebarCompact: boolean;
  isResizingSidebar: boolean;
  onResizeStart: (e: React.MouseEvent) => void;
  onCollapse: () => void;
  isMeetingsExpanded: boolean;
  onToggleMeetingsExpanded: () => void;
  openedMeetings: OpenedMeeting[];
  onRemoveMeeting: (meetingId: string, e: React.MouseEvent) => void;
  displayName: string;
  email: string;
  onLogoutClick: () => void;
}

export function Sidebar({
  currentPath,
  sidebarWidth,
  isSidebarCompact,
  isResizingSidebar,
  onResizeStart,
  onCollapse,
  isMeetingsExpanded,
  onToggleMeetingsExpanded,
  openedMeetings,
  onRemoveMeeting,
  displayName,
  email,
  onLogoutClick,
}: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex relative bg-[#0F1624] flex-col flex-shrink-0"
      style={{ width: sidebarWidth }}
    >
      <div className={`h-16 flex items-center border-b border-white/10 ${isSidebarCompact ? "justify-center px-2" : "justify-between px-6"}`}>
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <img src={logoArok} alt="Arok" className="h-12 w-auto flex-shrink-0" />
          {!isSidebarCompact && <span className="text-white font-extrabold text-2xl whitespace-nowrap">Arok</span>}
        </Link>
        {!isSidebarCompact && (
          <button
            onClick={onCollapse}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            title="사이드바 접기"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className={`flex-1 py-6 overflow-y-auto overflow-x-hidden ${isSidebarCompact ? "px-2" : "px-3"}`}>
        <ul className="space-y-1">
          <li>
            <Link
              to="/"
              title={isSidebarCompact ? "새 회의" : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg transition-all relative
                ${isSidebarCompact ? "justify-center px-0" : "px-4"}
                ${currentPath === "/" ? "bg-[#5B5FF5] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              {currentPath === "/" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
              )}
              <Mic className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCompact && <span className="text-sm whitespace-nowrap">새 회의</span>}
            </Link>
          </li>

          <li>
            <div className="flex items-center gap-1">
              <Link
                to="/meetings"
                title={isSidebarCompact ? "회의록 목록" : undefined}
                className={`flex-1 flex items-center gap-3 py-2.5 rounded-lg transition-all relative
                  ${isSidebarCompact ? "justify-center px-0" : "px-4"}
                  ${currentPath === "/meetings" ? "bg-[#5B5FF5] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                {currentPath === "/meetings" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
                )}
                <FileText className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCompact && <span className="text-sm whitespace-nowrap">회의록 목록</span>}
              </Link>
              {!isSidebarCompact && openedMeetings.length > 0 && (
                <button
                  onClick={onToggleMeetingsExpanded}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {isMeetingsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>

            {!isSidebarCompact && isMeetingsExpanded && openedMeetings.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1">
                {openedMeetings.map((meeting) => (
                  <li key={meeting.id}>
                    <div className="flex items-center gap-1 group pr-2">
                      <Link
                        to={`/meetings/${meeting.id}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm relative flex-1 min-w-0
                          ${currentPath === `/meetings/${meeting.id}` ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 flex-shrink-0" />
                        <span className="truncate block" style={{ maxWidth: "120px" }}>{meeting.title}</span>
                      </Link>
                      <button
                        onClick={(e) => onRemoveMeeting(meeting.id, e)}
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
              title={isSidebarCompact ? "인사이트" : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg transition-all relative
                ${isSidebarCompact ? "justify-center px-0" : "px-4"}
                ${currentPath === "/insights" ? "bg-[#5B5FF5] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              {currentPath === "/insights" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
              )}
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCompact && <span className="text-sm whitespace-nowrap">인사이트</span>}
            </Link>
          </li>
        </ul>
      </nav>

      <div className={`border-t border-white/10 ${isSidebarCompact ? "p-2" : "p-4"}`}>
        {isSidebarCompact ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-full text-white text-sm font-medium truncate text-center" title={displayName}>
              {displayName}
            </div>
            <button
              onClick={onLogoutClick}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{displayName}</div>
              <div className="text-gray-400 text-xs truncate">{email}</div>
            </div>
            <button
              onClick={onLogoutClick}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 사이드바 리사이즈 핸들 */}
      <div
        onMouseDown={onResizeStart}
        className="hidden lg:block absolute inset-y-0 -right-1 w-2 cursor-col-resize z-20 group/resize"
      >
        <div
          className={`mx-auto h-full w-[3px] transition-colors ${
            isResizingSidebar ? "bg-[#5B5FF5]" : "bg-transparent group-hover/resize:bg-[#5B5FF5]/60"
          }`}
        />
      </div>
    </aside>
  );
}
