// Server → Client

// 백엔드가 WS 연결 후 전송하는 세션 준비 메시지 (ec7fec5: session_created → session_ready)
export interface SessionReadyMessage {
  type: "session_ready";
  meeting_id: string;
}

export interface SegmentMessage {
  type: "segment";
  speaker_label: string;
  start_sec: number;
  end_sec: number;
  text: string;
  confidence: number;
  is_final: boolean;
}

export interface SessionEndedMessage {
  type: "session_ended";
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage =
  | SessionReadyMessage
  | SegmentMessage
  | SessionEndedMessage
  | ErrorMessage;

// Client → Server

export interface EndMessage {
  type: "end";
}
