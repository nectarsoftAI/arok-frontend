import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDismiss } from "../../hooks/useDismiss";

export interface DateRange {
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  to: string;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 로컬 기준 YYYY-MM-DD. toISOString() 은 UTC 로 밀려 하루 어긋날 수 있어 쓰지 않는다. */
function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface DateRangeDropdownProps {
  value: DateRange;
  /** '적용'/'초기화' 를 누른 순간에만 호출된다. 날짜를 찍는 중에는 호출되지 않는다. */
  onChange: (v: DateRange) => void;
  onClose: () => void;
}

/**
 * 기간 선택 캘린더 패널. 트리거 버튼은 호출부가 갖고, 이 컴포넌트는 패널만 그린다.
 * 부모에 position: relative 가 있어야 한다 — 패널이 absolute 로 붙는다.
 */
export function DateRangeDropdown({ value, onChange, onClose }: DateRangeDropdownProps) {
  const ref = useDismiss(onClose);
  const today = new Date();

  // 이미 선택된 범위가 있으면 그 달을 펼친 채로 연다.
  const initial = value.from ? new Date(`${value.from}T00:00:00`) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [hovered, setHovered] = useState("");

  // 범위를 고르는 중간 상태(시작일만 찍힌 상태)가 밖으로 새지 않도록 '적용' 전까지 draft 로 들고 있는다.
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
    // 하루만 찍고 적용하면 그 하루짜리 범위로 본다
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
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl w-[300px] p-4 select-none"
    >
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
        <button
          onClick={clear}
          className="flex-1 py-1.5 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
        >
          초기화
        </button>
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
