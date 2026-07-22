import supabaseClient from './supabaseClient';

/** get_dashboard_stats RPC의 cards 부분만 — 나머지 필드는 대응 UI가 없어 다루지 않는다. */
export interface DashboardCards {
  meetingsThisMonth: number;
  avgDurationMin: number;
  aiCompletedRate: number;
}

/** 날짜별 회의 수 한 건. 회의가 없는 날짜도 count: 0 으로 채워져 내려온다. */
export interface MeetingCountByDate {
  date: string; // YYYY-MM-DD
  count: number;
}

export const dashboardApi = {
  /** 대시보드 상단 KPI 카드 통계 — Supabase RPC(get_dashboard_stats) 직접 호출. */
  getCards: async (signal?: AbortSignal): Promise<DashboardCards> => {
    const res = await supabaseClient.post('/rpc/get_dashboard_stats', {}, { signal });
    return res.data.cards;
  },

  /**
   * 기간 내 날짜별 회의 수 — Supabase RPC(get_meeting_counts_by_date) 직접 호출.
   * dateFrom/dateTo 모두 포함이며, 빈 날짜도 0 으로 채워 (종료일 - 시작일 + 1) 개가 내려온다.
   */
  getMeetingCountsByDate: async (
    dateFrom: string,
    dateTo: string,
    signal?: AbortSignal,
  ): Promise<MeetingCountByDate[]> => {
    const res = await supabaseClient.post(
      '/rpc/get_meeting_counts_by_date',
      { p_date_from: dateFrom, p_date_to: dateTo },
      { signal },
    );
    return res.data ?? [];
  },
};
