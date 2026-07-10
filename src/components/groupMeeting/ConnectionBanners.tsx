import { RECONNECT_STALLED_THRESHOLD } from '../../services/online/OnlineMeetingService';

interface ConnectionBannersProps {
  isNetworkOffline: boolean;
  isReconnecting: boolean;
  reconnectAttempt: number;
  isReconnectStalled: boolean;
  isCongested: boolean;
  errorMessage: string | null;
  onReconnectNow: () => void;
}

export function ConnectionBanners({
  isNetworkOffline,
  isReconnecting,
  reconnectAttempt,
  isReconnectStalled,
  isCongested,
  errorMessage,
  onReconnectNow,
}: ConnectionBannersProps) {
  return (
    <>
      {/* ── 네트워크 끊김 배너 — WS onclose보다 먼저 뜨는 즉각 신호 ── */}
      {isNetworkOffline && !isReconnecting && (
        <div className="flex-shrink-0 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          네트워크 연결이 불안정합니다
        </div>
      )}

      {/* ── 재연결 중 배너 — n/5는 표시용일 뿐 실제 재시도 횟수엔 상한이 없음(포기 안 함).
          5회를 넘기면(stalled) 더 눈에 띄는 문구 + 수동 재연결 버튼으로 전환 ── */}
      {isReconnecting && !isReconnectStalled && (
        <div className="flex-shrink-0 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          재연결 중 {reconnectAttempt}/{RECONNECT_STALLED_THRESHOLD}
        </div>
      )}

      {isReconnecting && isReconnectStalled && (
        <div className="flex-shrink-0 px-6 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            네트워크 연결이 오래 끊겨 있습니다. 계속 재연결을 시도하고 있어요.
          </span>
          <button
            type="button"
            onClick={onReconnectNow}
            className="flex-shrink-0 px-2 py-0.5 rounded border border-red-300 text-red-700 hover:bg-red-100"
          >
            지금 재연결
          </button>
        </div>
      )}

      {/* ── 전송 지연 배너 — 오디오는 계속 보내지만 네트워크가 못 따라가는 상태 ── */}
      {isCongested && (
        <div className="flex-shrink-0 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          네트워크가 느려 전송이 지연되고 있습니다
        </div>
      )}

      {/* ── 에러 배너 — STT/음성통화 공용 ── */}
      {errorMessage && (
        <div className="flex-shrink-0 px-6 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600">
          {errorMessage}
        </div>
      )}
    </>
  );
}
