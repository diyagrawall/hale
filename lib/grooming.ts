import type { Appointment } from "./store";
import type { Groomer } from "./seed";

export const OPEN_FROM = 10 * 60;
export const OPEN_TO = 20 * 60;
export const DAYS_AHEAD = 14;

export type DayOption = { iso: string; weekday: number; dow: string; num: number; month: string };

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const p2 = (n: number) => String(n).padStart(2, "0");
export const localIso = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

/** Today plus the next 13 days, as strip options. */
export function dayOptions(now: Date): DayOption[] {
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { iso: localIso(d), weekday: d.getDay(), dow: i === 0 ? "Today" : DOW[d.getDay()], num: d.getDate(), month: MONTH[d.getMonth()] };
  });
}

export function weekdayOf(dateIso: string): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function prettyDate(dateIso: string): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOW[dt.getDay()]}, ${d} ${MONTH[m - 1]}`;
}

export function fmtTime(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${((h + 11) % 12) + 1}${m ? `:${p2(m)}` : ""} ${h < 12 ? "am" : "pm"}`;
}

/** Slot start times in minutes from midnight, every 30 minutes. */
export const SLOT_TIMES: number[] = Array.from({ length: (OPEN_TO - OPEN_FROM) / 30 }, (_, i) => OPEN_FROM + i * 30);

export const PARTS: { name: string; from: number; to: number }[] = [
  { name: "Morning", from: 0, to: 12 * 60 },
  { name: "Afternoon", from: 12 * 60, to: 16 * 60 },
  { name: "Evening", from: 16 * 60, to: 24 * 60 },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100;
}

/** Past slots (needs 1 hour notice) and about a third of the rest are taken. Same answer every time. */
export function slotAvailable(groomerId: string, dateIso: string, mins: number, now: Date): boolean {
  if (dateIso === localIso(now) && mins < now.getHours() * 60 + now.getMinutes() + 60) return false;
  if (dateIso < localIso(now)) return false;
  const busy = weekdayOf(dateIso) === 0 ? 20 : 34; // Sundays are quieter
  return hash(`${groomerId}|${dateIso}|${mins}`) >= busy;
}

export type Quote = { subtotal: number; discount: number; total: number; offer?: string };

/** Money for a booking. Wednesday 15% at Paws & Claws; free nail trim on Sundays at Fluffy Tails. */
export function quoteGrooming(g: Groomer, picked: string[], weekday: number): Quote {
  const items = g.services.filter((s) => picked.includes(s.name));
  const subtotal = items.reduce((n, s) => n + s.price, 0);
  let discount = 0;
  let offer: string | undefined;
  if (g.id === "g1" && weekday === 3 && subtotal > 0) { discount = Math.round(subtotal * 0.15); offer = "Wednesday offer: 15% off"; }
  if (g.id === "g2" && weekday === 0) {
    const nails = items.find((s) => s.name === "Nail trim");
    if (nails) { discount = nails.price; offer = "Sunday offer: free nail trim"; }
  }
  return { subtotal, discount, total: subtotal - discount, offer };
}

export function icsForAppointment(a: Appointment, mins: number): string {
  const day = a.dateIso.replace(/-/g, "");
  const start = `${day}T${p2(Math.floor(mins / 60))}${p2(mins % 60)}00`;
  const end = `${day}T${p2(Math.floor((mins + 60) / 60))}${p2((mins + 60) % 60)}00`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hale//Grooming//EN", "BEGIN:VEVENT",
    `UID:${a.ref}@hale.app`, `DTSTAMP:${day}T000000`, `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:Grooming for ${a.petName} at ${a.groomer}`, `DESCRIPTION:${a.services.join(", ")}. Booking ${a.ref}.`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
