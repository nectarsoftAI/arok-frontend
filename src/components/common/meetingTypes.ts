import { Video, Mic, Upload, type LucideIcon } from "lucide-react";

// 백엔드 meeting_type 값 → 라벨/아이콘/색. 색은 날짜 뱃지의 인디고(#5B5FF5)와 겹치지 않게 골랐다.
// 조회 전 toUpperCase() 로 정규화한다 — 백엔드가 'group'만 소문자로 내려준다.
//
// query: DB 에 실제로 저장된 문자열. search_meetings RPC 의 p_meeting_type 은 정확히 일치하는
// 값을 찾으므로, 표시용 키(대문자)가 아니라 이 값을 그대로 보내야 한다.
// 'group' 만 소문자인 이유도 위와 같다 — 대문자로 보내면 온라인 회의가 검색되지 않는다.
export const MEETING_TYPES: Record<
  string,
  { label: string; icon: LucideIcon; cls: string; color: string; bg: string; query: string }
> = {
  GROUP:    { label: "온라인 회의",  icon: Video,  cls: "bg-[#F0FDFA] text-[#0F766E]", color: "#0F766E", bg: "#F0FDFA", query: "group" },
  REALTIME: { label: "실시간 회의",  icon: Mic,    cls: "bg-[#FFF1F2] text-[#BE123C]", color: "#BE123C", bg: "#FFF1F2", query: "REALTIME" },
  UPLOAD:   { label: "파일 업로드",  icon: Upload, cls: "bg-[#FEF3C7] text-[#B45309]", color: "#B45309", bg: "#FEF3C7", query: "UPLOAD" },
};

/** 유형 필터 드롭다운이 쓰는 선택지 — value 는 RPC 로 보내는 값(= DB 저장값). */
export const MEETING_TYPE_OPTIONS = Object.entries(MEETING_TYPES).map(
  ([key, meta]) => ({ ...meta, key, value: meta.query }),
);
