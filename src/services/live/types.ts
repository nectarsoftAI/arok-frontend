// Server → Client

export interface SessionCreatedMessage {
  type: "session_created";
  meeting_id: string;
}

export interface SegmentMessage {
  type: "segment";
  speaker_label: string;
  start_sec: number;
  end_sec: number;
  text: string;
  confidence: number;
}

export interface SessionEndedMessage {
  type: "session_ended";
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage =
  | SessionCreatedMessage
  | SegmentMessage
  | SessionEndedMessage
  | ErrorMessage;

// Client → Server

export interface EndMessage {
  type: "end";
}
