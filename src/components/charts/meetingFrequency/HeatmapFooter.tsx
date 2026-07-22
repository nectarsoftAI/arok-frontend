import { ChevronLeft, ChevronRight } from "lucide-react";
import { INTENSITY_COLORS } from "./heatmap";

interface HeatmapFooterProps {
  startDate: Date;
  endDate: Date;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** 색 범례 + 기간 페이지네이션. 격자 아래, 격자 너비에 맞춰 놓인다. */
export function HeatmapFooter({ startDate, endDate, canGoBack, canGoForward, onPrev, onNext }: HeatmapFooterProps) {
  // 해가 바뀌는 구간에서만 끝 연도를 함께 표기한다.
  const crossesYear = startDate.getFullYear() !== endDate.getFullYear();
  const range =
    `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 – ` +
    `${crossesYear ? `${endDate.getFullYear()}년 ` : ""}${endDate.getMonth() + 1}월`;

  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#9CA3AF]">적음</span>
        {INTENSITY_COLORS.map((color) => (
          <div key={color} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color }} />
        ))}
        <span className="text-[11px] text-[#9CA3AF]">많음</span>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoBack}
          aria-label="이전 기간"
          className="flex h-6 w-6 items-center justify-center rounded text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={13} />
        </button>
        <span className="px-1 text-[11px] text-[#9CA3AF] whitespace-nowrap">{range}</span>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoForward}
          aria-label="다음 기간"
          className="flex h-6 w-6 items-center justify-center rounded text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
