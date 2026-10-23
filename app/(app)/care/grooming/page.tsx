"use client";
import { useState } from "react";
import Icon from "@/components/Icon";
import { Thumb } from "@/components/Art";
import PetSwitcher from "@/components/PetSwitcher";
import { BackHeader, Skeleton, Toast } from "@/components/ui";
import { GROOMERS, type Groomer } from "@/lib/seed";
import { activePet, useHale, useNow } from "@/lib/store";
import { describeDays, groomDueIn } from "@/lib/reminders";

const SLOTS = ["Today 5 pm", "Tomorrow 11 am", "Saturday 10 am"];

export default function Grooming() {
  const { ready, state } = useHale();
  const now = useNow();
  const [sel, setSel] = useState<Groomer | null>(null);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [toast, setToast] = useState<string | null>(null);
  if (!ready || !now) return <div className="screen"><Skeleton h={90} /></div>;
  const pet = activePet(state);
  const due = pet ? groomDueIn(pet, now) : null;

  return (
    <div className="screen">
      <BackHeader title="Grooming" />
      <PetSwitcher />
      {pet && due !== null && <div className="card" style={{ background: due <= 7 ? "var(--amber-soft)" : "var(--teal-soft)", boxShadow: "none" }}><div style={{ fontWeight: 600 }}>{pet.name} is {describeDays(due)} for a groom</div><div className="sub">We remind you before, based on coat length and the last groom.</div></div>}
      <div className="sectionTitle">Centres near you</div>
      <div className="stack">
        {GROOMERS.map((g) => (
          <div key={g.id} className="card">
            <div className="row" style={{ alignItems: "flex-start" }}><Thumb kind={g.id === "g3" ? "spa" : "groom"} size={52} /><div className="grow"><div style={{ fontWeight: 600, fontSize: 17 }}>{g.name}</div><div className="sub">{g.area} · {g.km} km · ★ {g.rating}</div></div><span className="tiny">{g.price}</span></div>
            <div className="sub" style={{ marginTop: 6 }}>{g.services.join(" · ")}</div>
            {g.offer && <div className="row" style={{ marginTop: 10, color: "var(--amber)", fontWeight: 600, fontSize: 14 }}><Icon name="tag" size={18} />{g.offer}</div>}
            <button className="btn soft" style={{ marginTop: 12 }} onClick={() => setSel(g)}>Book a slot</button>
          </div>
        ))}
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo: partners and prices are simulated</p>
      {sel && (
        <>
          <div className="scrim" onClick={() => setSel(null)} />
          <div className="sheet"><div className="grab" /><h2 className="h2">Book {sel.name}</h2>
            <div className="choices" style={{ margin: "16px 0" }}>{SLOTS.map((s) => <button key={s} className={`choice ${slot === s ? "on" : ""}`} onClick={() => setSlot(s)}>{s}</button>)}</div>
            <button className="btn primary" onClick={() => { setSel(null); setToast(`Booked ${sel.name}, ${slot} (demo)`); setTimeout(() => setToast(null), 2600); }}>Confirm booking</button></div>
        </>
      )}
      <Toast text={toast} />
    </div>
  );
}
