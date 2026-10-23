import type { CardId } from "./persona";
import type { HaleState, Pet } from "./store";
import { CASES, EVENTS, OFFERS, ADOPTABLES, money } from "./seed";
import { describeDays, foodRunsOutIn, groomDueIn, nextVaccine } from "./reminders";

export type CardInfo = { icon: string; tone?: "warm" | "blue" | "red"; title: string; status: string; href?: string; due?: boolean; sheet?: boolean };

export function cardInfo(id: CardId, ctx: { pet: Pet | null; now: Date; state: HaleState }): CardInfo {
  const { pet, now, state } = ctx;
  switch (id) {
    case "vet": {
      const v = pet ? nextVaccine(pet, now) : null;
      return { icon: "vet", title: pet ? `Vet care for ${pet.name}` : "Vet care", status: v ? `${v.name} ${describeDays(v.inDays)}` : "Find a vet open now", href: "/care/vet", due: !!v && v.inDays <= 14 };
    }
    case "grooming": {
      const g = pet ? groomDueIn(pet, now) : null;
      return { icon: "scissors", tone: "warm", title: "Grooming", status: g !== null ? `${pet!.name}: ${describeDays(g)}` : "Nearby centres and offers", href: "/care/grooming", due: g !== null && g <= 7 };
    }
    case "food": {
      const f = pet ? foodRunsOutIn(pet, now) : null;
      return { icon: "bowl", tone: "warm", title: "Food", status: f !== null ? `${pet!.name}'s food runs out in ${Math.max(f, 0)} days` : "Picks for your pet and offers", href: "/care/food", due: f !== null && f <= 7 };
    }
    case "events": {
      const next = [...state.bookings].sort((a, b) => a.dateIso.localeCompare(b.dateIso))[0];
      return { icon: "calendar", tone: "blue", title: "Events nearby", status: next ? `Booked: ${next.title}` : `${EVENTS.filter((e) => e.inDays <= 7).length} this week, including a free vaccination camp`, href: "/care/events" };
    }
    case "offers": return { icon: "tag", tone: "blue", title: "Offers", status: `${OFFERS.length} offers near you`, href: "/care/offers" };
    case "sos": return { icon: "alert", tone: "red", title: "Emergency SOS", status: "Animal hurt or in danger?", href: "/rescue/sos" };
    case "check": return { icon: "eye", title: "Check on an animal", status: "A calm check for a limp or a thin dog", href: "/rescue/check" };
    case "volunteer": return { icon: "users", title: "Call a volunteer", status: "2 verified volunteers within 3 km", href: "/rescue/volunteer" };
    case "featured": {
      const c = CASES[0];
      return { icon: "give", tone: "warm", title: `${c.name} needs ${money(Math.max(c.goal - c.raised - (state.raised[c.id] ?? 0), 0))}`, status: "Verified by clinic. Tap to help", sheet: true };
    }
    case "adopt": return { icon: "paw", title: "Adopt or foster", status: `${ADOPTABLES.length} animals waiting for a home`, href: "/rescue/adopt" };
    case "give": return { icon: "give", title: "Give", status: "Cases to support and monthly sponsoring", href: "/give" };
    case "fundraising": return { icon: "give", tone: "warm", title: "Fundraising", status: "2 active appeals. Emergency pool ₹48,200", href: "/give" };
    case "cases": return { icon: "rescue", title: "Live cases", status: "4 open, 2 critical", href: "/rescue/cases" };
    case "shelter": return { icon: "home2", title: "Shelter space", status: "8 places free across Pune", href: "/rescue/cases" };
    case "vetpartners": return { icon: "vet", title: "Vet partners", status: "6 clinics, 4 open now", href: "/rescue/vets" };
  }
}
