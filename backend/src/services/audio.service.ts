let currentToken = "";
let expiresAt = 0;

export function generateAudioToken() {
  currentToken = Math.random().toString(36).substring(2, 8).toUpperCase();

  expiresAt = Date.now() + 10000; // 10 seconds

  return {
    token: currentToken,
    expiresAt,
  };
}

export function verifyAudioToken(token: string) {
  if (Date.now() > expiresAt) {
    return false;
  }

  return token === currentToken;
}

export function getCurrentAudioToken() {
  return currentToken;
}