import type { Pet } from "./store";
import type { Food } from "./seed";

export function ageYears(pet: Pet, now: Date): number | null {
  if (!pet.birthday) return null;
  return (now.getTime() - new Date(pet.birthday + "T00:00:00").getTime()) / (365.25 * 86_400_000);
}

export function lifeStage(pet: Pet, now: Date): "puppy" | "adult" | "senior" {
  const a = ageYears(pet, now);
  if (a !== null && a < 1) return "puppy";
  if (a !== null && a >= 8) return "senior";
  return "adult";
}

/** Plain-code filter: right species and life stage, and nothing the pet is allergic to. The AI only explains the picks. */
export function suitableFoods(pet: Pet, foods: Food[], now: Date): Food[] {
  const allergies = pet.allergies.map((a) => a.toLowerCase());
  const stage = lifeStage(pet, now);
  return foods.filter((f) => f.species === pet.species && (f.stage === "all" || f.stage === stage) && !f.allergens.some((a) => allergies.includes(a.toLowerCase())));
}

export function reasonTemplate(pet: Pet, f: Food): string {
  const avoid = pet.allergies.length ? `Free of ${pet.allergies.join(", ")}. ` : "";
  return `${avoid}${f.tags[0] ? f.tags[0][0].toUpperCase() + f.tags[0].slice(1) + "." : "Suits " + pet.name + "."}`;
}
