import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 회의 길이 표기 — "3분 20초" / 초가 0이면 "3분" / 1분 미만이면 "45초".
export function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}초`;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
}
