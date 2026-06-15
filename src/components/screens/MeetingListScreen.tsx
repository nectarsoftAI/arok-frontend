import { useState } from "react";
import { Calendar, Clock, Plus, X } from "lucide-react";
import { useNavigate } from "react-router";
import { meetings as initialMeetings, type Meeting } from "../../data/meetings";
import { DeleteMeetingDialog } from "../DeleteMeetingDialog";

const COLORS = ["#5B5FF5", "#22D3EE", "#818CF8"];

export function MeetingListScreen() {
  const navigate = useNavigate();
  const [meetingList, setMeetingList] = useState<Meeting[]>(initialMeetings);
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setMeetingList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
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
              <option>참여자</option>
              <option>화자 A</option>
              <option>화자 B</option>
              <option>화자 C</option>
            </select>
            <input
              type="text"
              placeholder="키워드 검색"
              className="flex-1 max-w-sm px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5] focus:border-transparent"
            />
          </div>
        </div>

        {/* Meeting Cards Grid */}
        <div className="grid grid-cols-3 gap-5">
          {meetingList.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 transition-all hover:shadow-md hover:border-[#5B5FF5] hover:scale-[1.01] cursor-pointer group relative"
            >
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(meeting); }}
                className="absolute top-3 right-3 p-1 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-all"
                title="삭제"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Date Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs font-medium rounded mb-3">
                <Calendar className="w-3 h-3" />
                {meeting.date}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-[#1A1D2E] mb-3 pr-6">{meeting.title}</h3>

              {/* Participants */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {meeting.participants.map((participant, pIdx) => (
                    <div
                      key={pIdx}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: COLORS[pIdx % COLORS.length] }}
                    >
                      {participant}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-[#6B7280]">{meeting.participants.length}명 참여</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-3">
                <Clock className="w-3.5 h-3.5" />
                {meeting.duration}
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {meeting.keywords.map((keyword, kIdx) => (
                  <span key={kIdx} className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-xs rounded">
                    {keyword}
                  </span>
                ))}
              </div>

              {/* Open Button */}
              <button
                onClick={() => navigate(`/meetings/${meeting.id}`)}
                className="w-full py-2 border border-[#E5E7EB] text-[#5B5FF5] text-sm font-medium rounded-lg hover:bg-[#5B5FF5] hover:text-white transition-colors group-hover:bg-[#5B5FF5] group-hover:text-white"
              >
                열기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
