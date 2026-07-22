import { useEffect, useMemo, useRef, useState } from "react";
import { DayMeetingPanel } from "./meetingFrequency/DayMeetingPanel";
import { HeatmapFooter } from "./meetingFrequency/HeatmapFooter";
import { HeatmapGrid } from "./meetingFrequency/HeatmapGrid";
import { buildWeeks, getPageRange, weeksThatFit } from "./meetingFrequency/heatmap";
import { useDayMeetings, useMeetingCounts } from "./meetingFrequency/useMeetingFrequency";

interface MeetingFrequencyChartProps {
  /** 뒤로 넘길 수 있는 한계. 기본값은 1년 전. */
  earliestDate?: Date;
}

/**
 * 회의 빈도 히트맵 — GitHub 잔디 스타일. 6개월 단위로 페이지를 넘기고,
 * 날짜를 누르면 오른쪽 패널에 그 날의 회의가 뜬다.
 * 격자는 get_meeting_counts_by_date, 상세 패널은 search_meetings 로 각각 조회한다.
 */
export function MeetingFrequencyChart({ earliestDate }: MeetingFrequencyChartProps) {
  // pageOffset 0 = 최근 6개월, 1 = 그 이전 6개월 …
  const [pageOffset, setPageOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 마운트 시점의 "오늘"을 고정한다 — 렌더마다 new Date() 를 만들면 아래 메모가 매번 깨진다.
  const [today] = useState(() => new Date());

  const earliest = useMemo(() => {
    if (earliestDate) return earliestDate;
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }, [today, earliestDate]);

  // 격자가 실제로 차지한 폭을 재서 그 폭에 들어가는 만큼 주(열)를 그린다.
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => setGridWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const weeksPerPage = weeksThatFit(gridWidth);

  const { startDate, endDate } = useMemo(
    () => getPageRange(today, pageOffset, weeksPerPage),
    [today, pageOffset, weeksPerPage],
  );

  const { counts } = useMeetingCounts(startDate, endDate);
  const { meetings, isLoading: isDayLoading } = useDayMeetings(selectedDate);

  const weeks = useMemo(
    () => buildWeeks(startDate, endDate, today, counts),
    [startDate, endDate, today, counts],
  );

  const goToPage = (offset: number) => {
    setPageOffset(offset);
    setSelectedDate(null); // 다른 기간으로 넘어가면 선택은 화면 밖이 된다
  };

  return (
    <div className="flex items-start gap-6">
      {/* 격자 7 : 상세 패널 3 */}
      <div ref={gridRef} className="min-w-0 flex-[7]">
        <HeatmapGrid
          weeks={weeks}
          startDate={startDate}
          endDate={endDate}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
        <HeatmapFooter
          startDate={startDate}
          endDate={endDate}
          canGoBack={startDate > earliest}
          canGoForward={pageOffset > 0}
          onPrev={() => goToPage(pageOffset + 1)}
          onNext={() => goToPage(pageOffset - 1)}
        />
      </div>

      <DayMeetingPanel
        selectedDate={selectedDate}
        count={selectedDate ? (counts[selectedDate] ?? 0) : 0}
        meetings={meetings}
        isLoading={isDayLoading}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
