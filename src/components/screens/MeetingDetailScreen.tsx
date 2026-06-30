import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Download, Loader2 } from "lucide-react";
import { Button } from "../common/Button";
import { SpeakerAvatar, SPEAKER_PALETTE } from "../common/SpeakerAvatar";
import { Badge } from "../common/Badge";
import { ConversationBubble } from "../common/ConversationBubble";
import { meetingsApi, type MeetingDetail } from "../../api/meetings";
import { parseSummaryDto, exportSummaryDocx, type SummaryResponse } from "../../api/summary";
import type { TranscriptSegment, TranscriptUpdate } from "../../api/types";
import { Skeleton } from "../common/Skeleton";
import { SummaryDisplay } from "../common/SummaryDisplay";


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

function formatMeetingDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MeetingDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [summaryError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [editedTranscripts, setEditedTranscripts] = useState<TranscriptSegment[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript');

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

        <div className="hidden lg:grid grid-cols-[1fr_0.67fr] gap-6" style={{ height: "calc(100% - 3rem)" }}>
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
          <Button onClick={() => navigate("/meetings")}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  /* ── 정상 렌더 ───────────────────────────────────────── */
  const uniqueSpeakers = [...new Set(meeting.transcripts.map((t) => t.speakerLabel))];
  const speakerColorMap = Object.fromEntries(
    uniqueSpeakers.map((lbl, i) => [lbl, SPEAKER_PALETTE[i % SPEAKER_PALETTE.length]])
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
          <span className="text-sm text-[#6B7280]">{formatMeetingDate(meeting.meetingDate)}</span>
          <span className="text-sm text-[#9CA3AF]">•</span>
          <span className="text-sm text-[#6B7280]">{formatDuration(meeting.durationSeconds)}</span>
        </div>
      </div>

      {/* 모바일 탭 */}
      <div className="lg:hidden flex-shrink-0 flex border-b border-[#E5E7EB] bg-white">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'transcript' ? 'border-[#5B5FF5] text-[#5B5FF5]' : 'border-transparent text-[#6B7280]'
          }`}
        >
          대화 내용
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'summary' ? 'border-[#5B5FF5] text-[#5B5FF5]' : 'border-transparent text-[#6B7280]'
          }`}
        >
          대화 요약
        </button>
      </div>

      {/* 데스크톱: 좌우 분할 */}
      <div className="hidden lg:grid grid-cols-[1fr_0.67fr] grid-rows-1 gap-6 flex-1 min-h-0">
        {/* 왼쪽: 대화 내용 */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col min-h-0 border-2 border-[#5B5FF5]/20 bg-[#5B5FF5]/[0.02]">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1D2E]">대화 내용</h2>
            <div className="flex items-center gap-2">
              {isDirty && (
                <>
                  <Button size="sm" variant="secondary" onClick={handleCancel} disabled={isSaving}>
                    취소
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5">
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    저장
                  </Button>
                </>
              )}
              <Button size="sm" variant="secondary" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                대화 내보내기
              </Button>
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
                  <SpeakerAvatar letter={speakerLetterMap[seg.speakerLabel]} color={speakerColorMap[seg.speakerLabel]} />
                  <div className="flex-1">
                    <input
                      value={seg.speakerDisplay}
                      onChange={(e) => handleTranscriptChange(idx, 'speakerDisplay', e.target.value)}
                      className="text-xs text-[#6B7280] mb-1 bg-transparent border-none outline-none w-full hover:bg-[#F3F4F6] focus:bg-[#F3F4F6] rounded px-1 -mx-1 cursor-text"
                    />
                    <ConversationBubble
                      editable
                      value={seg.content}
                      onChange={(e) => handleTranscriptChange(idx, 'content', e.target.value)}
                      rows={Math.max(1, Math.ceil(seg.content.length / 50))}
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
                  <Badge key={idx}>{display}</Badge>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={isExporting}
              onClick={async () => {
                setIsExporting(true);
                try {
                  await exportSummaryDocx(meeting.meetingId);
                } catch (err) {
                  console.error('요약 내보내기 실패', err);
                  alert('요약 내보내기에 실패했습니다. 다시 시도해주세요.');
                } finally {
                  setIsExporting(false);
                }
              }}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? '내보내는 중...' : '요약 내보내기'}
            </Button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
            {summaryError ? (
              <div className="h-full flex items-center justify-center text-sm text-red-500 text-center px-4">
                {summaryError}
              </div>
            ) : summaryData ? (
              <SummaryDisplay summaryData={summaryData} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
                요약 정보가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일: 탭별 패널 */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col">
        {activeTab === 'transcript' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDirty && (
                  <>
                    <Button size="sm" variant="secondary" onClick={handleCancel} disabled={isSaving}>취소</Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5">
                      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      저장
                    </Button>
                  </>
                )}
              </div>
              <Button size="sm" variant="secondary" className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                내보내기
              </Button>
            </div>
            {saveError && <div className="px-4 pt-2 text-xs text-red-500">{saveError}</div>}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {editedTranscripts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">대화 내용이 없습니다.</div>
              ) : (
                editedTranscripts.map((seg, idx) => (
                  <div key={idx} className="flex gap-3">
                    <SpeakerAvatar letter={speakerLetterMap[seg.speakerLabel]} color={speakerColorMap[seg.speakerLabel]} />
                    <div className="flex-1">
                      <input
                        value={seg.speakerDisplay}
                        onChange={(e) => handleTranscriptChange(idx, 'speakerDisplay', e.target.value)}
                        className="text-xs text-[#6B7280] mb-1 bg-transparent border-none outline-none w-full hover:bg-[#F3F4F6] focus:bg-[#F3F4F6] rounded px-1 -mx-1 cursor-text"
                      />
                      <ConversationBubble
                        editable
                        value={seg.content}
                        onChange={(e) => handleTranscriptChange(idx, 'content', e.target.value)}
                        rows={Math.max(1, Math.ceil(seg.content.length / 40))}
                      />
                      <div className="text-xs text-[#9CA3AF] mt-1 text-right">{formatSec(seg.startSec)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {uniqueSpeakerDisplays.map((display, idx) => (
                  <Badge key={idx}>{display}</Badge>
                ))}
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={isExporting}
                onClick={async () => {
                  setIsExporting(true);
                  try { await exportSummaryDocx(meeting.meetingId); }
                  catch { alert('요약 내보내기에 실패했습니다.'); }
                  finally { setIsExporting(false); }
                }}
                className="flex items-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                {isExporting ? '...' : '내보내기'}
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
              {summaryError ? (
                <div className="h-full flex items-center justify-center text-sm text-red-500 text-center px-4">{summaryError}</div>
              ) : summaryData ? (
                <SummaryDisplay summaryData={summaryData} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">요약 정보가 없습니다.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
