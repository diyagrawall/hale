import { describe, expect, it } from "vitest";
import { appealAmountsOk, appealHasGender, cleanAppeal } from "./appeal";
import { decodeCase, encodeCase } from "./caseLink";
import { computeFunding } from "./funding";
import { LANDMARKS, matchLandmark } from "./locations";
import { sign, verify } from "./sign";
import { checkRedFlags } from "./redFlags";
import { buildTriage, guessPlaceName } from "./triage";
import { isOpenAt, nearestOpenVets } from "./vets";

const TEST1 = "dog bleeding near Govindpuri metro, can't stand";

describe("Test 1", () => {
  it("flags bleeding and can't stand, also with curly apostrophes", () => {
    expect(checkRedFlags(TEST1).matched).toEqual(["bleeding", "can't stand or walk"]);
    expect(checkRedFlags("dog can’t stand").hit).toBe(true);
  });
  it("returns 3 open vets sorted by distance, and only 24h vets at 2am", () => {
    const g = matchLandmark(TEST1)!;
    expect(g.id).toBe("govindpuri");
    const noon = nearestOpenVets(g, 720);
    expect(noon).toHaveLength(3);
    expect(noon[0].distanceKm).toBeLessThanOrEqual(noon[1].distanceKm);
    const night = nearestOpenVets(g, 120);
    expect(night).toHaveLength(3);
    expect(night.every((v) => v.hours === "24h")).toBe(true);
    expect(isOpenAt({ id: "x", name: "x", area: "x", lat: 0, lng: 0, hours: "09:00-21:00" }, 21 * 60)).toBe(false);
  });
  it("critical even when the AI says urgent; works with no AI", () => {
    const r = buildTriage(TEST1, { species: "dog", injury: "bleeding", location: "Govindpuri", urgency: "urgent" });
    expect(r.status === "ready" && r.card.urgency).toBe("critical");
    expect(buildTriage(TEST1, null).status).toBe("ready");
  });
});

describe("Test 2", () => {
  it("8000 - 2000 = 6000 gap, 25%", () => {
    const f = computeFunding("8000", "2000");
    expect(f).toMatchObject({ ok: true, gap: 6000, progressPct: 25 });
  });
  it("rejects amounts the AI invented", () => {
    expect(appealAmountsOk("We need ₹6,000 of ₹8,000.", [8000, 2000, 6000])).toBe(true);
    expect(appealAmountsOk("We need ₹9,999.", [8000, 2000, 6000])).toBe(false);
  });
  it("catches a made-up gender in the appeal", () => {
    expect(appealHasGender("She needs urgent care.")).toBe(true);
    expect(appealHasGender("Help him stand again")).toBe(true);
    expect(appealHasGender("This dog needs urgent care. Please share it.")).toBe(false);
  });
  it("strips markdown from the appeal", () => {
    expect(cleanAppeal("**Urgent: A Dog Needs Help**\n\n- It needs ₹6,000\n# Thanks")).toBe("Urgent: A Dog Needs Help\n\nIt needs ₹6,000\nThanks");
    expect(cleanAppeal("Plain text stays the same.")).toBe("Plain text stays the same.");
  });
  it("case link round-trips", () => {
    const c = { card: { species: "dog", injury: "bleeding", location: "Govindpuri metro", urgency: "critical" as const }, clinic: "Demo Vet", estimate: 8000, contribution: 2000, appeal: "Help ₹6,000" };
    expect(decodeCase(encodeCase(c))).toEqual(c);
  });
});

describe("signed links", () => {
  process.env.CASE_SECRET = "test-secret";
  it("accepts an untouched link and rejects an edited one", () => {
    const token = sign("abc");
    expect(verify(token)).toBe("abc");
    expect(verify("abd" + token.slice(3))).toBeNull();
    expect(verify("abc.wrongsignature")).toBeNull();
    expect(verify("nodot")).toBeNull();
  });
});

