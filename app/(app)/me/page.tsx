"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { HomeCard, SectionTitle } from "@/components/ui";
import { useHale, type Persona } from "@/lib/store";
import { Pic, coatFor, kindFor } from "@/components/Art";

const ROLES: { id: Persona; label: string }[] = [{ id: "finder", label: "Found an animal" }, { id: "owner", label: "Pet owner" }, { id: "ngo", label: "NGO" }];

export default function Me() {
  const router = useRouter();
  const { state, update } = useHale();
  function reset() { try { localStorage.removeItem("hale.v1"); } catch {} router.push("/"); }
  return (
    <div className="screen">
      <h1 className="display">Me</h1>
      <SectionTitle>I am</SectionTitle>
      <div className="choices">{ROLES.map((r) => <button key={r.id} className={`choice ${state.persona === r.id ? "on" : ""}`} onClick={() => update((s) => ({ ...s, persona: r.id }))}>{r.label}</button>)}</div>
      <p className="tiny" style={{ marginTop: 8 }}>This only changes the order of cards on Home. Nothing is hidden.</p>
      <SectionTitle>My pets</SectionTitle>
      <div className="stack">
        {state.pets.map((p) => <div key={p.id} className="card row"><Pic kind={kindFor(p.species)} coat={coatFor(p.breed, p.species)} size={44} radius={14} /><div className="grow"><div style={{ fontWeight: 600 }}>{p.name}</div><div className="sub">{p.breed || p.species} · {p.weightKg ? `${p.weightKg} kg` : "weight not set"}</div></div></div>)}
        <Link href="/onboarding/pet" className="btn soft"><Icon name="plus" size={18} />Add a pet</Link>
      </div>
      <SectionTitle>Settings</SectionTitle>
      <div className="stack">
        <HomeCard icon="bell" title="Notifications" status="Reminders, offers and events" href="/me/notifications" />
        <HomeCard icon="give" title="Round up my orders" status={state.prefs.roundUp ? "On" : "Off"} onClick={() => update((s) => ({ ...s, prefs: { ...s.prefs, roundUp: !s.prefs.roundUp } }))} />
        <HomeCard icon="trend" title="My impact" status={`${state.helped} animals helped`} href="/give/impact" />
      </div>
      <button className="btn ghost" style={{ marginTop: 22 }} onClick={reset}>Reset demo and replay intro</button>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 10 }}>Demo build · data stays on this device</p>
    </div>
  );
}
