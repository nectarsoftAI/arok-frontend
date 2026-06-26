import { Calendar } from "lucide-react";
import { Input } from "../common/Input";

export function MeetingListFilters() {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1 max-w-xs">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <Input size="sm" placeholder="날짜 범위" className="pl-10" />
      </div>
      <select className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5] focus:border-transparent text-[#6B7280]">
        <option>유형</option>
        <option value="live">실시간 녹음</option>
        <option value="upload">파일 업로드</option>
      </select>
      <Input size="sm" placeholder="키워드 검색" className="flex-1 max-w-sm" />
    </div>
  );
}
