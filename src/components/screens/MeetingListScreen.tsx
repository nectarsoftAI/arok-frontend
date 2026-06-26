import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { meetingsApi, type MeetingListItem } from "../../api/meetings";
import { DeleteMeetingDialog } from "../common/dialogs/DeleteMeetingDialog";
import { MeetingCard, MeetingCardSkeleton } from "../meetingList/MeetingCard";
import { MeetingPagination } from "../meetingList/MeetingPagination";
import { MeetingListFilters } from "../meetingList/MeetingListFilters";

const PAGE_SIZE = 6;

export function MeetingListScreen() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MeetingListItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    meetingsApi
      .getAll(currentPage - 1, PAGE_SIZE)
      .then(({ data }) => {
        setMeetings(data.meetings);
        setTotalPages(data.totalPages);
      })
      .catch(() => setFetchError("회의 목록을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [currentPage, refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await meetingsApi.delete(deleteTarget.meetingId);
      // 현재 페이지 마지막 아이템 삭제 시 이전 페이지로 이동
      if (meetings.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        setRefreshKey((k) => k + 1);
      }
    } catch {
      // 삭제 실패 시 유지
    }
    setDeleteTarget(null);
  };

  const pagedMeetings = meetings;

  return (
    <div className="h-full p-6 pb-12">
      <DeleteMeetingDialog
        isOpen={!!deleteTarget}
        meetingTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[22px] font-semibold text-[#1A1D2E]">회의록 목록</h1>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="px-4 py-2 bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
            >
              <Plus className="w-5 h-5" />
              새로운 회의 시작하기
            </button>
          </div>
          <MeetingListFilters />
        </div>

        {/* States */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <MeetingCardSkeleton key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">
            {fetchError}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B7280] text-sm">
            저장된 회의록이 없습니다.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-5">
              {pagedMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.meetingId}
                  meeting={meeting}
                  onDelete={setDeleteTarget}
                  onOpen={(id) => navigate(`/meetings/${id}`)}
                />
              ))}
            </div>
            <MeetingPagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
