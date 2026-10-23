"use client";
import Link from "next/link";
import Icon from "./Icon";
import { Pic, coatFor, kindFor } from "./Art";
import { useHale } from "@/lib/store";

export default function PetSwitcher() {
  const { state, update } = useHale();
  if (state.pets.length === 0) return null;
  const active = state.activePetId ?? state.pets[0].id;
  return (
    <div className="row" style={{ gap: 10, overflowX: "auto", padding: "4px 0 10px" }}>
      {state.pets.map((p) => (
        <button key={p.id} className="row" onClick={() => update((s) => ({ ...s, activePetId: p.id }))} style={{ gap: 8, padding: "6px 14px 6px 6px", borderRadius: 999, background: p.id === active ? "var(--teal)" : "#fff", color: p.id === active ? "#fff" : "var(--ink)", boxShadow: "var(--shadow)", flex: "none" }}>
          <Pic kind={kindFor(p.species)} coat={coatFor(p.breed, p.species)} tone="teal" size={30} radius={15} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
        </button>
      ))}
      <Link href="/onboarding/pet" className="iconbtn" aria-label="Add a pet" style={{ flex: "none", width: 40, height: 40 }}><Icon name="plus" size={20} /></Link>
    </div>
  );
}
