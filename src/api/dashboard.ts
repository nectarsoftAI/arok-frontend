import supabaseClient from './supabaseClient';
import type { KeywordItem } from '../components/charts/KeywordChart';

export interface DashboardCards {
  meetingsThisMonth: number;
  avgDurationMin: number;
  aiCompletedRate: number;
}

export interface DashboardStats {
  cards: DashboardCards;
  keywordTop: KeywordItem[];
}

export interface MeetingCountByDate {
  date: string;
  count: number;
}

export const dashboardApi = {
  getCards: async (signal?: AbortSignal): Promise<DashboardCards> => {
    const res = await supabaseClient.post('/rpc/get_dashboard_stats', {}, { signal });
    return res.data.cards;
  },

  getStats: async (signal?: AbortSignal): Promise<DashboardStats> => {
    const res = await supabaseClient.post('/rpc/get_dashboard_stats', {}, { signal });
    return {
      cards: res.data.cards,
      keywordTop: res.data.keywordTop ?? [],
    };
  },

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
