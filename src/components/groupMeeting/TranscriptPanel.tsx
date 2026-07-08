import { motion } from "motion/react";
import { GroupTranscriptSection, type GroupSegment } from "../recording/GroupTranscriptSection";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface TranscriptPanelProps {
  elapsedSeconds: number;
  segments: GroupSegment[];
  isActive: boolean;
  colorMap: Record<string, string>;
}

export function TranscriptPanel({ elapsedSeconds, segments, isActive, colorMap }: TranscriptPanelProps) {
  return (
    <div className="flex-1 flex flex-col gap-4 p-6 overflow-hidden min-h-0">
      <div className="inline-flex items-center gap-2 bg-[#F3F4F6] rounded-full px-4 py-1.5 flex-shrink-0 w-fit">
        <motion.div
          className="w-1.5 h-1.5 bg-[#EF4444] rounded-full flex-shrink-0"
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-sm font-bold text-[#1A1D2E] font-mono tabular-nums">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
        <GroupTranscriptSection segments={segments} isActive={isActive} colorMap={colorMap} />
      </div>
    </div>
  );
}
