import type { Booking, Pet, Prefs } from "./store";
import { EVENTS, OFFERS } from "./seed";
import { daysUntil, describeDays, foodRunsOutIn, groomDueIn, vaccineStatus } from "./reminders";

export type Notif = { id: string; kind: "health" | "grooming" | "food" | "offer" | "event"; title: string; body: string; priority: number; href: string };

/**
 * Rules decide what to send and when; no AI. Health reminders always outrank offers,
 * offers are only for pets they suit, and offers per week are capped by the user's setting.
 */
export function buildNotifications(pets: Pet[], prefs: Prefs, now: Date, weekday: number = now.getDay(), bookings: Booking[] = []): Notif[] {
  const out: Notif[] = [];
  if (prefs.events) {
    for (const b of bookings) {
      const d = daysUntil(b.dateIso, now);
      if (d >= 0 && d <= 2) out.push({ id: `b-${b.id}`, kind: "event", priority: 1, title: `Your ticket: ${b.title}`, body: `${d === 0 ? "Today" : d === 1 ? "Tomorrow" : "In 2 days"}, ${b.time}, ${b.place}. Booking ${b.ref}.`, href: "/care/events" });
    }
  }
  for (const pet of pets) {
    if (prefs.health) {
      for (const v of vaccineStatus(pet, now)) if (v.inDays <= 14) out.push({ id: `v-${pet.id}-${v.name}`, kind: "health", priority: 1, title: `${pet.name}: ${v.name} ${describeDays(v.inDays)}`, body: "Book a visit so the cover does not lapse.", href: "/care/vet" });
    }
    if (prefs.food) {
      const f = foodRunsOutIn(pet, now);
      if (f !== null && f <= 7) out.push({ id: `f-${pet.id}`, kind: "food", priority: 1, title: `Reorder ${pet.name}'s food`, body: `It runs out in ${Math.max(f, 0)} days.`, href: "/care/food" });
    }
    if (prefs.grooming) {
      const g = groomDueIn(pet, now);
      if (g !== null && g <= 7) out.push({ id: `g-${pet.id}`, kind: "grooming", priority: 2, title: `${pet.name} is due for a groom`, body: describeDays(g)[0].toUpperCase() + describeDays(g).slice(1) + ".", href: "/care/grooming" });
    }
  }
  if (prefs.offers) {
    const species = new Set(pets.map((p) => p.species));
    const todays = OFFERS.filter((o) => (o.weekday === null || o.weekday === weekday) && (!o.species || species.has(o.species)) && o.kind !== "Event");
    for (const o of todays.slice(0, prefs.offersPerWeek)) {
      const dueGroom = o.kind === "Grooming" ? pets.find((p) => (groomDueIn(p, now) ?? 99) <= 14) : undefined;
      out.push({ id: `o-${o.id}`, kind: "offer", priority: 3, title: `${o.partner}: ${o.title}`, body: `${dueGroom ? `${dueGroom.name} is due for a groom. ` : ""}${o.km ? `${o.km} km away. ` : ""}Today only.`, href: "/care/offers" });
    }
  }
  if (prefs.events) {
    for (const e of EVENTS.filter((x) => x.inDays <= 7).slice(0, 2)) out.push({ id: `e-${e.id}`, kind: "event", priority: 3, title: e.title, body: `In ${e.inDays} days · ${e.place}`, href: "/care/events" });
  }
  return out.sort((a, b) => a.priority - b.priority);
}
