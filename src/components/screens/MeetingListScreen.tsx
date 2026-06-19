import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, X } from "lucide-react";
import { useNavigate } from "react-router";
import { meetingsApi, type MeetingListItem } from "../../api/meetings";
import { DeleteMeetingDialog } from "../DeleteMeetingDialog";

const COLORS = ["#5B5FF5", "#22D3EE", "#818CF8"];

const DEFAULT_PARTICIPANTS = ["A", "B"];

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return dateStr.slice(0, 10);
}

function formatDuration(seconds: number): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
}

export function MeetingListScreen() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MeetingListItem | null>(null);

  useEffect(() => {
    meetingsApi
      .getAll()
      .then(({ data }) => {
        console.log("회의 목록 응답", data);
        setMeetings(data.meetings);
      })
      .catch(() => setFetchError("회의 목록을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await meetingsApi.delete(deleteTarget.meetingId);
      setMeetings((prev) => prev.filter((m) => m.meetingId !== deleteTarget.meetingId));
    } catch {
      // 삭제 실패 시 목록 유지
    }
    setDeleteTarget(null);
  };

  return (
    <div className="h-full p-6">
      <DeleteMeetingDialog
        isOpen={!!deleteTarget}
        meetingTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[22px] font-semibold text-[#1A1D2E]">회의록 목록</h1>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="px-4 py-2 bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
            >
              <Plus className="w-5 h-5" />
              새로운 회의 시작하기
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="날짜 범위"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5] focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5] focus:border-transparent text-[#6B7280]">
              <option>유형</option>
              <option value="live">실시간 녹음</option>
              <option value="upload">파일 업로드</option>
            </select>
            <input
              type="text"
              placeholder="키워드 검색"
              className="flex-1 max-w-sm px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5] focus:border-transparent"
            />
          </div>
        </div>

        {/* States */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#6B7280] text-sm">
            로딩 중...
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">
            {fetchError}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B7280] text-sm">
            저장된 회의록이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {meetings.map((meeting) => (
              <div
                key={meeting.meetingId}
                className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 transition-all hover:shadow-md hover:border-[#5B5FF5] hover:scale-[1.01] cursor-pointer group relative"
              >
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(meeting);
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

                  {/* Participants (임시 기본값: A, B) */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {DEFAULT_PARTICIPANTS.map((participant, pIdx) => (
                        <div
                          key={pIdx}
                          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: COLORS[pIdx % COLORS.length] }}
                        >
                          {participant}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-[#6B7280]">{DEFAULT_PARTICIPANTS.length}명 참여</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(meeting.durationSeconds)}
                  </div>

                  {/* Keywords placeholder */}
                  <div className="flex flex-wrap gap-1.5 mb-4 min-h-[22px]">
                    <span className="px-2 py-0.5 bg-[#F3F4F6] text-[#9CA3AF] text-xs rounded">
                      키워드 없음
                    </span>
                  </div>

                  {/* Open Button */}
                  <button
                    onClick={() => navigate(`/meetings/${meeting.meetingId}`)}
                    className="w-full py-2 border border-[#E5E7EB] text-[#5B5FF5] text-sm font-medium rounded-lg hover:bg-[#5B5FF5] hover:text-white transition-colors group-hover:bg-[#5B5FF5] group-hover:text-white"
                  >
                    열기
                  </button>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
