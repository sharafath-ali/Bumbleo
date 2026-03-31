import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, ChatMessage, ConnectionStatus } from '@/types';
import { nanoid } from '@reduxjs/toolkit';

const initialState: ChatState = {
  status: 'idle',
  roomId: null,
  role: null,
  messages: [],
  skipCount: 0,
  sessionStartedAt: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.status = action.payload;
    },
    setMatched(
      state,
      action: PayloadAction<{ roomId: string; role: 'caller' | 'callee' }>
    ) {
      state.status = 'matched';
      state.roomId = action.payload.roomId;
      state.role = action.payload.role;
      state.messages = [];
      state.sessionStartedAt = Date.now();
    },
    setConnected(state) {
      state.status = 'connected';
    },
    addMessage(
      state,
      action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>
    ) {
      state.messages.push({
        ...action.payload,
        id: nanoid(),
        timestamp: Date.now(),
      });
    },
    peerLeft(state) {
      state.status = 'disconnected';
      state.roomId = null;
      state.role = null;
    },
    skip(state) {
      state.skipCount += 1;
      state.status = 'searching';
      state.roomId = null;
      state.role = null;
      state.messages = [];
      state.sessionStartedAt = null;
    },
    resetChat(state) {
      state.status = 'idle';
      state.roomId = null;
      state.role = null;
      state.messages = [];
      state.sessionStartedAt = null;
    },
  },
});

export const {
  setStatus,
  setMatched,
  setConnected,
  addMessage,
  peerLeft,
  skip,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
