import { useState, useRef, useEffect } from "react";
import { Calendar, Search, X, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { MEETING_TYPE_OPTIONS } from "../common/meetingTypes";
import { Input } from "../common/Input";
import { emptyFilters, hasActiveFilters, type MeetingFilterState } from "./meetingFilters";

const typeLabelOf = (value: string) =>
  MEETING_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

// ── 바깥 클릭 / Esc 로 닫기 ──────────────────────────────────────────
function useDismiss(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);
  return ref;
}

const panelBase =
  "absolute left-0 top-full mt-1 z-20 bg-white border border-[#E5E7EB] p-4";
const footerBtn =
  "flex-1 py-1.5 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors";

// ── 날짜 범위 드롭다운 ───────────────────────────────────────────────
interface DateRange {
  from: string;
  to: string;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** Date 를 로컬 기준 YYYY-MM-DD 로. toISOString() 은 UTC 로 밀려 하루 어긋날 수 있어 쓰지 않는다. */
function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function DateRangeDropdown({
  value,
  onChange,
  onClose,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
  onClose: () => void;
}) {
  const ref = useDismiss(onClose);
  const today = new Date();

  // 이미 선택된 범위가 있으면 그 달을 펼친 채로 연다.
  const initial = value.from ? new Date(`${value.from}T00:00:00`) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [hovered, setHovered] = useState("");

  // 범위를 고르는 중간 상태(시작일만 찍힌 상태)로 검색이 나가지 않도록 '적용' 전까지 draft 로 들고 있는다.
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (dateStr: string) => {
    if (!from || to) {
      // 새로 시작 — 첫 클릭은 항상 시작일
      setFrom(dateStr);
      setTo("");
    } else if (dateStr < from) {
      // 시작일보다 앞을 찍으면 뒤집어서 채운다
      setTo(from);
      setFrom(dateStr);
    } else {
      setTo(dateStr);
    }
  };

  const apply = () => {
    // 하루만 찍고 적용하면 그 하루짜리 범위로 본다 (RPC 의 from/to 모두 해당 일 포함)
    if (from) onChange({ from, to: to || from });
    onClose();
  };
  const clear = () => {
    setFrom("");
    setTo("");
    onChange({ from: "", to: "" });
    onClose();
  };

  // 달력 셀 — 1일의 요일만큼 앞을 비우고, 마지막 주를 채워 7의 배수로 맞춘다.
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // 종료일을 고르는 중에는 마우스가 올라간 날짜까지 범위를 미리 칠해 준다.
  const effectiveTo = to || (from && hovered > from ? hovered : "");
  const rangeStart = from;
  const rangeEnd = effectiveTo || from;
  const hasSpan = !!(rangeStart && rangeEnd && rangeStart !== rangeEnd);

  const todayStr = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div ref={ref} className={`${panelBase} rounded-2xl shadow-xl w-[300px] select-none`}>
      {/* 월 이동 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} aria-label="이전 달" className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-[#1A1D2E]">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button onClick={nextMonth} aria-label="다음 달" className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs py-1 font-medium ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[#9CA3AF]"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7" onMouseLeave={() => setHovered("")}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const dateStr = toYMD(viewYear, viewMonth, day);
          const isStart = dateStr === rangeStart;
          const isEnd = dateStr === rangeEnd;
          const inRange = hasSpan && dateStr > rangeStart && dateStr < rangeEnd;
          const isToday = dateStr === todayStr;
          const isSun = idx % 7 === 0;
          const isSat = idx % 7 === 6;

          return (
            <div key={dateStr} className="relative flex items-center justify-center h-9">
              {/* 범위 배경 — 원 뒤에 깔린다. 시작/끝 날짜는 반쪽만 칠해 양끝을 둥글게 보이게 한다. */}
              {inRange && <div className="absolute inset-y-1 left-0 right-0 bg-[#EEF2FF]" />}
              {isStart && hasSpan && <div className="absolute inset-y-1 left-1/2 right-0 bg-[#EEF2FF]" />}
              {isEnd && hasSpan && <div className="absolute inset-y-1 left-0 right-1/2 bg-[#EEF2FF]" />}

              <button
                onClick={() => handleDayClick(dateStr)}
                onMouseEnter={() => { if (from && !to) setHovered(dateStr); }}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  isStart || isEnd
                    ? "bg-[#5B5FF5] text-white font-semibold"
                    : inRange
                    ? "text-[#5B5FF5] hover:bg-[#5B5FF5]/10"
                    : isToday
                    ? "bg-[#22D3EE] text-white font-semibold"
                    : isSun
                    ? "text-red-400 hover:bg-[#F3F4F6]"
                    : isSat
                    ? "text-blue-400 hover:bg-[#F3F4F6]"
                    : "text-[#1A1D2E] hover:bg-[#F3F4F6]"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* 안내 */}
      <div className="mt-3 mb-3 text-center text-xs text-[#9CA3AF]">
        {!from ? (
          "시작일을 선택하세요"
        ) : !to ? (
          <span>
            시작: <span className="text-[#5B5FF5] font-medium">{from}</span> — 종료일을 선택하세요
          </span>
        ) : (
          <span className="text-[#5B5FF5] font-medium">{from} ~ {to}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={clear} className={footerBtn}>초기화</button>
        <button
          onClick={apply}
          disabled={!from}
          className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-colors ${
            from
              ? "bg-[#5B5FF5] text-white hover:bg-[#4F53E8]"
              : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
          }`}
        >
          적용
        </button>
      </div>
    </div>
  );
}

// ── 유형 드롭다운 ────────────────────────────────────────────────────
function TypeFilterDropdown({
  selected,
  onChange,
  onClose,
}: {
  selected: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const ref = useDismiss(onClose);

  // 단일 선택이라 draft/적용 없이 고른 즉시 반영하고 닫는다. 같은 항목을 다시 누르면 해제.
  const pick = (value: string) => {
    onChange(selected === value ? "" : value);
    onClose();
  };

  return (
    <div ref={ref} className={`${panelBase} rounded-xl shadow-lg w-56`}>
      <p className="text-xs font-semibold text-[#1A1D2E] mb-3">회의 유형</p>
      <div className="space-y-1.5">
        {MEETING_TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const checked = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                checked ? "bg-[#EEF2FF] text-[#5B5FF5]" : "hover:bg-[#F3F4F6] text-[#4B5563]"
              }`}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: checked ? opt.bg : "#F3F4F6" }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: checked ? opt.color : "#9CA3AF" }} />
              </div>
              <span className="flex-1 text-left">{opt.label}</span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  checked ? "border-[#5B5FF5] bg-[#5B5FF5]" : "border-[#D1D5DB]"
                }`}
              >
                {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 필터 바 ──────────────────────────────────────────────────────────
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
            <TypeFilterDropdown
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
