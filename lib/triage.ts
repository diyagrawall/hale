import { checkRedFlags, guessSpecies } from "./redFlags";
import { matchLandmark } from "./locations";
import type { AiCase, Landmark } from "./types";

export type CaseCard = {
  species: string | null;
  injury: string;
  location: string;
  urgency: "critical" | "urgent" | "stable" | "unknown";
};

export type TriageResult =
  | { status: "needs_info"; missing: ("what" | "where")[]; heardLocation: string | null }
  | { status: "ready"; card: CaseCard; landmark: Landmark; flags: string[] };

/**
 * Combines the typed text, the red-flag rule and (if available) the AI reading.
 * Nothing is guessed: if "what happened" or "where" can't be found, we ask.
 * The AI can raise urgency but never lower it below the red-flag rule.
 */
const tidyPlace = (p: string | null | undefined) =>
  p?.trim().replace(/^(?:near|at|in|outside|opposite|behind|beside|around)\s+/i, "") || null;

/** Best-effort place name from the typed text ("near X", "at X"), used only to tell the person what we couldn't find. */
export function guessPlaceName(text: string): string | null {
  const m = /\b(?:near|at|in|outside|opposite|behind|beside|around)\s+([A-Za-z][A-Za-z0-9 .'-]{2,40}?)(?=[,.;!?]|\s+(?:and|but|he|she|it|they|can|cannot|can't|is|was|with|who)\b|$)/i.exec(text.trim());
  return m ? m[1].trim() : null;
}

export function buildTriage(text: string, ai: AiCase | null): TriageResult {
  const flags = checkRedFlags(text);
  const injury = ai?.injury?.trim() || (flags.hit ? flags.matched.join(", ") : null);
  const landmark = matchLandmark(text) ?? (ai?.location ? matchLandmark(ai.location) : null);

  const missing: ("what" | "where")[] = [];
  if (!injury) missing.push("what");
  if (!landmark) missing.push("where");
  if (!injury || !landmark) {
    return { status: "needs_info", missing, heardLocation: tidyPlace(ai?.location) || guessPlaceName(text) };
  }

  return {
    status: "ready",
    flags: flags.matched,
    landmark,
    card: {
      species: ai?.species?.trim() || guessSpecies(text),
      injury,
      location: landmark.name,
      urgency: flags.hit ? "critical" : (ai?.urgency ?? "unknown"),
    },
  };
}
