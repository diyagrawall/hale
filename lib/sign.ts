import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only. Signs a case link so an edited link stops working.
// The secret lives in .env.local (CASE_SECRET) and never reaches the browser.

function secret(): string {
  const s = process.env.CASE_SECRET;
  if (!s) throw new Error("CASE_SECRET is not set");
  return s;
}

const mac = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** payload + "." + signature */
export function sign(payload: string): string {
  return `${payload}.${mac(payload)}`;
}

/** Returns the payload only if the signature matches, otherwise null. */
export function verify(token: string): string | null {
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const payload = token.slice(0, i);
  const given = Buffer.from(token.slice(i + 1));
  const expected = Buffer.from(mac(payload));
  return given.length === expected.length && timingSafeEqual(given, expected) ? payload : null;
}
