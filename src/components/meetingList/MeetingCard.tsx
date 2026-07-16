import { Calendar, Clock, X } from "lucide-react";
import type { MeetingListItem } from "../../api/meetings";
import { Skeleton } from "../common/Skeleton";
import { SpeakerAvatar, SPEAKER_PALETTE } from "../common/SpeakerAvatar";
import { Badge } from "../common/Badge";
import { MeetingTypeBadge } from "../common/MeetingTypeBadge";
import { formatDuration } from "../common/utils";

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return dateStr.slice(0, 10);
}

interface MeetingCardProps {
  meeting: MeetingListItem;
  onDelete: (meeting: MeetingListItem) => void;
  onOpen: (meetingId: string) => void;
}

export function MeetingCard({ meeting, onDelete, onOpen }: MeetingCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(meeting.meetingId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(meeting.meetingId);
        }
      }}
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 transition-all hover:shadow-md hover:border-[#5B5FF5] hover:scale-[1.01] cursor-pointer relative text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FF5] focus-visible:ring-offset-2"
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(meeting);
        }}
        className="absolute top-3 right-3 p-1 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-all"
        title="삭제"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Date + Type — 날짜는 좌측, 유형은 우측 (pr-6으로 삭제 버튼 회피) */}
      <div className="flex items-center justify-between gap-2 mb-4 pr-6">
        <Badge variant="primary" className="inline-flex items-center gap-1.5 px-2.5 py-1 font-medium">
          <Calendar className="w-3 h-3" />
          {formatDate(meeting.meetingDate)}
        </Badge>
        <MeetingTypeBadge type={meeting.meetingType} />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[#1A1D2E] mb-4 pr-6">{meeting.title}</h3>

      {/* Participants */}
      <div className="flex items-center gap-2 mb-7">
        <div className="flex -space-x-2">
          {meeting.participants.slice(0, 4).map((p, pIdx) => (
            <SpeakerAvatar
              key={p.speakerLabel}
              letter={p.speakerDisplay.charAt(0)}
              color={SPEAKER_PALETTE[pIdx % SPEAKER_PALETTE.length]}
              size="sm"
              bordered
            />
          ))}
        </div>
        <span className="text-xs text-[#6B7280]">
          {meeting.participants.length > 0 ? `${meeting.participants.length}명 참여` : "-"}
        </span>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-4">
        <Clock className="w-3.5 h-3.5" />
        {formatDuration(meeting.durationSeconds)}
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 min-h-[22px]">
        {meeting.keywords.length > 0 ? (
          meeting.keywords.slice(0, 3).map((kw, idx) => (
            <Badge key={idx}>{kw}</Badge>
          ))
        ) : (
          <Badge className="text-[#9CA3AF]">키워드 없음</Badge>
        )}
      </div>
    </div>
  );
}

export function MeetingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 relative">
      <div className="flex items-center justify-between gap-2 mb-4 pr-6">
        <Skeleton className="h-6 w-28 bg-gray-200" />
        <Skeleton className="h-6 w-24 bg-gray-200" />
      </div>
      <Skeleton className="h-5 w-4/5 bg-gray-200 mb-4" />
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
          <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
        </div>
        <Skeleton className="h-3 w-14 bg-gray-200" />
      </div>
      <Skeleton className="h-3 w-20 bg-gray-200 mb-4" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 bg-gray-200" />
        <Skeleton className="h-5 w-14 bg-gray-200" />
      </div>
    </div>
  );
}
