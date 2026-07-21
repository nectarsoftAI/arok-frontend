export interface MeetingFilterState {
  keyword: string;
  /** 단일 값 — RPC 의 p_meeting_type 이 하나만 받는다. 빈 문자열이면 전체. */
  meetingType: string;
  dateFrom: string;
  dateTo: string;
}

export const emptyFilters: MeetingFilterState = {
  keyword: "",
  meetingType: "",
  dateFrom: "",
  dateTo: "",
};

export const hasActiveFilters = (f: MeetingFilterState) =>
  !!(f.keyword.trim() || f.meetingType || f.dateFrom || f.dateTo);
