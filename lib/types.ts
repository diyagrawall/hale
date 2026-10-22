export type Urgency = "critical" | "urgent" | "stable";

/** What Claude hands back after reading a report. null = "not stated". */
export type AiCase = {
  species: string | null;
  injury: string | null;
  location: string | null;
  urgency: Urgency | null;
};

export type Landmark = { id: string; name: string; lat: number; lng: number; aliases: string[] };
export type Vet = { id: string; name: string; area: string; lat: number; lng: number; hours: string; kind?: "private" | "government" | "ngo"; note?: string; price?: string; city?: string };
export type VetWithDistance = Vet & { distanceKm: number };
