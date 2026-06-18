import { Download, FileText, CheckCircle2, Square } from 'lucide-react';
import type { MeetingMode } from '../MeetingTitleDialog';
import type { SummaryResponse } from '../../api/summary';

interface SummaryPanelProps {
  meetingMode: MeetingMode;
  showSummary: boolean;
  isLoadingSummary: boolean;
  summaryData: SummaryResponse | null;
  isSummaryLoading: boolean;
  summaryError: string | null;
}

export function SummaryPanel({
  meetingMode,
  showSummary,
  isLoadingSummary,
  summaryData,
  isSummaryLoading,
  summaryError,
}: SummaryPanelProps) {
  const isLoading = isLoadingSummary || isSummaryLoading;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-[#1A1D2E]">대화 요약</h2>
        <button
          disabled={!showSummary && !summaryData}
          className={`px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg transition-colors flex items-center gap-2 ${
            showSummary || summaryData ? 'text-[#6B7280] hover:bg-[#F3F4F6] cursor-pointer' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          요약 내보내기
        </button>
      </div>

      <div className="overflow-auto p-5 space-y-5 flex-1">
        {isLoading ? (
          <div className="space-y-4">
            <p className="text-sm text-center text-[#6B7280]">회의 내용을 분석하고 있습니다...</p>
            <div className="space-y-5 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : summaryError ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <p className="text-sm text-red-500">{summaryError}</p>
          </div>
        ) : summaryData ? (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">주요 내용</h3>
              <ul className="space-y-2">
                {summaryData.summary.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FF5] mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">결정 사항</h3>
              <ul className="space-y-2">
                {summaryData.decisions.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">후속 조치</h3>
              <ul className="space-y-3">
                {summaryData.action_items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Square className="w-4 h-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[#1A1D2E]">{item.task}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded">{item.assignee}</span>
                        <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs rounded">{item.due_date}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">키워드</h3>
              <div className="flex flex-wrap gap-2">
                {summaryData.keywords.map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded-md">{keyword}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22D3EE]/10 to-[#22D3EE]/20 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-[#22D3EE]" />
            </div>
            <h3 className="font-semibold text-[#1A1D2E] mb-2">요약이 준비되지 않았습니다</h3>
            <p className="text-sm text-[#6B7280]">
              {meetingMode === 'live'
                ? '대화를 진행한 후 요약 버튼을 눌러주세요.'
                : '파일을 업로드한 후 요약 버튼을 눌러주세요.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
