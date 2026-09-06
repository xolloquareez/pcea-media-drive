import crypto from "crypto";

export const ADMIN_COOKIE = "pcea_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to your .env file (see .env.example)."
    );
  }
  return secret;
}

/** Creates a signed, tamper-proof session token. No server-side session store needed. */
export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

/** Verifies a session token's signature and expiry. */
export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

/** Constant-time password comparison to avoid timing attacks on login. */
export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to your .env file (see .env.example)."
    );
  }
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}
