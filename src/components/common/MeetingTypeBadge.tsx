import { Video, Mic, Upload, type LucideIcon } from "lucide-react";
import { Badge } from "./Badge";
import { cn } from "./utils";

// 백엔드 meeting_type 값 → 뱃지. 색은 날짜 뱃지의 인디고(#5B5FF5)와 겹치지 않게 골랐다.
// 백엔드가 'group'만 소문자로 내려주므로 조회 전 toUpperCase()로 정규화한다.
const MEETING_TYPES: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
  GROUP: { label: "온라인 회의", icon: Video, cls: "bg-[#F0FDFA] text-[#0F766E]" },
  REALTIME: { label: "실시간 회의", icon: Mic, cls: "bg-[#FFF1F2] text-[#BE123C]" },
  UPLOAD: { label: "파일 업로드", icon: Upload, cls: "bg-[#FEF3C7] text-[#B45309]" },
};

interface MeetingTypeBadgeProps {
  type: string;
  className?: string;
}

export function MeetingTypeBadge({ type, className }: MeetingTypeBadgeProps) {
  const meta = MEETING_TYPES[type?.toUpperCase()];

  // 매핑에 없는 값은 원본을 그대로 노출한다 — 유형이 추가돼도 조용히 사라지지 않도록.
  if (!meta) {
    if (!type) return null;
    return (
      <Badge variant="neutral" className={cn("px-2.5 py-1 font-medium", className)}>
        {type}
      </Badge>
    );
  }

  const Icon = meta.icon;
  return (
    <Badge className={cn("inline-flex items-center gap-1 px-2.5 py-1 font-medium", meta.cls, className)}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </Badge>
  );
}
