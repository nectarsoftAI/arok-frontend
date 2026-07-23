import { Skeleton } from "../common/Skeleton";

export interface KeywordItem {
  keyword: string;
  count: number;
}

export function KeywordChart({ data }: { data: KeywordItem[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={`kw-${i}`} className="flex items-center gap-3">
          <span className="text-sm text-[#6B7280] w-16 text-right flex-shrink-0">{d.keyword}</span>
          <div className="flex-1 bg-[#F3F4F6] rounded-full h-6 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${(d.count / max) * 100}%`, backgroundColor: "#22D3EE" }}
            >
              <span className="text-xs text-white font-medium">{d.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 실제 차트가 상위 키워드부터 내려오는 모양이라, 막대도 점점 짧아지게 두면 덜 튄다.
const SKELETON_BAR_WIDTHS = ["90%", "76%", "63%", "51%", "42%", "34%"];

export function KeywordChartSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {SKELETON_BAR_WIDTHS.map((width, i) => (
        <div key={`kw-skeleton-${i}`} className="flex items-center gap-3">
          <Skeleton className="h-4 w-16 flex-shrink-0 bg-gray-200" />
          <div className="flex-1 bg-[#F3F4F6] rounded-full h-6 overflow-hidden">
            <Skeleton className="h-full rounded-full bg-gray-200" style={{ width }} />
          </div>
        </div>
      ))}
    </div>
  );
}
