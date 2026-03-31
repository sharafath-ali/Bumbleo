export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  from: 'me' | 'stranger';
  username?: string;
  timestamp: number;
}

export type ConnectionStatus =
  | 'idle'
  | 'searching'
  | 'matched'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface ChatState {
  status: ConnectionStatus;
  roomId: string | null;
  role: 'caller' | 'callee' | null;
  messages: ChatMessage[];
  skipCount: number;
  sessionStartedAt: number | null;
}

export interface UserState {
  sessionId: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isConnected: boolean;
}

// WebSocket message types
export type WSMessageType =
  | 'connected'
  | 'matched'
  | 'offer'
  | 'answer'
  | 'ice_candidate'
  | 'chat_message'
  | 'peer_left'
  | 'error';

export interface WSMessage {
  type: WSMessageType;
  payload?: unknown;
}
