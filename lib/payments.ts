// Helpers for the simulated UPI flow. No money moves and nothing here talks to a bank.
export const UPI_APPS = [
  { id: "gpay", name: "Google Pay", color: "#4285F4", letter: "G" },
  { id: "phonepe", name: "PhonePe", color: "#5F259F", letter: "P" },
  { id: "paytm", name: "Paytm", color: "#00A3D9", letter: "P" },
  { id: "bhim", name: "BHIM", color: "#E8641B", letter: "B" },
] as const;

/** name@bank, like diya@okhdfc. Checks the shape only; it cannot know if the ID is real. */
export function upiIdValid(id: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{1,}@[a-z]{2,}$/i.test(id.trim());
}

/** A 12-digit transaction reference like a real UPI reference number. Only call from an event handler. */
export function makeRef(): string {
  let s = "";
  for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
  return s;
}

/** Groups digits for reading: 4381 2905 6712. */
export const groupRef = (ref: string) => ref.replace(/(\d{4})(?=\d)/g, "$1 ");
