import { useMemo, useState } from "react";
import { DayMeetingPanel } from "./meetingFrequency/DayMeetingPanel";
import { HeatmapFooter } from "./meetingFrequency/HeatmapFooter";
import { HeatmapGrid } from "./meetingFrequency/HeatmapGrid";
import { MOCK_COUNTS, MOCK_MEETINGS } from "./meetingFrequency/mockData";
import { buildWeeks, getPageRange, type HeatmapMeeting } from "./meetingFrequency/heatmap";

interface MeetingFrequencyChartProps {
  /** 날짜(YYYY-MM-DD) → 회의 수. 격자 색만 결정한다. */
  counts?: Record<string, number>;
  /** 상세 패널에 뿌릴 회의 목록. 비어 있으면 건수만 노출된다. */
  meetings?: HeatmapMeeting[];
  /** 뒤로 넘길 수 있는 한계. 기본값은 1년 전. */
  earliestDate?: Date;
}

/**
 * 회의 빈도 히트맵 — GitHub 잔디 스타일. 6개월 단위로 페이지를 넘기고,
 * 날짜를 누르면 오른쪽 패널에 그 날의 회의가 뜬다.
 * 아직 API 가 없어 counts/meetings 를 생략하면 목업으로 그린다.
 */
export function MeetingFrequencyChart({
  counts = MOCK_COUNTS,
  meetings = MOCK_MEETINGS,
  earliestDate,
}: MeetingFrequencyChartProps) {
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

  const { startDate, endDate } = useMemo(() => getPageRange(today, pageOffset), [today, pageOffset]);

  const weeks = useMemo(
    () => buildWeeks(startDate, endDate, today, counts),
    [startDate, endDate, today, counts],
  );

  const selectedMeetings = useMemo(
    () => (selectedDate ? meetings.filter((m) => m.meetingDate === selectedDate) : []),
    [meetings, selectedDate],
  );

  const goToPage = (offset: number) => {
    setPageOffset(offset);
    setSelectedDate(null); // 다른 기간으로 넘어가면 선택은 화면 밖이 된다
  };

  return (
    <div className="flex items-start gap-6">
      <div className="flex-shrink-0">
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
        meetings={selectedMeetings}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
