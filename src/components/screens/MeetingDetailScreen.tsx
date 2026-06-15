import { useParams, useNavigate } from "react-router";
import { Download, CheckCircle2, Square } from "lucide-react";
import { getMeetingById } from "../../data/meetings";

export function MeetingDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const meeting = getMeetingById(id!);

  if (!meeting) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-semibold text-[#1A1D2E] mb-2">회의를 찾을 수 없습니다</h3>
          <button
            onClick={() => navigate("/meetings")}
            className="mt-4 px-4 py-2 bg-[#5B5FF5] text-white rounded-lg"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const keywords = meeting.keywords || [];

  return (
    <div className="h-full p-6">
      {/* Meeting Title Header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-[#1A1D2E]">{meeting.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-[#6B7280]">{meeting.date}</span>
          <span className="text-sm text-[#9CA3AF]">•</span>
          <span className="text-sm text-[#6B7280]">{meeting.duration}</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_0.67fr] gap-6" style={{ height: 'calc(100% - 3rem)' }}>
        {/* Left Column - Conversation */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col border-2 border-[#5B5FF5]/20 bg-[#5B5FF5]/[0.02]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1D2E]">대화 내용</h2>
            <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              대화 내보내기
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-5 space-y-4">
            {meeting.messages.map((msg, idx) => (
              <div key={idx} className="flex gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${
                    msg.speaker === "A" ? "bg-[#5B5FF5]" : "bg-[#22D3EE]"
                  }`}
                >
                  {msg.speaker}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[#6B7280] mb-1">화자 {msg.speaker}</div>
                  <div className="bg-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm text-[#1A1D2E]">
                    {msg.text}
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col border-2 border-[#5B5FF5]/20 bg-[#5B5FF5]/[0.02]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-semibold text-[#1A1D2E]">대화 요약</h2>
              <div className="flex items-center gap-1.5 mt-1">
                {meeting.participants.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-xs rounded"
                  >
                    화자 {p}
                  </span>
                ))}
              </div>
            </div>
            <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              요약 내보내기
            </button>
          </div>

          {/* Summary Content */}
          <div className="flex-1 overflow-auto p-5 space-y-5">
            {/* Main Points */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">주요 내용</h3>
              <ul className="space-y-2">
                {[
                  "프로젝트 진행 상황 (70% 완료)",
                  "개발 진행 순조로움",
                  "마케팅 계획 (다음 주까지 초안 완료 예정)",
                  "예산 관련 추가 논의 필요",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FF5] mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decisions */}
            <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">결정 사항</h3>
              <ul className="space-y-2">
                {[
                  "마케팅 계획 초안 공유",
                  "예산 내용 별도 문서 공유",
                  "다음 회의에서 세부 계획 논의",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">후속 조치</h3>
              <ul className="space-y-3">
                {[
                  { task: "마케팅 초안 작성", assignee: "화자 A", due: "6/10" },
                  { task: "예산 문서 준비", assignee: "화자 B", due: "6/08" },
                  { task: "다음 회의 일정 조율", assignee: "화자 A", due: "6/12" },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Square className="w-4 h-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[#1A1D2E]">{item.task}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded">
                          {item.assignee}
                        </span>
                        <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs rounded">
                          {item.due}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Keywords */}
            <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">키워드</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded-md"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
