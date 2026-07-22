import { Calendar, X } from "lucide-react";
import { useNavigate } from "react-router";
import { MeetingTypeBadge } from "../../common/MeetingTypeBadge";
import { Skeleton } from "../../common/Skeleton";
import { formatDuration } from "../../common/utils";
import { formatKoreanDate, type HeatmapMeeting } from "./heatmap";

interface DayMeetingPanelProps {
  selectedDate: string | null;
  /** 선택한 날짜의 회의 건수 — 상세 목록이 아직 없어도 건수는 보여 준다. */
  count: number;
  meetings: HeatmapMeeting[];
  isLoading: boolean;
  onClose: () => void;
}

/** 히트맵 오른쪽, 선택한 날짜의 회의 목록. 높이 고정 + 내부 스크롤. */
export function DayMeetingPanel({ selectedDate, count, meetings, isLoading, onClose }: DayMeetingPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="min-w-0 flex-[3] border-l border-[#E5E7EB] pl-5" style={{ height: 185 }}>
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

          <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto pr-0.5">
            {isLoading ? (
              // 이미 아는 건수만큼(최대 3개) 자리를 잡아 둬 목록이 뜰 때 덜 튄다.
              Array.from({ length: Math.min(Math.max(count, 1), 3) }).map((_, i) => (
                <DayMeetingCardSkeleton key={i} />
              ))
            ) : meetings.length > 0 ? (
              meetings.map((m) => (
                <div
                  key={m.meetingId}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/meetings/${m.meetingId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/meetings/${m.meetingId}`);
                    }
                  }}
                  className="flex cursor-pointer gap-2.5 rounded-lg border border-[#E5E7EB] bg-white p-2.5 text-left transition-colors hover:border-[#C7C9F9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FF5]"
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
              <p className="text-xs text-[#9CA3AF]">
                {count > 0 ? "회의 정보를 불러오지 못했습니다." : "이 날은 회의가 없었어요."}
              </p>
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

/** 회의 카드 한 장의 자리. 카드 배경은 흰색 그대로 두고 안쪽 요소만 회색 바로 대신한다. */
function DayMeetingCardSkeleton() {
  return (
    <div className="flex gap-2.5 rounded-lg border border-[#E5E7EB] bg-white p-2.5">
      <div className="w-0.5 flex-shrink-0 self-stretch rounded-full bg-gray-200" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3.5 w-3/5 bg-gray-200" />
        <div className="mt-1.5 flex items-center gap-2">
          <Skeleton className="h-2.5 w-10 bg-gray-200" />
          <Skeleton className="h-2.5 w-7 bg-gray-200" />
          <Skeleton className="ml-auto h-4 w-14 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
