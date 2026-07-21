import { MEETING_TYPE_OPTIONS } from "../common/meetingTypes";
import { useDismiss } from "../../hooks/useDismiss";

interface MeetingTypeDropdownProps {
  /** 선택된 meeting_type (DB 저장값). 빈 문자열이면 전체. */
  selected: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

/**
 * 회의 유형 단일 선택 패널. 트리거 버튼은 호출부가 갖고, 이 컴포넌트는 패널만 그린다.
 * 부모에 position: relative 가 있어야 한다 — 패널이 absolute 로 붙는다.
 *
 * 단일 선택인 이유: search_meetings RPC 의 p_meeting_type 이 값을 하나만 받는다.
 */
export function MeetingTypeDropdown({ selected, onChange, onClose }: MeetingTypeDropdownProps) {
  const ref = useDismiss(onClose);

  // draft/적용 없이 고른 즉시 반영하고 닫는다. 같은 항목을 다시 누르면 해제.
  const pick = (value: string) => {
    onChange(selected === value ? "" : value);
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#E5E7EB] rounded-xl shadow-lg w-56 p-4"
    >
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
