import { useEffect, useState } from "react";
import { dashboardApi } from "../../../api/dashboard";
import { meetingsApi } from "../../../api/meetings";
import { toDateKey, type HeatmapMeeting } from "./heatmap";

/**
 * 격자에 칠할 날짜별 회의 수. get_meeting_counts_by_date 는 빈 날짜도 0 으로 채워 주므로
 * 여기서는 조회 → 맵 변환만 한다. 페이지(기간)를 넘길 때마다 다시 조회한다.
 */
export function useMeetingCounts(startDate: Date, endDate: Date) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const from = toDateKey(startDate);
  const to = toDateKey(endDate);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    dashboardApi
      .getMeetingCountsByDate(from, to, controller.signal)
      .then((rows) => {
        const map: Record<string, number> = {};
        rows.forEach((row) => {
          map[row.date] = row.count;
        });
        setCounts(map);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("[MeetingFrequency] 날짜별 회의 수 조회 실패 —", from, "~", to, err);
        setCounts({});
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [from, to]);

  return { counts, isLoading };
}

/** 하루에 담길 수 있는 회의 수 상한 — 상세 패널은 스크롤이라 넉넉히 잡아도 된다. */
const DAY_PAGE_SIZE = 50;

/**
 * 선택한 날짜의 회의 목록. 전용 API 대신 기존 검색(search_meetings)에
 * 기간을 하루로 좁혀 쓰고, 패널에 필요한 필드만 뽑는다.
 */
export function useDayMeetings(date: string | null) {
  const [meetings, setMeetings] = useState<HeatmapMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      setMeetings([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    meetingsApi
      .search({ dateFrom: date, dateTo: date }, 0, DAY_PAGE_SIZE, controller.signal)
      .then(({ data }) => {
        setMeetings(
          data.meetings.map((m) => ({
            meetingId: m.meetingId,
            meetingDate: date,
            title: m.title,
            durationSeconds: m.durationSeconds,
            participantCount: m.participants?.length ?? 0,
            meetingType: m.meetingType,
          })),
        );
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("[MeetingFrequency] 날짜별 회의 조회 실패 —", date, err);
        setMeetings([]);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [date]);

  return { meetings, isLoading };
}
