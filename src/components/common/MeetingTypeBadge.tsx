import { Badge } from "./Badge";
import { cn } from "./utils";
import { MEETING_TYPES } from "./meetingTypes";

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
