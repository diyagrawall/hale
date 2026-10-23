import { describe, expect, it } from "vitest";
import { addDays, daysUntil, demoPet, foodRunsOutIn, groomDueIn, nextVaccine } from "./reminders";
import { cardOrder, ABOVE_FOLD } from "./persona";
import { reasonTemplate, suitableFoods } from "./foods";
import { buildNotifications } from "./notifications";
import { rankVolunteers } from "./volunteers";
import { FOODS, VOLUNTEERS } from "./seed";
import { DEFAULT_STATE, type Pet } from "./store";

const NOW = new Date(2026, 9, 22, 12, 0, 0); // Thu 22 Oct 2026 (a Thursday)

describe("reminders (plain date maths)", () => {
  const bruno = demoPet(NOW);
  it("finds the next vaccine and how many days away it is", () => {
    const v = nextVaccine(bruno, NOW)!;
    expect(v.name).toBe("DHPPi booster");
    expect(v.inDays).toBe(10);
  });
  it("works out when the food bag runs out from size and daily amount", () => {
    // 3 kg at 130 g a day = 23 days, opened 17 days ago -> 6 days left
    expect(foodRunsOutIn(bruno, NOW)).toBe(6);
  });
  it("uses a shorter groom interval for long-coat breeds", () => {
    const lab = { ...bruno, breed: "Labrador", lastGroomed: "2026-09-12" };
    const golden = { ...bruno, breed: "Golden Retriever", lastGroomed: "2026-09-12" };
    expect(groomDueIn(lab, NOW)).toBeGreaterThan(groomDueIn(golden, NOW)!);
  });
  it("counts overdue days as negative", () => {
    expect(daysUntil("2026-10-20", NOW)).toBe(-2);
    expect(daysUntil("2026-10-22", NOW)).toBe(0);
    expect(daysUntil("2026-10-25", addDays(NOW, 0))).toBe(3);
  });
});

describe("persona only reorders cards", () => {
  it("every persona has every card", () => {
    const all = (p: "owner" | "finder" | "ngo") => [...cardOrder(p)].sort();
    expect(all("owner")).toEqual(all("finder"));
    expect(all("finder")).toEqual(all("ngo"));
  });
  it("puts the right card first", () => {
    expect(cardOrder("owner")[0]).toBe("vet");
    expect(cardOrder("finder")[0]).toBe("sos");
    expect(cardOrder("ngo")[0]).toBe("fundraising");
    expect(ABOVE_FOLD).toBe(4);
  });
});

describe("food picks are filtered by code, never by the AI", () => {
  const bruno = demoPet(NOW); // allergic to chicken
  it("removes foods containing an allergen and foods for other species", () => {
    const ids = suitableFoods(bruno, FOODS, NOW).map((f) => f.id);
    expect(ids).not.toContain("f2"); // chicken
    expect(ids).not.toContain("f5"); // chicken puppy food
    expect(ids).not.toContain("f6"); // cat food
    expect(ids).toContain("f1");
  });
  it("matches life stage", () => {
    const pup: Pet = { ...bruno, birthday: "2026-06-01", allergies: [] };
    const ids = suitableFoods(pup, FOODS, NOW).map((f) => f.id);
    expect(ids).toContain("f5");
    expect(ids).not.toContain("f4"); // senior food
  });
  it("explains an allergy in the fallback reason", () => {
    expect(reasonTemplate(bruno, FOODS[0])).toContain("chicken");
  });
});

