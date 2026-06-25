interface MeetingEndButtonProps {
  meetingId: string | null;
  onClick: () => void;
}

export function MeetingEndButton({ meetingId, onClick }: MeetingEndButtonProps) {
  return (
    <div className="flex justify-center py-4">
      <button
        onClick={onClick}
        disabled={!meetingId}
        className="px-8 py-3 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] hover:from-[#5B5FF5]/90 hover:to-[#818CF8]/90 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        회의 종료
      </button>
    </div>
  );
}
