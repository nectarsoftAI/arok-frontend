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

export const CELL_SIZE = 14;
export const CELL_GAP = 3;
export const DAY_LABEL_WIDTH = 24;

/**
 * 한 페이지에 그릴 주(열) 수는 격자 폭에 맞춰 정한다 — 화면이 넓을수록 더 긴 기간을 보여 준다.
 * 폭을 재기 전 첫 렌더에 쓸 기본값과, 너무 좁거나 넓을 때의 한계.
 */
/**
 * 월 라벨이 겹치지 않으려면 필요한 열 수(1열 = 17px).
 * 10px 폰트 기준 "12월" ≈ 21px, "2026년 1월" ≈ 51px 이라 각각 2열·4열이면 넉넉하다.
 */
export const LABEL_COLS = 2;
export const LABEL_COLS_WITH_YEAR = 4;

export const DEFAULT_WEEKS_PER_PAGE = 26;
export const MIN_WEEKS_PER_PAGE = 8;
export const MAX_WEEKS_PER_PAGE = 60;

/** 주어진 격자 폭에 몇 개의 열이 들어가는지. 요일 라벨 자리를 뺀 나머지로 계산한다. */
export function weeksThatFit(gridWidth: number): number {
  if (!gridWidth) return DEFAULT_WEEKS_PER_PAGE;
  const usable = gridWidth - DAY_LABEL_WIDTH - CELL_GAP;
  const fits = Math.floor(usable / (CELL_SIZE + CELL_GAP));
  return Math.min(Math.max(fits, MIN_WEEKS_PER_PAGE), MAX_WEEKS_PER_PAGE);
}

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

/**
 * pageOffset 0 = 최근 weeksPerPage 주, 1 = 그 이전 …
 * 시작일은 항상 일요일로 맞춘다 — 그래야 격자 열 수가 정확히 weeksPerPage 가 되고
 * 첫 열에 빈 칸이 생기지 않는다.
 */
export function getPageRange(
  today: Date,
  pageOffset: number,
  weeksPerPage: number,
): { startDate: Date; endDate: Date } {
  // 첫 페이지의 시작(= 오늘이 속한 주에서 weeksPerPage - 1 주 앞의 일요일)을 기준점으로 잡고
  // 페이지 단위로 그만큼씩 뒤로 민다.
  const startDate = new Date(today);
  startDate.setDate(
    startDate.getDate() - today.getDay() - (weeksPerPage - 1) * 7 - pageOffset * weeksPerPage * 7,
  );

  // 첫 페이지는 오늘까지(마지막 주가 잘린다), 이전 페이지들은 토요일까지 꽉 채운다.
  // 이렇게 해야 페이지 사이에 빠지는 날이 없다.
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + weeksPerPage * 7 - 1);

  return { startDate, endDate: pageOffset === 0 ? new Date(today) : endDate };
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
  const candidates: { short: string; long: string | null; col: number }[] = [];

  weeks.forEach((week, col) => {
    const ref = week[1]; // 월요일 기준 — 주가 월을 걸칠 때 표기가 덜 튄다
    if (!ref) return;

    const date = parseDateKey(ref.date);
    if (date < startDate || date > endDate) return;

    const prev = col > 0 ? parseDateKey(weeks[col - 1][1].date) : null;
    if (prev && prev.getMonth() === date.getMonth()) return;

    // 연도는 해가 바뀌는 1월에만 붙인다. 첫 열에도 붙이면 바로 뒤 라벨과 겹치기 쉬운데,
    // 어차피 하단 페이지네이션이 "2025년 12월 – 2026년 7월" 로 기간을 알려 준다.
    const month = MONTH_LABELS[date.getMonth()];
    const isJanuary = date.getMonth() === 0;
    candidates.push({ short: month, long: isJanuary ? `${date.getFullYear()}년 ${month}` : null, col });
  });

  // 라벨은 14px 열 밖으로 넘쳐 그려지므로, 다음 라벨(또는 격자 끝)까지 남은 자리에 맞춰
  // 연도까지 → 월만 → 생략 순으로 줄인다. 월 중간에서 시작하는 첫 열이 주로 생략된다.
  const labels: { label: string; col: number }[] = [];

  candidates.forEach((c, i) => {
    const room = (candidates[i + 1]?.col ?? weeks.length) - c.col;
    if (c.long && room >= LABEL_COLS_WITH_YEAR) labels.push({ label: c.long, col: c.col });
    else if (room >= LABEL_COLS) labels.push({ label: c.short, col: c.col });
  });

  return labels;
}
