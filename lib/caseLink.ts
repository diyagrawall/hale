import { computeFunding } from "./funding";
import type { CaseCard } from "./triage";

// The shareable case lives inside the link itself (no database in the MVP).
export type SharedCase = { card: CaseCard; clinic: string; estimate: number; contribution: number; appeal: string };

export function encodeCase(c: SharedCase): string {
  const bytes = new TextEncoder().encode(JSON.stringify(c));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCase(encoded: string | undefined): SharedCase | null {
  if (!encoded) return null;
  try {
    const bin = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))));
    const card = o?.card;
    const f = computeFunding(o?.estimate, o?.contribution);
    if (!card || typeof card.injury !== "string" || typeof card.location !== "string") return null;
    if (typeof o.clinic !== "string" || typeof o.appeal !== "string" || !f.ok) return null;
    return {
      card: { species: typeof card.species === "string" ? card.species : null, injury: card.injury, location: card.location, urgency: card.urgency },
      clinic: o.clinic,
      estimate: f.estimate,
      contribution: f.contribution,
      appeal: o.appeal,
    };
  } catch {
    return null;
  }
}
