import vets from "../data/vets.json";
import type { Vet, VetWithDistance } from "./types";

export const VETS: Vet[] = vets as Vet[];

/** Minutes since midnight in Indian time. */
export function istMinutesNow(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function isOpenAt(vet: Vet, minutes: number): boolean {
  if (vet.hours === "24h") return true;
  const [open, close] = vet.hours.split("-").map(toMinutes);
  return open < close ? minutes >= open && minutes < close : minutes >= open || minutes < close;
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export function nearestOpenVets(point: { lat: number; lng: number }, minutes: number, n = 3): VetWithDistance[] {
  return VETS.filter((v) => isOpenAt(v, minutes))
    .map((v) => ({ ...v, distanceKm: distanceKm(point, v) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n);
}

export const describeHours = (v: Vet) => (v.hours === "24h" ? "Open 24 hours" : `Open ${v.hours.replace("-", "–")}`);
