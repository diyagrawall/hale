import { useCallback, useSyncExternalStore } from "react";

// Everything the app remembers lives on the device (localStorage). No database in the demo.
export type Persona = "owner" | "finder" | "ngo";
export type Vaccine = { name: string; given: string; everyDays: number };
export type Pet = {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string;
  birthday?: string;
  sex: "Male" | "Female";
  neutered: boolean;
  weightKg?: number;
  allergies: string[];
  conditions: string;
  medicines: string;
  usualVet?: string;
  lastVisit?: string;
  vaccines: Vaccine[];
  food?: { name: string; bagKg: number; dailyGrams: number; openedOn: string };
  lastGroomed?: string;
  records?: { name: string; date: string }[];
};
export type Prefs = {
  health: boolean; grooming: boolean; food: boolean; offers: boolean; events: boolean; cases: boolean;
  offersPerWeek: number; quietFrom: string; quietTo: string; roundUp: boolean;
};
export type HaleState = {
  persona: Persona | null;
  volunteer: boolean;
  pets: Pet[];
  activePetId: string | null;
  prefs: Prefs;
  dismissed: Record<string, number>;
  raised: Record<string, number>;
  given: number;
  helped: number;
  sponsor: { amount: number; target: string; paused: boolean } | null;
  location: string;
};

export const DEFAULT_STATE: HaleState = {
  persona: null,
  volunteer: false,
  pets: [],
  activePetId: null,
  prefs: { health: true, grooming: true, food: true, offers: true, events: true, cases: true, offersPerWeek: 2, quietFrom: "22:00", quietTo: "07:00", roundUp: false },
  dismissed: {},
  raised: {},
  given: 0,
  helped: 0,
  sponsor: null,
  location: "Baner, Pune",
};

const KEY = "hale.v1";
const listeners = new Set<() => void>();

function parse(raw: string | null): HaleState {
  if (!raw) return DEFAULT_STATE;
  try {
    const saved = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...saved, prefs: { ...DEFAULT_STATE.prefs, ...(saved.prefs ?? {}) } };
  } catch {
    return DEFAULT_STATE;
  }
}
function readRaw(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

let cachedRaw: string | null | undefined;
let cachedState: HaleState = DEFAULT_STATE;
function getSnapshot(): HaleState {
  const raw = readRaw();
  if (raw !== cachedRaw) { cachedRaw = raw; cachedState = parse(raw); }
  return cachedState;
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
}
const noop = () => () => {};

/** ready=false on the server and during hydration, so pages never mismatch. */
export function useHale() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_STATE);
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const update = useCallback((fn: (s: HaleState) => HaleState) => {
    const next = fn(parse(readRaw()));
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    listeners.forEach((l) => l());
  }, []);
  return { ready, state, update };
}

let loadedAt: Date | null = null;
/** The time the page loaded, available only in the browser (keeps prerender clean). */
export function useNow(): Date | null {
  return useSyncExternalStore(noop, () => (loadedAt ??= new Date()), () => null);
}

export const newId = () => Math.random().toString(36).slice(2, 9);

export function activePet(s: HaleState): Pet | null {
  return s.pets.find((p) => p.id === s.activePetId) ?? s.pets[0] ?? null;
}
