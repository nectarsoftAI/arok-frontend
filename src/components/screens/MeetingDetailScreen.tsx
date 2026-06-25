import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Download, CheckCircle2, Square, Loader2 } from "lucide-react";
import { meetingsApi, type MeetingDetail } from "../../api/meetings";
import { parseSummaryDto, type SummaryResponse } from "../../api/summary";
import type { TranscriptSegment, TranscriptUpdate } from "../../api/types";
import { Skeleton } from "../ui/skeleton";

const SPEAKER_COLORS = [
  "bg-[#5B5FF5]",
  "bg-[#22D3EE]",
  "bg-[#F59E0B]",
  "bg-[#EC4899]",
];

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec) % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  return `${m}분`;
}

export function MeetingDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [summaryError] = useState<string | null>(null);

  const [editedTranscripts, setEditedTranscripts] = useState<TranscriptSegment[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    meetingsApi
      .getById(id)
      .then(({ data }) => {
        setMeeting(data);
        setEditedTranscripts(data.transcripts);
      })
      .catch((err) => {
        console.error("회의 상세 조회 실패", err);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!meeting) return;
    const parsed = parseSummaryDto(meeting.summary);
    setSummaryData(parsed);
  }, [meeting]);

  const handleTranscriptChange = (idx: number, field: 'content' | 'speakerDisplay', value: string) => {
    setEditedTranscripts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    setIsDirty(true);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!meeting) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updates: TranscriptUpdate[] = editedTranscripts
        .filter((t, i) => {
          const orig = meeting.transcripts[i];
          return t.content !== orig.content || t.speakerDisplay !== orig.speakerDisplay;
        })
        .filter((t) => t.transcriptId != null)
        .map((t) => ({
          transcriptId: t.transcriptId!,
          content: t.content,
          speakerDisplay: t.speakerDisplay,
        }));

      await meetingsApi.updateTranscripts(meeting.meetingId, updates);
      setMeeting((prev) => prev ? { ...prev, transcripts: editedTranscripts } : null);
      setIsDirty(false);
    } catch {
      setSaveError('저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!meeting) return;
    setEditedTranscripts(meeting.transcripts);
    setIsDirty(false);
    setSaveError(null);
  };

  /* ── Loading ─────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="h-full p-6">
        {/* 제목 영역 */}
        <div className="mb-4">
          <Skeleton className="h-7 w-72 bg-gray-200 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24 bg-gray-200" />
            <Skeleton className="h-4 w-1 bg-gray-200" />
            <Skeleton className="h-4 w-12 bg-gray-200" />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_0.67fr] gap-6" style={{ height: "calc(100% - 3rem)" }}>
          {/* 왼쪽: 대화 내용 */}
          <div className="bg-white rounded-lg shadow-sm flex flex-col border-2 border-[#E5E7EB]">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <Skeleton className="h-5 w-20 bg-gray-200" />
              <Skeleton className="h-8 w-28 bg-gray-200" />
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16 bg-gray-200" />
                    <Skeleton className={`h-10 bg-gray-200 rounded-xl ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
                    <Skeleton className="h-3 w-10 bg-gray-200 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 요약 */}
          <div className="bg-white rounded-lg shadow-sm flex flex-col border-2 border-[#E5E7EB]">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 bg-gray-200" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-14 bg-gray-200" />
                  <Skeleton className="h-5 w-14 bg-gray-200" />
                </div>
              </div>
              <Skeleton className="h-8 w-28 bg-gray-200" />
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20 bg-gray-200" />
                <Skeleton className="h-3 w-full bg-gray-200" />
                <Skeleton className="h-3 w-5/6 bg-gray-200" />
                <Skeleton className="h-3 w-full bg-gray-200" />
                <Skeleton className="h-3 w-4/5 bg-gray-200" />
              </div>
              <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                <Skeleton className="h-4 w-20 bg-gray-200" />
                <Skeleton className="h-3 w-full bg-gray-200" />
                <Skeleton className="h-3 w-3/4 bg-gray-200" />
                <Skeleton className="h-3 w-5/6 bg-gray-200" />
              </div>
              <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                <Skeleton className="h-4 w-20 bg-gray-200" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 bg-gray-200" />
                      <Skeleton className="h-5 w-10 bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── 데이터 없음 / 오류 ───────────────────────────────── */
  if (hasError || !meeting) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-semibold text-[#1A1D2E] mb-2">회의 정보를 찾을 수 없습니다</h3>
          <p className="text-sm text-[#6B7280] mb-4">
            요청한 회의가 존재하지 않거나 삭제되었습니다.
          </p>
          <button
            onClick={() => navigate("/meetings")}
            className="px-4 py-2 bg-[#5B5FF5] text-white rounded-lg text-sm"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  /* ── 정상 렌더 ───────────────────────────────────────── */
  const uniqueSpeakers = [...new Set(meeting.transcripts.map((t) => t.speakerLabel))];
  const speakerColorMap = Object.fromEntries(
    uniqueSpeakers.map((lbl, i) => [lbl, SPEAKER_COLORS[i % SPEAKER_COLORS.length]])
  );
  const speakerLetterMap = Object.fromEntries(
    uniqueSpeakers.map((lbl, i) => [lbl, String.fromCharCode(65 + i)])
  );
  const uniqueSpeakerDisplays = [...new Set(meeting.transcripts.map((t) => t.speakerDisplay))];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-semibold text-[#1A1D2E]">{meeting.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-[#6B7280]">{meeting.meetingDate}</span>
          <span className="text-sm text-[#9CA3AF]">•</span>
          <span className="text-sm text-[#6B7280]">{formatDuration(meeting.durationSeconds)}</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_0.67fr] grid-rows-1 gap-6 flex-1 min-h-0">
        {/* 왼쪽: 대화 내용 */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col min-h-0 border-2 border-[#5B5FF5]/20 bg-[#5B5FF5]/[0.02]">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1D2E]">대화 내용</h2>
            <div className="flex items-center gap-2">
              {isDirty && (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1.5 text-sm text-white bg-[#5B5FF5] rounded-lg hover:bg-[#5B5FF5]/90 transition-colors flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    저장
                  </button>
                </>
              )}
              <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                대화 내보내기
              </button>
            </div>
          </div>

          {saveError && (
            <div className="px-5 pt-3 text-xs text-red-500">{saveError}</div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
            {editedTranscripts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
                대화 내용이 없습니다.
              </div>
            ) : (
              editedTranscripts.map((seg, idx) => (
                <div key={idx} className="flex gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${speakerColorMap[seg.speakerLabel]}`}
                  >
                    {speakerLetterMap[seg.speakerLabel]}
                  </div>
                  <div className="flex-1">
                    <input
                      value={seg.speakerDisplay}
                      onChange={(e) => handleTranscriptChange(idx, 'speakerDisplay', e.target.value)}
                      className="text-xs text-[#6B7280] mb-1 bg-transparent border-none outline-none w-full hover:bg-[#F3F4F6] focus:bg-[#F3F4F6] rounded px-1 -mx-1 cursor-text"
                    />
                    <textarea
                      value={seg.content}
                      onChange={(e) => handleTranscriptChange(idx, 'content', e.target.value)}
                      rows={Math.max(1, Math.ceil(seg.content.length / 50))}
                      className="w-full bg-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm text-[#1A1D2E] resize-none border-2 border-transparent focus:border-[#5B5FF5]/30 outline-none transition-colors"
                    />
                    <div className="text-xs text-[#9CA3AF] mt-1 text-right">
                      {formatSec(seg.startSec)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 오른쪽: 요약 */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col min-h-0 border-2 border-[#5B5FF5]/20 bg-[#5B5FF5]/[0.02]">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-semibold text-[#1A1D2E]">대화 요약</h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {uniqueSpeakerDisplays.map((display, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-xs rounded"
                  >
                    {display}
                  </span>
                ))}
              </div>
            </div>
            <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              요약 내보내기
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
            {summaryError ? (
              <div className="h-full flex items-center justify-center text-sm text-red-500 text-center px-4">
                {summaryError}
              </div>
            ) : summaryData ? (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#1A1D2E] text-sm">주요 내용</h3>
                  <ul className="space-y-2">
                    {summaryData.summary.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FF5] mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#1A1D2E] text-sm">결정 사항</h3>
                  <ul className="space-y-2">
                    {summaryData.decisions.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-[#1A1D2E]">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#1A1D2E] text-sm">후속 조치</h3>
                  <ul className="space-y-3">
                    {summaryData.action_items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Square className="w-4 h-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-[#1A1D2E]">{item.task}</div>
                          <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded">
                              {item.assignee}
                            </span>
                            <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs rounded">
                              {item.due_date}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {summaryData.keywords.length > 0 && (
                  <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                    <h3 className="font-semibold text-[#1A1D2E] text-sm">키워드</h3>
                    <div className="flex flex-wrap gap-2">
                      {summaryData.keywords.map((kw, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[#EEF2FF] text-[#5B5FF5] text-xs rounded-md">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
                요약 정보가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
