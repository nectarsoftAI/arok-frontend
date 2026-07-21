import { Link } from "react-router";
import { Bell, User, PanelLeftOpen } from "lucide-react";
import logoArok from "../../assets/logo_arok.webp";

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  displayName: string;
  onLogoutClick: () => void;
}

export function Header({ isSidebarCollapsed, onExpandSidebar, displayName, onLogoutClick }: HeaderProps) {
  return (
    <header className="h-14 lg:h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* 모바일: 로고 */}
      <Link to="/" className="flex items-center gap-2 lg:hidden">
        <img src={logoArok} alt="Arok" className="h-10 w-auto" />
        <span className="font-extrabold text-xl text-[#1A1D2E]">Arok</span>
      </Link>

      {/* 사이드바 접힘 상태: 펼치기 버튼 */}
      {isSidebarCollapsed && (
        <button
          onClick={onExpandSidebar}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 mr-4 bg-white border border-[#E5E7EB] rounded-full shadow-sm hover:shadow transition-shadow flex-shrink-0"
          title="사이드바 펼치기"
        >
          <img src={logoArok} alt="Arok" className="h-5 w-auto" />
          <span className="text-sm font-semibold text-[#1A1D2E]">Arok</span>
          <PanelLeftOpen className="w-4 h-4 text-[#6B7280]" />
        </button>
      )}

      {/* 검색바를 걷어내 좌측이 비므로, 우측 그룹을 ml-auto 로 밀어 붙인다. */}
      <div className="flex items-center gap-2 lg:gap-4 ml-auto">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-[#6B7280]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#5B5FF5] rounded-full" />
        </button>
        <button
          onClick={onLogoutClick}
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
  );
}
