'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setConnected } from '@/store/chatSlice';
import { RTC_CONFIG, MEDIA_CONSTRAINTS } from '@/lib/webrtc';
import { WSMessage } from '@/types';

interface UseWebRTCProps {
  send: (msg: object) => void;
  role: 'caller' | 'callee' | null;
}

export function useWebRTC(
  localVideoRef: React.RefObject<HTMLVideoElement | null>,
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>,
  { send, role }: UseWebRTCProps
) {
  const dispatch = useAppDispatch();
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isMuted = useAppSelector((s) => s.user.isMuted);
  const isVideoOff = useAppSelector((s) => s.user.isVideoOff);

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, [localVideoRef]);

  const createPeer = useCallback(async () => {
    // Cleanup previous connection
    peerRef.current?.close();

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerRef.current = pc;

    const stream = await getLocalStream();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send({ type: 'ice_candidate', payload: { candidate: event.candidate } });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        dispatch(setConnected());
      }
    };

    return pc;
  }, [getLocalStream, remoteVideoRef, send, dispatch]);

  // Called when matched and we're the caller
  const startCall = useCallback(async () => {
    const pc = await createPeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    send({ type: 'offer', payload: { sdp: pc.localDescription } });
  }, [createPeer, send]);

  // Called when matched and we're the callee (wait for offer)
  const prepareAnswer = useCallback(async () => {
    await createPeer();
  }, [createPeer]);

  // Handle incoming WebRTC signaling messages
  const handleSignal = useCallback(
    async (msg: WSMessage) => {
      const pc = peerRef.current;
      if (!pc) return;

      switch (msg.type) {
        case 'offer': {
          const payload = msg.payload as { sdp: RTCSessionDescriptionInit };
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send({ type: 'answer', payload: { sdp: pc.localDescription } });
          break;
        }
        case 'answer': {
          const payload = msg.payload as { sdp: RTCSessionDescriptionInit };
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          break;
        }
        case 'ice_candidate': {
          const payload = msg.payload as { candidate: RTCIceCandidateInit };
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          break;
        }
      }
    },
    [send]
  );

  const hangup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, [remoteVideoRef]);

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  }, [localVideoRef]);

  // Sync mute state
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !isMuted;
    });
  }, [isMuted]);

  // Sync video state
  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !isVideoOff;
    });
  }, [isVideoOff]);

  // Auto-start call when matched
  useEffect(() => {
    if (role === 'caller') startCall();
    else if (role === 'callee') prepareAnswer();
  }, [role, startCall, prepareAnswer]);

  return { handleSignal, hangup, stopLocalStream, getLocalStream };
}
