import type { Pet } from "./store";

const DAY = 86_400_000;

export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole days from today to the date (negative = overdue). */
export function daysUntil(dateIso: string, now: Date): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - startOfDay(now).getTime()) / DAY);
}

export function dueIso(given: string, everyDays: number): string {
  const [y, m, d] = given.split("-").map(Number);
  return iso(addDays(new Date(Date.UTC(y, m - 1, d)), everyDays));
}

export type VaccineStatus = { name: string; dueOn: string; inDays: number };

/** Vaccines sorted by how soon they are due. Plain date maths, no AI. */
export function vaccineStatus(pet: Pet, now: Date): VaccineStatus[] {
  return pet.vaccines
    .map((v) => {
      const dueOn = dueIso(v.given, v.everyDays);
      return { name: v.name, dueOn, inDays: daysUntil(dueOn, now) };
    })
    .sort((a, b) => a.inDays - b.inDays);
}

export function nextVaccine(pet: Pet, now: Date): VaccineStatus | null {
  return vaccineStatus(pet, now)[0] ?? null;
}

/** When the bag runs out: bag size ÷ daily amount, counted from the day it was opened. */
export function foodRunsOutIn(pet: Pet, now: Date): number | null {
  if (!pet.food || pet.food.dailyGrams <= 0) return null;
  const totalDays = Math.floor((pet.food.bagKg * 1000) / pet.food.dailyGrams);
  const runOut = iso(addDays(new Date(pet.food.openedOn + "T00:00:00Z"), totalDays));
  return daysUntil(runOut, now);
}

const LONG_COAT = /(golden|retriever|husky|shih|lhasa|spitz|persian|collie|pomeranian|poodle|maltese|cocker|labradoodle|saint)/i;

/** Days between grooms, by coat length. */
export function groomEveryDays(pet: Pet): number {
  return LONG_COAT.test(pet.breed) ? 28 : 45;
}

export function groomDueIn(pet: Pet, now: Date): number | null {
  if (!pet.lastGroomed) return null;
  return daysUntil(dueIso(pet.lastGroomed, groomEveryDays(pet)), now);
}

export function describeDays(n: number): string {
  if (n < 0) return `overdue by ${-n} day${-n === 1 ? "" : "s"}`;
  if (n === 0) return "due today";
  if (n === 1) return "due tomorrow";
  return `due in ${n} days`;
}

export function demoPet(now: Date): Pet {
  const ago = (n: number) => iso(addDays(now, -n));
  return {
    id: "bruno",
    name: "Bruno",
    species: "Dog",
    breed: "Labrador",
    birthday: ago(365 * 4 + 40),
    sex: "Male",
    neutered: true,
    weightKg: 28,
    allergies: ["chicken"],
    conditions: "Mild hip dysplasia",
    medicines: "None now",
    usualVet: "Dr. Sameer Deshpande (Demo)",
    lastVisit: ago(62),
    vaccines: [
      { name: "Rabies", given: ago(200), everyDays: 365 },
      { name: "DHPPi booster", given: ago(355), everyDays: 365 },
      { name: "Deworming", given: ago(70), everyDays: 90 },
    ],
    food: { name: "Chicken & Veg Adult 3 kg", bagKg: 3, dailyGrams: 130, openedOn: ago(17) },
    lastGroomed: ago(40),
  };
}
