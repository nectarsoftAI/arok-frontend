import { Download, FileText, CheckCircle2, Square } from 'lucide-react';
import type { MeetingMode } from '../MeetingTitleDialog';

const KEYWORDS = ['프로젝트', '진행 상황', '개발', '마케팅', '예산', '일정', '회의'];

const KEY_POINTS = [
  '프로젝트 진행 상황 (70% 완료)',
  '개발 진행 순조로움',
  '마케팅 계획 (다음 주까지 초안 완료 예정)',
  '예산 관련 추가 논의 필요',
];

const DECISIONS = [
  '마케팅 계획 초안 공유',
  '예산 내용 별도 문서 공유',
  '다음 회의에서 세부 계획 논의',
];

const ACTION_ITEMS = [
  { task: '마케팅 초안 작성', assignee: '화자 A', due: '6/10' },
  { task: '예산 문서 준비', assignee: '화자 B', due: '6/08' },
  { task: '다음 회의 일정 조율', assignee: '화자 A', due: '6/12' },
];

interface SummaryPanelProps {
  meetingMode: MeetingMode;
  showSummary: boolean;
  isLoadingSummary: boolean;
}

export function SummaryPanel({ meetingMode, showSummary, isLoadingSummary }: SummaryPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-[#1A1D2E]">대화 요약</h2>
        <button
          disabled={!showSummary}
          className={`px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg transition-colors flex items-center gap-2 ${
            showSummary ? 'text-[#6B7280] hover:bg-[#F3F4F6] cursor-pointer' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          요약 내보내기
        </button>
      </div>

      <div className="overflow-auto p-5 space-y-5 flex-1">
        {isLoadingSummary ? (
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
        ) : !showSummary ? (
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
        ) : (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">주요 내용</h3>
              <ul className="space-y-2">
                {KEY_POINTS.map((item, idx) => (
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
                {DECISIONS.map((item, idx) => (
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
                {ACTION_ITEMS.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Square className="w-4 h-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[#1A1D2E]">{item.task}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded">{item.assignee}</span>
                        <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs rounded">{item.due}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1A1D2E] text-sm">키워드</h3>
              <div className="flex flex-wrap gap-2">
                {KEYWORDS.map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded-md">{keyword}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
