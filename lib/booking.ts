import type { Booking } from "./store";
import type { EventItem } from "./seed";

// Booking money rules. Plain code: the AI never touches these numbers.
export const ROUND_UP = 20;
export const MAX_TICKETS = 6;

export type Price = { tickets: number; fee: number; donation: number; total: number };

/** Free events cost nothing. Paid events add a booking fee of 5% (at least ₹10, at most ₹49): Hale's revenue. */
export function priceBooking(event: Pick<EventItem, "price">, qty: number, roundUp: boolean): Price {
  const q = Math.max(1, Math.min(MAX_TICKETS, Math.floor(qty) || 1));
  const tickets = event.price * q;
  const fee = tickets === 0 ? 0 : Math.min(49, Math.max(10, Math.round(tickets * 0.05)));
  const donation = roundUp && tickets > 0 ? ROUND_UP : 0;
  return { tickets, fee, donation, total: tickets + fee + donation };
}

export function seatsLeft(event: Pick<EventItem, "id" | "seats">, bookings: Booking[]): number {
  const taken = bookings.filter((b) => b.eventId === event.id).reduce((n, b) => n + b.qty, 0);
  return Math.max(0, event.seats - taken);
}

/** A calendar file (all-day) so the booking can be added to any calendar app. */
export function icsFor(b: Booking): string {
  const day = b.dateIso.replace(/-/g, "");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hale//Events//EN", "BEGIN:VEVENT",
    `UID:${b.ref}@hale.app`, `DTSTAMP:${day}T000000Z`, `DTSTART;VALUE=DATE:${day}`,
    `SUMMARY:${b.title}`, `LOCATION:${b.place}`, `DESCRIPTION:Booking ${b.ref}. ${b.qty} ticket${b.qty > 1 ? "s" : ""}. Time: ${b.time}.`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
