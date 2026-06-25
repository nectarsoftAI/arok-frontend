import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MeetingMode } from '../MeetingTitleDialog';
import type { TranscriptSegment } from '../../api/types';
import type { SegmentMessage } from '../../services/live/types';

interface TranscriptSectionProps {
  meetingMode: MeetingMode;
  transcripts: TranscriptSegment[];
  segments: SegmentMessage[];
  speakerColorMap: Record<string, string>;
  speakerIndexMap: Record<string, string>;
  liveColorMap: Record<string, string>;
  liveIndexMap: Record<string, string>;
  formatSec: (sec: number) => string;
  isRecording: boolean;
  canExport: boolean;
  headless?: boolean;
}

export function TranscriptSection({
  meetingMode,
  transcripts,
  segments,
  speakerColorMap,
  speakerIndexMap,
  liveColorMap,
  liveIndexMap,
  formatSec,
  isRecording,
  headless = false,
}: TranscriptSectionProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [transcripts.length, segments.length]);

  const content = (
    <div className="p-5 space-y-4">
      <AnimatePresence>
        {meetingMode === 'upload'
          ? transcripts.map((seg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.025 }}
                className="flex gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${speakerColorMap[seg.speakerLabel]}`}
                >
                  {speakerIndexMap[seg.speakerLabel]}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[#6B7280] mb-1">{seg.speakerDisplay}</div>
                  <div className="bg-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm text-[#1A1D2E]">{seg.content}</div>
                  <div className="text-xs text-[#9CA3AF] mt-1 text-right">{formatSec(seg.startSec)}</div>
                </div>
              </motion.div>
            ))
          : segments.map((seg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${liveColorMap[seg.speaker_label]}`}
                >
                  {liveIndexMap[seg.speaker_label]}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[#6B7280] mb-1">화자 {liveIndexMap[seg.speaker_label]}</div>
                  <div className="bg-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm text-[#1A1D2E]">{seg.text}</div>
                  <div className="text-xs text-[#9CA3AF] mt-1 text-right">{formatSec(seg.start_sec)}</div>
                </div>
              </motion.div>
            ))}
      </AnimatePresence>

      {isRecording && (
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
  );

  if (headless) return content;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <h2 className="font-semibold text-[#1A1D2E]">대화 내용</h2>
      </div>
      {content}
    </div>
  );
}
