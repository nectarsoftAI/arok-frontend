import { Calendar, Clock, X } from "lucide-react";
import type { MeetingListItem } from "../../api/meetings";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../common/Button";
import { SpeakerAvatar, SPEAKER_PALETTE } from "../common/SpeakerAvatar";

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return dateStr.slice(0, 10);
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
}

interface MeetingCardProps {
  meeting: MeetingListItem;
  onDelete: (meeting: MeetingListItem) => void;
  onOpen: (meetingId: string) => void;
}

export function MeetingCard({ meeting, onDelete, onOpen }: MeetingCardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 transition-all hover:shadow-md hover:border-[#5B5FF5] hover:scale-[1.01] cursor-pointer group relative">
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

      {/* Date Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs font-medium rounded mb-3">
        <Calendar className="w-3 h-3" />
        {formatDate(meeting.meetingDate)}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[#1A1D2E] mb-3 pr-6">{meeting.title}</h3>

      {/* Participants */}
      <div className="flex items-center gap-2 mb-3">
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
      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-3">
        <Clock className="w-3.5 h-3.5" />
        {formatDuration(meeting.durationSeconds)}
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[22px]">
        {meeting.keywords.length > 0 ? (
          meeting.keywords.slice(0, 3).map((kw, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-xs rounded">
              {kw}
            </span>
          ))
        ) : (
          <span className="px-2 py-0.5 bg-[#F3F4F6] text-[#9CA3AF] text-xs rounded">
            키워드 없음
          </span>
        )}
      </div>

      {/* Open Button */}
      <Button
        variant="outline"
        onClick={() => onOpen(meeting.meetingId)}
        className="w-full py-2 border-[#E5E7EB] group-hover:bg-[#5B5FF5] group-hover:text-white"
      >
        열기
      </Button>
    </div>
  );
}

export function MeetingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 relative">
      <Skeleton className="h-6 w-28 bg-gray-200 mb-3" />
      <Skeleton className="h-5 w-4/5 bg-gray-200 mb-3" />
      <div className="flex items-center gap-2 mb-3">
        <div className="flex -space-x-2">
          <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
          <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
        </div>
        <Skeleton className="h-3 w-14 bg-gray-200" />
      </div>
      <Skeleton className="h-3 w-20 bg-gray-200 mb-3" />
      <div className="flex gap-1.5 mb-4">
        <Skeleton className="h-5 w-16 bg-gray-200" />
        <Skeleton className="h-5 w-14 bg-gray-200" />
      </div>
      <Skeleton className="h-9 w-full bg-gray-200" />
    </div>
  );
}
