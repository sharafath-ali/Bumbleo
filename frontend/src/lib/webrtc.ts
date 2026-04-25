// WebRTC configuration
// For local dev we use Google's free STUN servers (works same-network).
// Add a TURN server for production when users are behind symmetric NAT.
// const STUN_SERVERS = [
//   { urls: "stun:stun.l.google.com:19302" },
//   { urls: "stun:stun1.l.google.com:19302" },
// ];

// const TURN_URL = process.env.NEXT_PUBLIC_TURN_URL || "turn:localhost:3478";
// const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME || "bumbleo";
// const TURN_CREDENTIAL =
//   process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "bumbleopass";

// export const ICE_SERVERS: RTCIceServer[] = [
//   ...STUN_SERVERS,
//   {
//     urls: TURN_URL,
//     username: TURN_USERNAME,
//     credential: TURN_CREDENTIAL,
//   },
// ];

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    // Free public TURN for testing (replace with your own in production)
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

export const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
  audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
};
