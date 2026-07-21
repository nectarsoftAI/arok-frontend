import { useState } from "react";
import { Calendar, Search, X, ChevronDown, RotateCcw } from "lucide-react";
import { MEETING_TYPE_OPTIONS } from "../common/meetingTypes";
import { DateRangeDropdown } from "../common/DateRangeDropdown";
import { MeetingTypeDropdown } from "./MeetingTypeDropdown";
import { Input } from "../common/Input";
import { emptyFilters, hasActiveFilters, type MeetingFilterState } from "./meetingFilters";

const typeLabelOf = (value: string) =>
  MEETING_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

interface MeetingListFiltersProps {
  value: MeetingFilterState;
  onChange: (next: MeetingFilterState) => void;
}

export function MeetingListFilters({ value, onChange }: MeetingListFiltersProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const set = <K extends keyof MeetingFilterState>(key: K, v: MeetingFilterState[K]) =>
    onChange({ ...value, [key]: v });

  const active = hasActiveFilters(value);
  const hasDate = !!(value.dateFrom || value.dateTo);

  const dateLabel = hasDate
    ? `${value.dateFrom || "∞"} ~ ${value.dateTo || "∞"}`
    : "날짜 범위";
  const typeLabel = value.meetingType ? typeLabelOf(value.meetingType) : "회의 유형";

  const triggerClass = (on: boolean) =>
    `flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors whitespace-nowrap ${
      on
        ? "border-[#5B5FF5] bg-[#EEF2FF] text-[#5B5FF5] font-medium"
        : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3F4F6]"
    }`;

  return (
    <div>
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* 키워드 */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          <Input
            size="sm"
            value={value.keyword}
            onChange={(e) => set("keyword", e.target.value)}
            placeholder="제목 및 키워드 검색"
            aria-label="제목 및 키워드 검색"
            className="pl-9"
          />
        </div>

        {/* 날짜 범위 */}
        <div className="relative">
          <button
            onClick={() => {
              setDateOpen((o) => !o);
              setTypeOpen(false);
            }}
            className={triggerClass(hasDate)}
          >
            <Calendar className="w-4 h-4" />
            {dateLabel}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dateOpen ? "rotate-180" : ""}`} />
          </button>
          {dateOpen && (
            <DateRangeDropdown
              value={{ from: value.dateFrom, to: value.dateTo }}
              onChange={(v) => onChange({ ...value, dateFrom: v.from, dateTo: v.to })}
              onClose={() => setDateOpen(false)}
            />
          )}
        </div>

        {/* 유형 */}
        <div className="relative">
          <button
            onClick={() => {
              setTypeOpen((o) => !o);
              setDateOpen(false);
            }}
            className={triggerClass(!!value.meetingType)}
          >
            {typeLabel}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
          </button>
          {typeOpen && (
            <MeetingTypeDropdown
              selected={value.meetingType}
              onChange={(v) => set("meetingType", v)}
              onClose={() => setTypeOpen(false)}
            />
          )}
        </div>

        {/* 초기화 */}
        {active && (
          <button
            onClick={() => onChange(emptyFilters)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B7280] hover:text-[#1A1D2E] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        )}
      </div>

      {/* 적용된 필터 태그 */}
      {active && (
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {value.keyword.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F3F4F6] text-[#4B5563] text-xs rounded-full">
              "{value.keyword}"
              <button onClick={() => set("keyword", "")} aria-label="키워드 필터 제거">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {hasDate && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F3F4F6] text-[#4B5563] text-xs rounded-full">
              {dateLabel}
              <button
                onClick={() => onChange({ ...value, dateFrom: "", dateTo: "" })}
                aria-label="날짜 필터 제거"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {value.meetingType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded-full">
              {typeLabel}
              <button onClick={() => set("meetingType", "")} aria-label="유형 필터 제거">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
