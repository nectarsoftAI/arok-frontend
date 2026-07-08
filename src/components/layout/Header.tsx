import { Link } from "react-router";
import { Search, Bell, User, PanelLeftOpen } from "lucide-react";
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
