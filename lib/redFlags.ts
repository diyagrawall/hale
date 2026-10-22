// Plain-code safety check. It runs in the browser, never waits for the AI,
// and only looks for danger words. It never decides that something is safe.

const FLAGS: { label: string; re: RegExp }[] = [
  { label: "bleeding", re: /\b(bleed(ing|s)?|blood|bloody)\b/ },
  {
    label: "can't stand or walk",
    re: /\b(can ?not|can'?t|cant|unable to|not able to|won'?t)\s+(stand|walk|get up|move)\b|\bnot (standing|walking|moving)\b/,
  },
  {
    label: "hit by a vehicle",
    re: /\b(hit|run over|ran over|knocked down|struck)\b[^.]{0,30}\b(car|bike|truck|bus|vehicle|auto|scooter|tempo)\b|\baccident\b/,
  },
  { label: "unconscious or collapsed", re: /\b(unconscious|unresponsive|collapsed|barely (alive|moving))\b/ },
  { label: "seizure", re: /\b(seizures?|convuls\w*|fitting)\b/ },
  { label: "breathing trouble", re: /\b(gasping|not breathing|can'?t breathe|difficulty breathing)\b/ },
  { label: "broken bone", re: /\b(broken|fracture[ds]?|dangling)\b/ },
  { label: "poisoning", re: /\b(poison(ed|ing)?|foaming)\b/ },
];

export function checkRedFlags(text: string): { hit: boolean; matched: string[] } {
  const t = text.toLowerCase().replace(/[’‘`]/g, "'");
  const matched = FLAGS.filter((f) => f.re.test(t)).map((f) => f.label);
  return { hit: matched.length > 0, matched };
}

/** Used only when the AI is unavailable. */
export function guessSpecies(text: string): string | null {
  const t = text.toLowerCase();
  const table: [RegExp, string][] = [
    [/\b(dog|puppy|pup)\b/, "dog"],
    [/\b(cat|kitten)\b/, "cat"],
    [/\b(cow|calf|bull)\b/, "cow"],
    [/\b(bird|crow|pigeon|kite)\b/, "bird"],
  ];
  return table.find(([re]) => re.test(t))?.[1] ?? null;
}
