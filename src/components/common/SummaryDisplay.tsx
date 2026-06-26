import { CheckCircle2, Square } from 'lucide-react';
import type { SummaryResponse } from '../../api/summary';
import { Badge } from './Badge';

interface SummaryDisplayProps {
  summaryData: SummaryResponse;
}

export function SummaryDisplay({ summaryData }: SummaryDisplayProps) {
  return (
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
                  <Badge variant="primary">{item.assignee}</Badge>
                  <Badge variant="warning">{item.due_date}</Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {summaryData.keywords.length > 0 && (
        <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
          <h3 className="font-semibold text-[#1A1D2E] text-sm">키워드</h3>
          <div className="flex flex-wrap gap-2">
            {summaryData.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="primary" size="md">{keyword}</Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
