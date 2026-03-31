import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '@/types';

const initialState: UserState = {
  sessionId: null,
  isMuted: false,
  isVideoOff: false,
  isConnected: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSessionId(state, action: PayloadAction<string>) {
      state.sessionId = action.payload;
      state.isConnected = true;
    },
    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },
    toggleVideo(state) {
      state.isVideoOff = !state.isVideoOff;
    },
    setMuted(state, action: PayloadAction<boolean>) {
      state.isMuted = action.payload;
    },
    setVideoOff(state, action: PayloadAction<boolean>) {
      state.isVideoOff = action.payload;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
  },
});

export const {
  setSessionId,
  toggleMute,
  toggleVideo,
  setMuted,
  setVideoOff,
  setConnected,
} = userSlice.actions;

export default userSlice.reducer;
