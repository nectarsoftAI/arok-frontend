import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import emptyStateIcon from "../../assets/icons/icon_empty_state.webp";
import { useNavigate } from "react-router";
import { Button } from "../common/Button";
import { meetingsApi, type MeetingListItem } from "../../api/meetings";
import { DeleteMeetingDialog } from "../common/dialogs/DeleteMeetingDialog";
import { MeetingCard, MeetingCardSkeleton } from "../meetingList/MeetingCard";
import { MeetingPagination } from "../meetingList/MeetingPagination";
import { MeetingListFilters } from "../meetingList/MeetingListFilters";
import {
  emptyFilters,
  hasActiveFilters,
  type MeetingFilterState,
} from "../meetingList/meetingFilters";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const PAGE_SIZE = 9;

export function MeetingListScreen() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MeetingListItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<MeetingFilterState>(emptyFilters);

  // 키워드만 디바운스 — 유형/날짜는 즉시 반영
  const debouncedKeyword = useDebouncedValue(filters.keyword, 250);
  const { meetingType, dateFrom, dateTo } = filters;
  const isSearching = hasActiveFilters({ ...filters, keyword: debouncedKeyword });

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setShowSkeleton(false);
    setFetchError(null);

    const skeletonTimer = setTimeout(() => setShowSkeleton(true), 200);

    const request = isSearching
      ? meetingsApi.search(
          { keyword: debouncedKeyword, meetingType, dateFrom, dateTo },
          currentPage - 1,
          PAGE_SIZE
        )
      : meetingsApi.getAll(currentPage - 1, PAGE_SIZE);

    request
      .then(({ data }) => {
        if (cancelled) return;
        setMeetings(data.meetings);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[MeetingList] 목록 조회 실패 — page:", currentPage, err);
        setFetchError(
          isSearching
            ? "검색에 실패했습니다."
            : "회의 목록을 불러오지 못했습니다."
        );
      })
      .finally(() => {
        clearTimeout(skeletonTimer);
        if (cancelled) return;
        setIsLoading(false);
        setShowSkeleton(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(skeletonTimer);
    };
  }, [
    isSearching,
    debouncedKeyword,
    meetingType,
    dateFrom,
    dateTo,
    currentPage,
    refreshKey,
  ]);

  // 필터가 바뀌면 항상 1페이지부터
  const handleFiltersChange = (next: MeetingFilterState) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await meetingsApi.delete(deleteTarget.meetingId);
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
            <Button variant="primary" onClick={() => navigate("/", { replace: true })} className="flex items-center gap-2 shadow-sm hover:shadow">
              <Plus className="w-5 h-5" />
              새로운 회의 시작하기
            </Button>
          </div>
          <MeetingListFilters value={filters} onChange={handleFiltersChange} />
        </div>

        {/* States */}
        {isLoading ? (
          showSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <MeetingCardSkeleton key={i} />
              ))}
            </div>
          ) : null
        ) : fetchError ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">
            {fetchError}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <img src={emptyStateIcon} alt="" className="w-40 h-40 object-contain mb-5" />
            <p className="text-[#1A1D2E] font-medium">
              {isSearching ? "검색 결과가 없습니다" : "저장된 회의록이 없습니다."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {meetings.map((meeting) => (
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
