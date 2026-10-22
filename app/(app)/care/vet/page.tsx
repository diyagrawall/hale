"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import PetSwitcher from "@/components/PetSwitcher";
import { BackHeader, Skeleton, Toast } from "@/components/ui";
import { activePet, useHale, useNow, type Pet } from "@/lib/store";
import { daysUntil, describeDays, iso, vaccineStatus } from "@/lib/reminders";
import { ageYears } from "@/lib/foods";
import { fileToDataUrl } from "@/lib/image";

type Scanned = { name: string; given: string | null; everyDays: number };

export default function VetCare() {
  const { ready, state, update } = useHale();
  const now = useNow();
  const [scan, setScan] = useState<{ busy: boolean; items?: Scanned[]; error?: string }>({ busy: false });
  const [toast, setToast] = useState<string | null>(null);
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2200); };

  if (!ready || !now) return <div className="screen"><div className="stack"><Skeleton h={160} /><Skeleton /><Skeleton /></div></div>;
  const pet = activePet(state);
  if (!pet) return (
    <div className="screen"><BackHeader title="Vet care" /><div className="card" style={{ textAlign: "center", marginTop: 20 }}><h2 className="h2">Add your pet first</h2><p className="sub">Then we can track vaccines and visits.</p><Link href="/onboarding/pet" className="btn primary" style={{ marginTop: 14 }}>Add a pet</Link></div></div>
  );

  const today = iso(now);
  const age = ageYears(pet, now);
  const petId = pet.id;
  const petName = pet.name;
  const patch = (fn: (p: Pet) => Pet) => update((s) => ({ ...s, pets: s.pets.map((p) => (p.id === petId ? fn(p) : p)) }));

  async function onCard(file?: File) {
    if (!file) return;
    setScan({ busy: true });
    try {
      const image = await fileToDataUrl(file, 1100, 0.78);
      const res = await fetch("/api/vaccine-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) });
      const data = await res.json();
      if (data.ok) setScan({ busy: false, items: data.vaccines }); else setScan({ busy: false, error: data.message + " You can add vaccines by hand." });
    } catch { setScan({ busy: false, error: "Could not read the card. You can add vaccines by hand." }); }
  }
  function acceptScan() {
    const items = (scan.items ?? []).filter((i) => i.given);
    patch((p) => ({ ...p, vaccines: [...p.vaccines.filter((v) => !items.some((i) => i.name.toLowerCase() === v.name.toLowerCase())), ...items.map((i) => ({ name: i.name, given: i.given as string, everyDays: i.everyDays }))] }));
    setScan({ busy: false });
    say("Vaccines added to " + petName);
  }
  const vs = vaccineStatus(pet, now);

  return (
    <div className="screen">
      <BackHeader title="Vet care" />
      <PetSwitcher />
      <div className="card">
        <div className="row"><div className="photo" style={{ width: 64, height: 64 }}><Icon name="paw" size={28} /></div><div className="grow"><div className="h2">{pet.name}</div><div className="sub">{pet.breed || pet.species} · {age !== null ? `${age < 1 ? Math.round(age * 12) + " months" : Math.floor(age) + " yrs"}` : "age not set"} · {pet.weightKg ? pet.weightKg + " kg" : "weight not set"}</div></div></div>
        <div className="divider" />
        <div className="stack sub" style={{ gap: 6 }}>
          <div><b>Allergies:</b> {pet.allergies.length ? pet.allergies.join(", ") : "none noted"}</div>
          <div><b>Conditions:</b> {pet.conditions || "none noted"}</div>
          <div><b>Medicines:</b> {pet.medicines || "none"}</div>
          <div><b>Last visit:</b> {pet.lastVisit ? `${-daysUntil(pet.lastVisit, now)} days ago` : "not recorded"}{pet.usualVet ? ` · ${pet.usualVet}` : ""}</div>
        </div>
      </div>

      <div className="sectionTitle">Vaccines and reminders</div>
      <div className="stack" style={{ gap: 10 }}>
        {vs.length === 0 && <div className="card sub">No vaccines recorded yet. Scan the vaccination card or add them in onboarding.</div>}
        {vs.map((v) => (
          <div key={v.name} className="card row">
            <div className="grow"><div style={{ fontWeight: 600 }}>{v.name}</div><div className="sub" style={{ color: v.inDays <= 14 ? "var(--amber)" : undefined, fontWeight: v.inDays <= 14 ? 600 : 400 }}>{describeDays(v.inDays)[0].toUpperCase() + describeDays(v.inDays).slice(1)} · {v.dueOn}</div></div>
            <button className="btn sm soft" onClick={() => { patch((p) => ({ ...p, vaccines: p.vaccines.map((x) => (x.name === v.name ? { ...x, given: today } : x)) })); say(`${v.name} marked done today`); }}>Done today</button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row"><div className="ic homecard" style={{ width: 44, height: 44, padding: 0, justifyContent: "center", boxShadow: "none", background: "var(--blue-soft)", color: "var(--blue)", borderRadius: 14 }}><Icon name="sparkle" /></div><div className="grow"><div style={{ fontWeight: 600 }}>Scan the vaccination card</div><div className="sub">AI reads the vaccines and dates. You confirm.</div></div></div>
        <label className="btn soft" style={{ marginTop: 12, cursor: "pointer" }}>
          <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onCard(e.target.files?.[0])} />
          {scan.busy ? "Reading the card…" : "Scan with camera"}
        </label>
        {scan.error && <div className="notBox">{scan.error}</div>}
        {scan.items && (
          <div style={{ marginTop: 12 }}>
            {scan.items.length === 0 && <div className="sub">Could not find any vaccines on that photo. Try a clearer one.</div>}
            {scan.items.map((i, idx) => (
              <div key={idx} className="row" style={{ marginTop: 8 }}>
                <div className="grow sub"><b style={{ color: "var(--ink)" }}>{i.name}</b></div>
                <input className="field" style={{ width: 150, height: 40 }} type="date" value={i.given ?? ""} onChange={(e) => setScan({ busy: false, items: scan.items!.map((x, j) => (j === idx ? { ...x, given: e.target.value || null } : x)) })} />
              </div>
            ))}
            {scan.items.length > 0 && <button className="btn primary" style={{ marginTop: 12 }} onClick={acceptScan}>Looks right: add to {pet.name}</button>}
          </div>
        )}
      </div>

      <div className="sectionTitle">Records vault</div>
      <div className="stack" style={{ gap: 10 }}>
        {(pet.records ?? []).map((r, i) => <div key={i} className="card row"><Icon name="file" /><div className="grow"><div style={{ fontWeight: 600 }}>{r.name}</div><div className="tiny">{r.date}</div></div></div>)}
        <label className="btn soft" style={{ cursor: "pointer" }}>
          <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { patch((p) => ({ ...p, records: [...(p.records ?? []), { name: f.name.slice(0, 40), date: today }] })); say("Record added"); } }} />
          <Icon name="plus" size={18} />Add a record
        </label>
        <button className="btn ghost" onClick={async () => { const t = `${pet.name}'s health card: hale.app/h/${pet.id}`; try { await navigator.clipboard.writeText(t); } catch {} say("Share link copied (demo)"); }}>Share health card with a vet</button>
      </div>
      <Link href="/rescue/vets" className="btn primary" style={{ marginTop: 18 }}>Find a vet now</Link>
      <Toast text={toast} />
    </div>
  );
}
