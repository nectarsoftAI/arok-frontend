import { SpeakerAvatar, SPEAKER_PALETTE } from "../common/SpeakerAvatar";
import type { OnlineParticipant } from "../../hooks/useOnlineMeeting";

interface ParticipantPanelProps {
  totalCount: number;
  sortedParticipants: OnlineParticipant[];
  nameMap: Record<string, string>;
  colorIndexMap: Map<string, number>;
  currentUserId?: string;
  activeSpeakerIds: string[];
}

export function ParticipantPanel({
  totalCount,
  sortedParticipants,
  nameMap,
  colorIndexMap,
  currentUserId,
  activeSpeakerIds,
}: ParticipantPanelProps) {
  return (
    <div className="w-64 flex-shrink-0 border-l border-[#E5E7EB] bg-white overflow-y-auto">
      <div className="px-4 py-3 border-b border-[#E5E7EB] sticky top-0 bg-white">
        <span className="text-sm font-medium text-[#1A1D2E]">참여자 {totalCount}명</span>
      </div>
      <ul className="p-3 space-y-3">
        {sortedParticipants.map((p) => (
          <li key={p.profileId} className="flex items-center gap-2.5">
            <SpeakerAvatar
              letter={(nameMap[p.profileId] ?? "?").charAt(0)}
              color={SPEAKER_PALETTE[(colorIndexMap.get(p.profileId) ?? 0) % SPEAKER_PALETTE.length]}
              size="md"
              speaking={activeSpeakerIds.includes(p.profileId)}
            />
            <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-sm text-[#1A1D2E] truncate">{nameMap[p.profileId] ?? "참여자"}</span>
              {p.role === "ADMIN" && (
                <span className="text-[10px] bg-[#EEF2FF] text-[#5B5FF5] px-1.5 py-0.5 rounded flex-shrink-0">방장</span>
              )}
              {p.profileId === currentUserId && (
                <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded flex-shrink-0">나</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
