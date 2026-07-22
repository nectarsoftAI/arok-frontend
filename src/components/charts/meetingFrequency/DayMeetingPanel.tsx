import { Calendar, X } from "lucide-react";
import { MeetingTypeBadge } from "../../common/MeetingTypeBadge";
import { formatDuration } from "../../common/utils";
import { formatKoreanDate, type HeatmapMeeting } from "./heatmap";

interface DayMeetingPanelProps {
  selectedDate: string | null;
  /** 선택한 날짜의 회의 건수 — 상세 목록이 아직 없어도 건수는 보여 준다. */
  count: number;
  meetings: HeatmapMeeting[];
  onClose: () => void;
}

/** 히트맵 오른쪽, 선택한 날짜의 회의 목록. 높이 고정 + 내부 스크롤. */
export function DayMeetingPanel({ selectedDate, count, meetings, onClose }: DayMeetingPanelProps) {
  return (
    <div className="min-w-0 flex-1 border-l border-[#E5E7EB] pl-5" style={{ height: 185 }}>
      {selectedDate ? (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex flex-shrink-0 items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1A1D2E]">{formatKoreanDate(selectedDate)}</p>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">회의 {count}건</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[#C4C7D0] transition-colors hover:bg-[#F3F4F6] hover:text-[#6B7280]"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
            {meetings.length > 0 ? (
              meetings.map((m) => (
                <div
                  key={m.meetingId}
                  className="flex gap-2.5 rounded-lg border border-[#E5E7EB] bg-white p-2.5 transition-colors hover:border-[#C7C9F9]"
                >
                  <div className="w-0.5 flex-shrink-0 self-stretch rounded-full bg-[#5B5FF5]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold leading-snug text-[#1A1D2E]">{m.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-[#9CA3AF]">{formatDuration(m.durationSeconds)}</span>
                      <span className="text-[10px] text-[#9CA3AF]">·</span>
                      <span className="text-[10px] text-[#9CA3AF]">{m.participantCount}명</span>
                      <MeetingTypeBadge type={m.meetingType} className="ml-auto px-1.5 py-0.5 text-[10px]" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#9CA3AF]">이 날 {count}건의 회의가 있었습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]">
            <Calendar size={14} className="text-[#C4C7D0]" />
          </div>
          <p className="text-[11px] leading-relaxed text-[#C4C7D0]">
            날짜를 선택하면
            <br />
            회의 내용을 볼 수 있어요
          </p>
        </div>
      )}
    </div>
  );
}
