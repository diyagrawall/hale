import { useSyncExternalStore } from "react";
import type { AiCase } from "./types";

// The case being worked on, passed between screens for the current visit only.
export type ActiveCase = { text: string; ai: AiCase | null; aiProblem: string | null; thumb?: string; at: number; mode: "sos" | "check" };
const KEY = "hale.case";

export function saveCase(c: ActiveCase) { try { sessionStorage.setItem(KEY, JSON.stringify(c)); } catch {} }
export function loadCase(): ActiveCase | null {
  try { const r = sessionStorage.getItem(KEY); return r ? (JSON.parse(r) as ActiveCase) : null; } catch { return null; }
}
/** A stable demo case number from the text, like PN-2418. */
export function caseNumber(text: string): string {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 9000;
  return `PN-${1000 + h}`;
}

let rawCache: string | null | undefined;
let parsedCache: ActiveCase | null = null;
function snapshot(): ActiveCase | null {
  let raw: string | null = null;
  try { raw = sessionStorage.getItem(KEY); } catch {}
  if (raw !== rawCache) { rawCache = raw; try { parsedCache = raw ? (JSON.parse(raw) as ActiveCase) : null; } catch { parsedCache = null; } }
  return parsedCache;
}
/** The active case. undefined on the server and during hydration, null if there is none. */
export function useActiveCase(): ActiveCase | null | undefined {
  return useSyncExternalStore(() => () => {}, snapshot, () => undefined);
}

const TOPIC_KEY = "hale.topic";
export function setSuggestedTopic(id: string) { try { sessionStorage.setItem(TOPIC_KEY, id); } catch {} }
export function useSuggestedTopic(): string | null | undefined {
  return useSyncExternalStore(() => () => {}, () => { try { return sessionStorage.getItem(TOPIC_KEY); } catch { return null; } }, () => undefined);
}
