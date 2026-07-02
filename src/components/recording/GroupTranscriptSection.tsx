import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpeakerAvatar } from '../common/SpeakerAvatar';

export interface GroupSegment {
  id: string;
  speakerLabel: string;
  speakerName: string;
  text: string;
  startSec: number;
  isMine: boolean;
}

interface GroupTranscriptSectionProps {
  segments: GroupSegment[];
  isActive: boolean;
  colorMap: Record<string, string>; // speakerLabel → hex color
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function GroupTranscriptSection({ segments, isActive, colorMap }: GroupTranscriptSectionProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [segments.length]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex-shrink-0">
        <h2 className="font-semibold text-[#1A1D2E] text-sm">대화 내용</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence>
          {segments.length === 0 && !isActive && (
            <div className="h-full flex items-center justify-center text-sm text-[#9CA3AF]">
              대화가 시작되면 여기에 표시됩니다
            </div>
          )}

          {segments.map((seg) =>
            seg.isMine ? (
              /* ── 내 발화: 우측 정렬 ── */
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-end gap-1"
              >
                <span className="text-xs text-[#6B7280] mr-1">{seg.speakerName}</span>
                <div className="max-w-[75%] bg-[#EEF2FF] rounded-xl rounded-tr-sm px-4 py-2.5 text-sm text-[#1A1D2E]">
                  {seg.text}
                </div>
                <span className="text-xs text-[#9CA3AF] mr-1">{formatSec(seg.startSec)}</span>
              </motion.div>
            ) : (
              /* ── 상대방 발화: 좌측 정렬 ── */
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-3"
              >
                <SpeakerAvatar
                  letter={seg.speakerName.charAt(0)}
                  color={colorMap[seg.speakerLabel]}
                  size="sm"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#6B7280]">{seg.speakerName}</span>
                  <div className="max-w-[75%] bg-[#F3F4F6] rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-[#1A1D2E]">
                    {seg.text}
                  </div>
                  <span className="text-xs text-[#9CA3AF]">{formatSec(seg.startSec)}</span>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* 입력 중 인디케이터 */}
        {isActive && (
          <div className="flex gap-1.5 px-1 pt-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#5B5FF5]/40 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
