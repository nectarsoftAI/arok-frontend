import type { SummaryResponse } from '../../api/summary';
import { SummaryDisplay } from '../common/SummaryDisplay';

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
        <SummaryDisplay summaryData={summaryData} />
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
