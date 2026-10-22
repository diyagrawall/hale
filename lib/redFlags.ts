// Plain-code safety check. It runs in the browser, never waits for the AI,
// and only looks for danger words. It never decides that something is safe.

const FLAGS: { label: string; re: RegExp }[] = [
  { label: "bleeding", re: /\b(bleed(ing|s)?|blood|bloody|haemorrhag\w*|hemorrhag\w*)\b/ },
  {
    label: "can't stand or walk",
    re: /\b(can ?not|can'?t|cant|unable to|not able to|won'?t|unable)\s+(stand|walk|get up|move)\b|\bnot (standing|walking|moving)\b|\b(paralys\w*|paralyz\w*)\b|\bdrag(s|ging)?\s+(his |her |its |the |their )?(back |hind |front )?(legs?|body)\b|\blegs? not working\b/,
  },
  {
    label: "hit by a vehicle",
    re: /\b(hit|run over|ran over|knocked down|struck|crushed)\b[^.]{0,30}\b(car|bike|truck|bus|vehicle|auto|scooter|tempo|train|lorry)\b|\b(run over|ran over|runover|rammed|hit[- ]and[- ]run)\b|\baccident\b/,
  },
  {
    label: "unconscious or collapsed",
    re: /\b(unconscious|unresponsive|collapsed|not responding|barely (alive|moving)|motionless|lifeless|lying still|cannot be woken)\b/,
  },
  { label: "seizure", re: /\b(seizures?|convuls\w*|fitting|having (a )?fits?|shaking uncontrollably|twitching)\b/ },
  {
    label: "breathing trouble",
    re: /\b(gasping|not breathing|can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|struggling to breathe|labou?red breathing|breathing (hard|heavily|fast)|wheez\w*|choking)\b/,
  },
  { label: "broken bone", re: /\b(broken|fracture[ds]?|dangling|exposed bone|bone sticking)\b/ },
  { label: "maggots or infected wound", re: /\b(maggots?|worms in|infested|pus)\b/ },
  { label: "poisoning or snakebite", re: /\b(poison\w*|foaming|froth\w*|rat poison|snake ?bite|bitten by (a )?snake)\b/ },
  { label: "burns", re: /\b(burn(t|ed|s)?|acid|scalded)\b/ },
  {
    label: "deep wound",
    re: /\b(deep|open|gaping|large|big|huge|serious|severe) (wound|cut|gash)\b|\bgash(ed)?\b|\b(intestines|guts)\b|\bhead injury\b|\bwound (on|in|near) (its|the|his|her) (head|neck|belly|stomach)\b/,
  },
  { label: "serious bites", re: /\b(mauled|badly bitten|bitten badly|attacked by (other |stray )?dogs)\b/ },
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
