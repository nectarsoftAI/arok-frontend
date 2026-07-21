import supabaseClient from './supabaseClient';

/** get_dashboard_stats RPC의 cards 부분만 — 나머지 필드는 대응 UI가 없어 다루지 않는다. */
export interface DashboardCards {
  meetingsThisMonth: number;
  avgDurationMin: number;
  aiCompletedRate: number;
}

export const dashboardApi = {
  /** 대시보드 상단 KPI 카드 통계 — Supabase RPC(get_dashboard_stats) 직접 호출. */
  getCards: async (signal?: AbortSignal): Promise<DashboardCards> => {
    const res = await supabaseClient.post('/rpc/get_dashboard_stats', {}, { signal });
    return res.data.cards;
  },
};
