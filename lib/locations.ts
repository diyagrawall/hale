import landmarks from "../data/landmarks.json";
import type { Landmark } from "./types";

export const LANDMARKS: Landmark[] = landmarks;

const normalize = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;

/** Finds a known landmark named in the text. Returns null rather than guessing. */
export function matchLandmark(text: string): Landmark | null {
  const t = normalize(text);
  let best: { lm: Landmark; len: number } | null = null;
  for (const lm of LANDMARKS) {
    for (const alias of lm.aliases) {
      const a = normalize(alias);
      if (t.includes(a) && (!best || a.length > best.len)) best = { lm, len: a.length };
    }
  }
  return best?.lm ?? null;
}
