import { motion } from "motion/react";
import personGroupIcon from "../../assets/icons/person_group_icon.webp";
import { Button } from "../common/Button";
import { SpeakerAvatar, SPEAKER_PALETTE } from "../common/SpeakerAvatar";
import type { OnlineParticipant } from "../../hooks/useOnlineMeeting";

interface WaitingRoomProps {
  participants: OnlineParticipant[];
  nameMap: Record<string, string>;
  currentUserId?: string;
  isHost: boolean;
  onStart: () => void;
}

export function WaitingRoom({ participants, nameMap, currentUserId, isHost, onStart }: WaitingRoomProps) {
  return (
    <motion.div
      key="waiting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* 참여자 목록 */}
        <div className="w-full bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
            <img src={personGroupIcon} alt="" className="w-4 h-4 object-contain" />
            <span className="text-sm font-medium text-[#1A1D2E]">
              참여자 {participants.length}명 입장
            </span>
          </div>
          <ul className="divide-y divide-[#F3F4F6]">
            {participants.length === 0 ? (
              <li className="px-5 py-4 text-sm text-[#9CA3AF] text-center">연결 중...</li>
            ) : (
              participants.map((p, i) => (
                <li key={p.profileId} className="flex items-center gap-3 px-5 py-3">
                  <SpeakerAvatar
                    letter={(nameMap[p.profileId] ?? "?").charAt(0)}
                    color={SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]}
                    size="sm"
                  />
                  <span className="text-sm text-[#1A1D2E] flex-1">
                    {nameMap[p.profileId] ?? "참여자"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {p.role === "ADMIN" && (
                      <span className="text-xs bg-[#EEF2FF] text-[#5B5FF5] px-2 py-0.5 rounded-full font-medium">방장</span>
                    )}
                    {p.profileId === currentUserId && (
                      <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full font-medium">나</span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {isHost ? (
          <Button variant="primary" size="lg" onClick={onStart} className="w-full">
            회의 시작
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#5B5FF5] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B7280] text-center">
              방장이 회의를 시작하면 자동으로 녹음이 시작됩니다
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
