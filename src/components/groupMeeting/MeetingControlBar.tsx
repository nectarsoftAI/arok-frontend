import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, LogOut, Mic, MicOff, PhoneOff } from "lucide-react";

interface MeetingControlBarProps {
  isHidden: boolean;
  onToggleHidden: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onLeaveClick: () => void;
  isHost: boolean;
  onEndClick: () => void;
}

export function MeetingControlBar({
  isHidden,
  onToggleHidden,
  isMuted,
  onToggleMute,
  onLeaveClick,
  isHost,
  onEndClick,
}: MeetingControlBarProps) {
  return (
    <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-2 pointer-events-none">
      {/* 접기/펼치기 토글 — 항상 노출, 알약 박스 바로 위에 위치 */}
      <button
        onClick={onToggleHidden}
        title={isHidden ? "컨트롤 바 펼치기" : "컨트롤 바 접기"}
        className="pointer-events-auto w-7 h-7 rounded-full bg-white border border-[#E5E7EB] shadow-md flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
      >
        {isHidden ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {!isHidden && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto inline-flex items-center gap-4 rounded-full border border-[#E5E7EB] bg-white px-5 py-3 shadow-lg"
          >
            {/* 음소거 — 회색/반투명 배경, 아이콘은 항상 흰색, 음소거 시 배경이 빨간색으로 전환 */}
            <button
              onClick={onToggleMute}
              title={isMuted ? "음소거 해제" : "음소거"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? "bg-[#EF4444] hover:bg-[#EF4444]/90" : "bg-[#4B5563]/90 hover:bg-[#4B5563]"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>

            {/* 나가기 — 방장/참여자 공통, 회색/반투명 배경에 hover·press 시 배경이 파란색으로 전환 */}
            <button
              onClick={onLeaveClick}
              title="나가기"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[#4B5563]/90 hover:bg-[#5B5FF5] active:bg-[#5B5FF5] transition-colors"
            >
              <LogOut className="w-6 h-6 text-white" />
            </button>

            {/* 회의 종료 — 방장 전용, 항상 빨간색 */}
            {isHost && (
              <button
                onClick={onEndClick}
                title="회의 종료"
                className="w-14 h-14 rounded-full flex items-center justify-center bg-[#EF4444] hover:bg-[#EF4444]/90 transition-colors"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
