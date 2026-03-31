import { getAccessToken, setAccessToken } from './api';

export function clearTokens() {
  setAccessToken(null);
  // Refresh token is in httpOnly cookie, cleared server-side on logout
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function getTokenPayload(token: string): {
  userId: string;
  email: string;
  username: string;
  isVerified: boolean;
} | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      isVerified: payload.isVerified,
    };
  } catch {
    return null;
  }
}

export { getAccessToken, setAccessToken };
