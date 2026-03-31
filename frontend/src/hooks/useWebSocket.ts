'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSessionId, setConnected } from '@/store/userSlice';
import { setMatched, addMessage, peerLeft, setStatus } from '@/store/chatSlice';
import { WSMessage } from '@/types';
import { getAccessToken } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

type MessageHandler = (msg: WSMessage) => void;

export function useWebSocket(onMessage?: MessageHandler) {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const isConnected = useAppSelector((s) => s.user.isConnected);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  // Declare scheduleReconnect ref first so connect can reference it
  const scheduleReconnectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempts.current = 0;
      dispatch(setConnected(true));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'connected': {
            const p = msg.payload as { sessionId: string };
            dispatch(setSessionId(p.sessionId));
            break;
          }
          case 'matched': {
            const p = msg.payload as { roomId: string; role: 'caller' | 'callee' };
            dispatch(setMatched(p));
            break;
          }
          case 'chat_message': {
            const p = msg.payload as { text: string; from: string };
            dispatch(addMessage({ text: p.text, from: 'stranger', username: p.from }));
            break;
          }
          case 'peer_left': {
            dispatch(peerLeft());
            break;
          }
        }

        onMessageRef.current?.(msg);
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      dispatch(setConnected(false));
      dispatch(setStatus('idle'));
      scheduleReconnectRef.current();
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [dispatch]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= 5) return;
    const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
    reconnectAttempts.current++;
    reconnectTimer.current = setTimeout(connect, delay);
  }, [connect]);

  // Keep the ref up to date
  scheduleReconnectRef.current = scheduleReconnect;

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
    wsRef.current = null;
    reconnectAttempts.current = 5;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { send, disconnect, isConnected };
}
