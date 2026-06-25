import { CheckCircle2, Square } from 'lucide-react';
import type { SummaryResponse } from '../../api/summary';

interface SummarySectionProps {
  summaryData: SummaryResponse | null;
  summaryError: string | null;
  headless?: boolean;
}

export function SummarySection({ summaryData, summaryError, headless = false }: SummarySectionProps) {
  const content = (
    <div className="p-5 space-y-5">
      {summaryError ? (
        <p className="text-sm text-red-500 text-center py-4">{summaryError}</p>
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
      ) : null}
    </div>
  );

  if (headless) return content;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <h2 className="font-semibold text-[#1A1D2E]">대화 요약</h2>
      </div>
      {content}
    </div>
  );
}