describe("notification rules", () => {
  const pets = [demoPet(NOW)];
  it("health reminders outrank offers", () => {
    const list = buildNotifications(pets, DEFAULT_STATE.prefs, NOW, 3);
    expect(list[0].kind === "health" || list[0].kind === "food").toBe(true);
    const firstOffer = list.findIndex((n) => n.kind === "offer");
    const lastHealth = list.map((n) => n.priority).lastIndexOf(1);
    expect(lastHealth).toBeLessThan(firstOffer);
  });
  it("sends the Wednesday grooming offer only on Wednesday", () => {
    const wed = buildNotifications(pets, DEFAULT_STATE.prefs, NOW, 3);
    const thu = buildNotifications(pets, DEFAULT_STATE.prefs, NOW, 4);
    expect(wed.some((n) => n.title.includes("15% off"))).toBe(true);
    expect(thu.some((n) => n.title.includes("15% off"))).toBe(false);
  });
  it("respects the weekly offer cap and category switches", () => {
    const none = buildNotifications(pets, { ...DEFAULT_STATE.prefs, offersPerWeek: 0 }, NOW, 3);
    expect(none.some((n) => n.kind === "offer")).toBe(false);
    const quiet = buildNotifications(pets, { ...DEFAULT_STATE.prefs, health: false, food: false, grooming: false, offers: false, events: false }, NOW, 3);
    expect(quiet).toHaveLength(0);
  });
  it("does not send dog food offers to a cat-only home", () => {
    const cat: Pet = { ...demoPet(NOW), species: "Cat" };
    const list = buildNotifications([cat], DEFAULT_STATE.prefs, NOW, 5);
    expect(list.some((n) => n.title.includes("Lamb & Rice"))).toBe(false);
  });
});

describe("volunteer ranking is plain code", () => {
  it("puts the closest free carrier-owning volunteer first and unverified last", () => {
    const r = rankVolunteers(VOLUNTEERS, { skills: ["Bleeding", "Lifting"] });
    expect(r[0].name).toBe("Rohit Kulkarni");
    expect(r[r.length - 1].verified).toBe(false);
    expect(r[0].why).toContain("free now");
  });
});

import { icsFor, priceBooking, seatsLeft } from "./booking";
import { EVENTS } from "./seed";
import type { Booking } from "./store";

describe("event booking money (plain code)", () => {
  const camp = EVENTS.find((e) => e.id === "e1")!; // free
  const meetup = EVENTS.find((e) => e.id === "e3")!; // ₹199
  const expo = EVENTS.find((e) => e.id === "e4")!; // ₹299
  it("free events cost nothing, with no fee and no round-up", () => {
    expect(priceBooking(camp, 2, true)).toEqual({ tickets: 0, fee: 0, donation: 0, total: 0 });
  });
  it("paid events add a 5% booking fee, at least ₹10 and at most ₹49", () => {
    expect(priceBooking(meetup, 2, false)).toEqual({ tickets: 398, fee: 20, donation: 0, total: 418 });
    expect(priceBooking({ price: 50 }, 1, false).fee).toBe(10);
    expect(priceBooking(expo, 6, false).fee).toBe(49);
  });
  it("adds the rescue round-up only on paid bookings", () => {
    expect(priceBooking(meetup, 1, true).total).toBe(199 + 10 + 20);
  });
  it("keeps the number of tickets between 1 and 6", () => {
    expect(priceBooking(meetup, 0, false).tickets).toBe(199);
    expect(priceBooking(meetup, 99, false).tickets).toBe(199 * 6);
  });
});

describe("seats and tickets", () => {
  const b = (eventId: string, qty: number): Booking => ({ id: "x" + qty, ref: "HL-TEST", eventId, title: "Test event", place: "Baner", time: "10 am", dateIso: "2026-10-25", qty, pets: [], tickets: 0, fee: 0, donation: 0, total: 0, at: "2026-10-22T00:00:00.000Z" });
  it("counts spots left and never goes below zero", () => {
    const meetup = EVENTS.find((e) => e.id === "e3")!;
    expect(seatsLeft(meetup, [])).toBe(20);
    expect(seatsLeft(meetup, [b("e3", 6), b("e3", 4), b("e1", 9)])).toBe(10);
    expect(seatsLeft(meetup, [b("e3", 30)])).toBe(0);
  });
  it("makes a calendar file with the booking number", () => {
    const ics = icsFor(b("e3", 2));
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261025");
    expect(ics).toContain("HL-TEST");
  });
  it("reminds about a ticket the day before, ahead of offers", () => {
    const now = new Date(2026, 9, 24, 12, 0, 0);
    const list = buildNotifications([demoPet(now)], DEFAULT_STATE.prefs, now, 3, [b("e3", 2)]);
    expect(list[0].title).toContain("Your ticket");
    expect(list[0].body).toContain("Tomorrow");
    expect(buildNotifications([], { ...DEFAULT_STATE.prefs, events: false, offers: false }, now, 3, [b("e3", 2)])).toHaveLength(0);
  });
});
