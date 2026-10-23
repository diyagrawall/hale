import type { ReactNode } from "react";
import { Person, Pic, Thumb, coatFor, kindFor, type Coat } from "./Art";
import type { CardId } from "@/lib/persona";
import type { Pet } from "@/lib/store";
import { CASES } from "@/lib/seed";

/** The little picture shown on each Home and Care card. */
export function cardArt(id: CardId, pet: Pet | null): ReactNode {
  switch (id) {
    case "vet": return pet ? <Pic kind={kindFor(pet.species)} coat={coatFor(pet.breed, pet.species)} size={46} radius={15} tone="teal" /> : <Thumb kind="clinic" />;
    case "grooming": return <Thumb kind="groom" />;
    case "food": return <Thumb kind="bag" />;
    case "events": return <Thumb kind="camp" />;
    case "offers": return <Thumb kind="offer" />;
    case "sos": return <Thumb kind="aid" />;
    case "check": return <Thumb kind="eye" />;
    case "volunteer": return <Person name="Rohit Kulkarni" size={46} />;
    case "featured": { const c = CASES[0]; return <Pic kind={kindFor(c.species)} coat={c.coat as Coat} tone={c.tone} hurt size={46} radius={15} />; }
    case "adopt": return <Pic kind="dog" coat="yellow" young tone="p3" size={46} radius={15} />;
    case "give": case "fundraising": return <Thumb kind="give" />;
    case "cases": return <Thumb kind="aid" />;
    case "shelter": return <Thumb kind="adopt" />;
    case "vetpartners": return <Thumb kind="clinic" />;
  }
}
