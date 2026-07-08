import { Link } from "react-router";
import { Mic, FileText, BarChart3 } from "lucide-react";

interface MobileTabBarProps {
  currentPath: string;
}

const navItems = [
  { to: "/", icon: Mic, label: "새 회의" },
  { to: "/meetings", icon: FileText, label: "회의록" },
  { to: "/insights", icon: BarChart3, label: "인사이트" },
];

export function MobileTabBar({ currentPath }: MobileTabBarProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] flex z-50 safe-area-inset-bottom">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = to === "/" ? currentPath === "/" : currentPath.startsWith(to);
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
  );
}
