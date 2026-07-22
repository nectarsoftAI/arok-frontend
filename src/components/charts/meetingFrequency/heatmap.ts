// 회의 빈도 히트맵(GitHub 잔디 스타일)의 상수 · 순수 계산 로직.
// 렌더링과 분리해 두어 셀 배치/페이지 범위 계산을 컴포넌트 밖에서 검증할 수 있게 한다.

/** 히트맵 한 칸. count -1 은 렌더 범위 밖(다른 페이지이거나 미래) — 빈 칸으로 그린다. */
export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  count: number;
}

/** 선택한 날짜 패널에 뿌리는 회의 한 건. meeting_list_view 필드명을 그대로 따른다. */
export interface HeatmapMeeting {
  meetingId: string;
  meetingDate: string; // YYYY-MM-DD
  title: string;
  durationSeconds: number | null;
  participantCount: number;
  meetingType: string;
}

/** 0건 → 4건 이상. 인디고(#5B5FF5) 톤을 4단계로 나눴다. */
export const INTENSITY_COLORS = ["#F3F4F6", "#C7C9F9", "#9B9DF5", "#7577F2", "#5B5FF5"];

export const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
export const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** 한 화면에 보여 주는 개월 수 = 페이지 단위. */
export const MONTHS_PER_PAGE = 6;

export const CELL_SIZE = 14;
export const CELL_GAP = 3;
export const DAY_LABEL_WIDTH = 24;

export function intensityColor(count: number): string {
  return INTENSITY_COLORS[Math.min(Math.max(count, 0), 4)];
}

/** Date → "YYYY-MM-DD" (로컬 기준). toISOString 은 UTC 로 밀려 하루 어긋날 수 있어 쓰지 않는다. */
export function toDateKey(d: Date): string {
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mo}-${dd}`;
}

/** "YYYY-MM-DD" → 로컬 자정 Date. new Date(str) 은 UTC 로 파싱돼 시간대에 따라 하루 밀린다. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatKoreanDate(key: string): string {
  const [y, mo, d] = key.split("-");
  return `${y}년 ${Number(mo)}월 ${Number(d)}일`;
}

/** pageOffset 0 = 최근 MONTHS_PER_PAGE 개월, 1 = 그 이전 … */
export function getPageRange(today: Date, pageOffset: number): { startDate: Date; endDate: Date } {
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() - pageOffset * MONTHS_PER_PAGE);

  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - MONTHS_PER_PAGE);
  startDate.setDate(startDate.getDate() + 1);

  return { startDate, endDate };
}

/** 주(열) × 요일(행) 격자. 첫 열이 일요일에서 시작하도록 앞을 채운다. */
export function buildWeeks(
  startDate: Date,
  endDate: Date,
  today: Date,
  counts: Record<string, number>,
): HeatmapCell[][] {
  const cursor = new Date(startDate);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const weeks: HeatmapCell[][] = [];
  while (cursor <= endDate) {
    const week: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const key = toDateKey(cursor);
      const hidden = cursor < startDate || cursor > endDate || cursor > today;
      week.push({ date: key, count: hidden ? -1 : (counts[key] ?? 0) });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** 각 월이 처음 등장하는 열에만 라벨을 단다. 1월과 첫 열에는 연도까지 붙인다. */
export function buildMonthLabels(
  weeks: HeatmapCell[][],
  startDate: Date,
  endDate: Date,
): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];

  weeks.forEach((week, col) => {
    const ref = week[1]; // 월요일 기준 — 주가 월을 걸칠 때 표기가 덜 튄다
    if (!ref) return;

    const date = parseDateKey(ref.date);
    if (date < startDate || date > endDate) return;

    const prev = col > 0 ? parseDateKey(weeks[col - 1][1].date) : null;
    if (prev && prev.getMonth() === date.getMonth()) return;

    const month = MONTH_LABELS[date.getMonth()];
    const withYear = col === 0 || date.getMonth() === 0;
    labels.push({ label: withYear ? `${date.getFullYear()}년 ${month}` : month, col });
  });

  return labels;
}
