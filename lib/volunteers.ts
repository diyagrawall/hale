import type { Volunteer } from "./seed";

export type Ranked = Volunteer & { score: number; why: string };

/** Plain-code ranking: free and close first, then carrier and matching skills. The AI never picks who is alerted. */
export function rankVolunteers(list: Volunteer[], need: { skills?: string[] } = {}): Ranked[] {
  const want = (need.skills ?? []).map((s) => s.toLowerCase());
  return list
    .map((v) => {
      const skillHits = v.skills.filter((s) => want.includes(s.toLowerCase())).length;
      const score = (v.free ? 0 : 50) + v.km + (v.carrier ? 0 : 3) + (v.verified ? 0 : 8) - skillHits * 1.2;
      const bits = [`${v.km} km`, v.free ? "free now" : "busy", v.carrier ? "has a carrier" : "on " + v.vehicle];
      if (skillHits) bits.push("trained: " + v.skills.filter((s) => want.includes(s.toLowerCase())).join(", ").toLowerCase());
      return { ...v, score, why: bits.join(" · ") };
    })
    .sort((a, b) => a.score - b.score);
}
