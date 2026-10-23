"use client";
import Link from "next/link";
import PetSwitcher from "@/components/PetSwitcher";
import { HomeCard, Skeleton } from "@/components/ui";
import { activePet, useHale, useNow } from "@/lib/store";
import { cardInfo } from "@/lib/homecards";
import { cardArt } from "@/components/cardArt";
import type { CardId } from "@/lib/persona";

export default function Care() {
  const { ready, state } = useHale();
  const now = useNow();
  if (!ready || !now) return <div className="screen"><div className="stack"><Skeleton /><Skeleton /><Skeleton /></div></div>;
  const pet = activePet(state);
  const ids: CardId[] = ["vet", "grooming", "food", "events", "offers"];
  return (
    <div className="screen">
      <h1 className="display">Care</h1>
      <p className="lead">{pet ? `Everything ${pet.name} needs.` : "Add a pet to get reminders and tailored picks."}</p>
      <div style={{ marginTop: 14 }}><PetSwitcher /></div>
      {!pet && <Link href="/onboarding/pet" className="btn primary" style={{ marginBottom: 14 }}>Add your pet</Link>}
      <div className="stack">
        {ids.map((id) => { const c = cardInfo(id, { pet, now, state }); return <HomeCard key={id} icon={c.icon} art={cardArt(id, pet)} tone={c.tone === "red" ? undefined : c.tone} title={c.title} status={c.status} href={c.href} due={c.due} />; })}
      </div>
    </div>
  );
}