describe("danger words people really use", () => {
  const mustFlag = [
    "dog was run over near Okhla, still alive",
    "cat struggling to breathe near Saket",
    "puppy having fits near Kalkaji",
    "dog dragging his back legs near Nehru Place",
    "cow lying motionless on the road near Okhla",
    "dog with a deep wound on its head near Saket",
    "dog is paralysed near Govindpuri",
    "dog bitten badly by other dogs near Saket",
    "dog has maggots in a wound near Okhla",
    "dog ate something poisonous, foaming at the mouth",
    "dog hit by car near Okhla",
    "puppy unable to stand near Kalkaji",
  ];
  const mustNotFlag = ["healthy cat sleeping near Saket", "dog is limping near Saket", "help", "the dog fits in a small box"];
  it("flags real danger reports", () => {
    for (const t of mustFlag) expect(checkRedFlags(t).hit, t).toBe(true);
  });
  it("does not flag calm reports", () => {
    for (const t of mustNotFlag) expect(checkRedFlags(t).hit, t).toBe(false);
  });
});

describe("money as people write it", () => {
  it("accepts Rs, INR, /- and .00", () => {
    for (const v of ["₹8,000", "Rs. 8000/-", "INR 8000", "8000.00", " 8 000 "]) {
      expect(computeFunding(v, "2000"), v).toMatchObject({ ok: true, gap: 6000 });
    }
  });
  it("still rejects bad money", () => {
    for (const v of ["8000.50", "8k", "abc", "-5", ""]) expect(computeFunding(v, "0").ok, v).toBe(false);
  });
});

describe("vets across Delhi", () => {
  it("every landmark has an open vet within 8 km at noon and at 2am", () => {
    for (const id of ["dwarka", "rohini", "karolbagh", "laxminagar", "vasantkunj", "pitampura", "janakpuri", "hauzkhas"]) {
      const lm = LANDMARKS.find((l) => l.id === id)!;
      expect(lm, id).toBeTruthy();
      for (const mins of [12 * 60, 2 * 60]) {
        const [first] = nearestOpenVets(lm, mins);
        expect(first.distanceKm, `${id} at ${mins}`).toBeLessThan(8);
      }
    }
  });
});

describe("more places", () => {
  it("matches new landmarks and only known ones", () => {
    expect(matchLandmark("dog hit near Hauz Khas village")?.id).toBe("hauzkhas");
    expect(matchLandmark("cat injured at Dwarka sector 10")?.id).toBe("dwarka");
    expect(matchLandmark("cow near Laxmi Nagar metro")?.id).toBe("laxminagar");
    expect(matchLandmark("dog near Gurgaon sector 29")).toBeNull();
  });
  it("names the place we couldn't find", () => {
    expect(guessPlaceName("dog bleeding near Gurgaon sector 29, can't stand")).toBe("Gurgaon sector 29");
    expect(guessPlaceName("help")).toBeNull();
    const ai = { species: "dog", injury: "bleeding", location: "near Gurgaon sector 29", urgency: null };
    expect(buildTriage("dog bleeding near Gurgaon sector 29", ai)).toMatchObject({ heardLocation: "Gurgaon sector 29" });
    const r = buildTriage("dog bleeding near Gurgaon", null);
    expect(r).toMatchObject({ status: "needs_info", missing: ["where"], heardLocation: "Gurgaon" });
  });
});

describe("Test 3", () => {
  it("'help' and empty ask for details, with no invented fields", () => {
    expect(buildTriage("help", null)).toMatchObject({ status: "needs_info", missing: ["what", "where"] });
    expect(buildTriage("help", { species: null, injury: null, location: null, urgency: null }).status).toBe("needs_info");
  });
  it("red flag still works on the typed text", () => {
    expect(checkRedFlags("dog bleeding").hit).toBe(true);
    expect(buildTriage("dog bleeding", null)).toMatchObject({ status: "needs_info", missing: ["where"] });
  });
  it("bad estimates are rejected", () => {
    for (const bad of ["", "-5", "abc", " "]) expect(computeFunding(bad, "0").ok).toBe(false);
    expect(computeFunding("1000", "2000").ok).toBe(false);
  });
  it("broken links decode to null", () => {
    expect(decodeCase(undefined)).toBeNull();
    expect(decodeCase("garbage")).toBeNull();
  });
});
