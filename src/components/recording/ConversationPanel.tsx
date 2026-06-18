import { useRef, useEffect, type ReactNode } from 'react';
import { Download } from 'lucide-react';
import type { MeetingMode } from '../MeetingTitleDialog';
import type { TranscriptSegment } from '../../api/stt';
import type { SegmentMessage } from '../../services/live/types';
import recodingLiveImg from '../../assets/icons/recoding_live_icon.png';

interface ConversationPanelProps {
  meetingMode: MeetingMode;
  hasConversation: boolean;
  canSummarize: boolean;
  transcripts: TranscriptSegment[];
  segments: SegmentMessage[];
  speakerColorMap: Record<string, string>;
  speakerIndexMap: Record<string, string>;
  liveColorMap: Record<string, string>;
  liveIndexMap: Record<string, string>;
  formatSec: (sec: number) => string;
  controls: ReactNode;
}

export function ConversationPanel({
  meetingMode,
  hasConversation,
  canSummarize,
  transcripts,
  segments,
  speakerColorMap,
  speakerIndexMap,
  liveColorMap,
  liveIndexMap,
  formatSec,
  controls,
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, segments]);

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-[#1A1D2E]">대화 내용</h2>
        <button
          disabled={!canSummarize}
          className={`px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg transition-colors flex items-center gap-2 ${
            canSummarize ? 'text-[#6B7280] hover:bg-[#F3F4F6] cursor-pointer' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          대화 내보내기
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
        {!hasConversation ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <img src={recodingLiveImg} alt="녹음" className="w-20 h-20 object-contain mb-6 opacity-60" />
            <h3 className="font-semibold text-[#1A1D2E] mb-2">대화를 시작해보세요</h3>
            <p className="text-sm text-[#6B7280]">
              {meetingMode === 'live'
                ? '녹음 버튼을 눌러 회의를 시작하세요.'
                : '오디오 파일을 업로드하면 자동으로 분석됩니다.'}
            </p>
          </div>
        ) : meetingMode === 'upload' ? (
          transcripts.map((seg, idx) => (
            <div key={idx} className="flex gap-3">
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
            </div>
          ))
        ) : (
          segments.map((seg, idx) => (
            <div key={idx} className="flex gap-3">
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
            </div>
          ))
        )}
      </div>

      <div
        className="border-t border-[#E5E7EB] flex flex-col items-center justify-center flex-shrink-0"
        style={{ height: '280px' }}
      >
        {controls}
      </div>
    </div>
  );
}
