import type { Persona } from "./store";

export type CardId =
  | "vet" | "grooming" | "food" | "events" | "offers" | "sos" | "check" | "volunteer" | "featured"
  | "fundraising" | "cases" | "shelter" | "vetpartners" | "adopt" | "give";

// Everyone gets every card. Persona only changes the order.
const ORDER: Record<Persona, CardId[]> = {
  owner: ["vet", "grooming", "food", "events", "offers", "sos", "check", "volunteer", "featured", "adopt", "give", "fundraising", "cases", "shelter", "vetpartners"],
  finder: ["sos", "check", "volunteer", "featured", "adopt", "give", "vet", "grooming", "food", "events", "offers", "fundraising", "cases", "shelter", "vetpartners"],
  ngo: ["fundraising", "cases", "shelter", "vetpartners", "volunteer", "sos", "featured", "adopt", "give", "check", "vet", "grooming", "food", "events", "offers"],
};

export function cardOrder(persona: Persona | null): CardId[] {
  return ORDER[persona ?? "finder"];
}
export const ABOVE_FOLD = 4;
