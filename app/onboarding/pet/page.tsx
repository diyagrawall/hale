"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { BackHeader } from "@/components/ui";
import { useHale, useNow, newId, type Pet, type Vaccine } from "@/lib/store";
import { demoPet, iso } from "@/lib/reminders";

const BREEDS = ["Labrador", "Golden Retriever", "German Shepherd", "Indie", "Beagle", "Pug", "Shih Tzu", "Indie cat", "Persian"];
const ALLERGENS = ["chicken", "beef", "fish", "lamb", "grains"];
const VACCINES: { name: string; everyDays: number }[] = [
  { name: "Rabies", everyDays: 365 }, { name: "DHPPi booster", everyDays: 365 }, { name: "Deworming", everyDays: 90 },
];
const blank = (): Pet => ({ id: "", name: "", species: "Dog", breed: "", sex: "Male", neutered: true, allergies: [], conditions: "", medicines: "", vaccines: [] });

export default function PetOnboarding() {
  const router = useRouter();
  const { state, update } = useHale();
  const [step, setStep] = useState(1);
  const [pet, setPet] = useState<Pet>(blank);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Pet>(k: K, v: Pet[K]) => setPet((p) => ({ ...p, [k]: v }));
  const nowDate = useNow();
  const today = nowDate ? iso(nowDate) : "";

  function savePet(p: Pet) {
    const withId = p.id ? p : { ...p, id: newId() };
    const same = (x: Pet) => x.id === withId.id || (x.name.trim().toLowerCase() === withId.name.trim().toLowerCase() && x.breed === withId.breed);
    update((s) => ({ ...s, persona: s.persona ?? "owner", pets: [...s.pets.filter((x) => !same(x)), withId], activePetId: s.activePetId ?? withId.id }));
    setSaved(true);
  }
  function another() { setPet(blank()); setSaved(false); setStep(1); }
  function useDemo() { savePet(demoPet(new Date())); setPet(demoPet(new Date())); }
  function toggleAllergy(a: string) { set("allergies", pet.allergies.includes(a) ? pet.allergies.filter((x) => x !== a) : [...pet.allergies, a]); }
  function toggleVaccine(v: { name: string; everyDays: number }) {
    const has = pet.vaccines.find((x) => x.name === v.name);
    set("vaccines", has ? pet.vaccines.filter((x) => x.name !== v.name) : [...pet.vaccines, { name: v.name, given: today, everyDays: v.everyDays } as Vaccine]);
  }
  function setGiven(name: string, given: string) { set("vaccines", pet.vaccines.map((x) => (x.name === name ? { ...x, given } : x))); }

  if (saved) {
    return (
      <div className="phone"><div className="screen noNav">
        <div className="header"><div className="grow" /></div>
        <div className="card" style={{ marginTop: 40, textAlign: "center", padding: 28 }}>
          <div className="ic" style={{ width: 64, height: 64, borderRadius: 22, background: "var(--teal-soft)", color: "var(--teal)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icon name="check" size={30} stroke={2.4} /></div>
          <h1 className="h2" style={{ fontSize: 26 }}>{pet.name || "Your pet"} is added</h1>
          <p className="sub" style={{ marginTop: 6 }}>{state.pets.length + 0 || 1} pet{state.pets.length > 1 ? "s" : ""} on Hale. We will remind you about vaccines, grooming and food.</p>
          <div className="stack" style={{ marginTop: 22 }}>
            <button className="btn primary" onClick={() => router.push("/home")}>Continue</button>
            <button className="btn ghost" onClick={another}>Add another pet</button>
          </div>
        </div>
      </div></div>
    );
  }

  const canNext = step !== 1 || pet.name.trim().length > 0;
  const titles = ["About your pet", "Health basics", "Vet and vaccines", "Food and grooming"];

  return (
    <div className="phone"><div className="screen noNav">
      <BackHeader right={<span className="tiny">Step {step} of 4</span>} />
      <div className="progress" style={{ marginTop: 4 }}><i style={{ width: `${step * 25}%` }} /></div>
      <h1 className="display" style={{ marginTop: 22, fontSize: 28 }}>{titles[step - 1]}</h1>

      {step === 1 && (
        <div className="stack" style={{ marginTop: 20 }}>
          <button className="btn soft" onClick={useDemo}><Icon name="sparkle" size={18} />Use demo pet: Bruno</button>
          <div><label className="label">Name</label><input className="field" value={pet.name} onChange={(e) => set("name", e.target.value)} placeholder="Bruno" /></div>
          <div><label className="label">Species</label><div className="choices">{(["Dog", "Cat", "Other"] as const).map((s) => <button key={s} className={`choice ${pet.species === s ? "on" : ""}`} onClick={() => set("species", s)}>{s}</button>)}</div></div>
          <div><label className="label">Breed</label><input className="field" list="breeds" value={pet.breed} onChange={(e) => set("breed", e.target.value)} placeholder="Labrador" /><datalist id="breeds">{BREEDS.map((b) => <option key={b} value={b} />)}</datalist></div>
          <div className="row"><div className="grow"><label className="label">Birthday</label><input className="field" type="date" value={pet.birthday ?? ""} onChange={(e) => set("birthday", e.target.value)} /></div>
            <div className="grow"><label className="label">Weight (kg)</label><input className="field" inputMode="decimal" value={pet.weightKg ?? ""} onChange={(e) => set("weightKg", Number(e.target.value) || undefined)} placeholder="28" /></div></div>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div className="grow"><label className="label">Sex</label><div className="choices">{(["Male", "Female"] as const).map((s) => <button key={s} className={`choice ${pet.sex === s ? "on" : ""}`} onClick={() => set("sex", s)}>{s}</button>)}</div></div>
            <div className="grow"><label className="label">Neutered</label><div className="choices">{[true, false].map((b) => <button key={String(b)} className={`choice ${pet.neutered === b ? "on" : ""}`} onClick={() => set("neutered", b)}>{b ? "Yes" : "No"}</button>)}</div></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack" style={{ marginTop: 20 }}>
          <div><label className="label">Allergies</label><div className="choices">{ALLERGENS.map((a) => <button key={a} className={`choice ${pet.allergies.includes(a) ? "on" : ""}`} onClick={() => toggleAllergy(a)}>{a}</button>)}</div></div>
          <div><label className="label">Health conditions</label><input className="field" value={pet.conditions} onChange={(e) => set("conditions", e.target.value)} placeholder="None, or e.g. mild hip dysplasia" /></div>
          <div><label className="label">Medicines</label><input className="field" value={pet.medicines} onChange={(e) => set("medicines", e.target.value)} placeholder="None now" /></div>
        </div>
      )}

      {step === 3 && (
        <div className="stack" style={{ marginTop: 20 }}>
          <div><label className="label">Usual vet</label><input className="field" value={pet.usualVet ?? ""} onChange={(e) => set("usualVet", e.target.value)} placeholder="Dr. Sameer Deshpande" /></div>
          <div><label className="label">Last visit to a vet</label><input className="field" type="date" value={pet.lastVisit ?? ""} onChange={(e) => set("lastVisit", e.target.value)} /></div>
          <div>
            <label className="label">Vaccines given</label>
            <div className="choices">{VACCINES.map((v) => <button key={v.name} className={`choice ${pet.vaccines.some((x) => x.name === v.name) ? "on" : ""}`} onClick={() => toggleVaccine(v)}>{v.name}</button>)}</div>
            {pet.vaccines.map((v) => (
              <div key={v.name} className="row" style={{ marginTop: 10 }}>
                <div className="grow sub">{v.name}: date given</div>
                <input className="field" style={{ width: 160, height: 42 }} type="date" value={v.given} onChange={(e) => setGiven(v.name, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="stack" style={{ marginTop: 20 }}>
          <div><label className="label">Current food</label><input className="field" value={pet.food?.name ?? ""} onChange={(e) => set("food", { name: e.target.value, bagKg: pet.food?.bagKg ?? 3, dailyGrams: pet.food?.dailyGrams ?? 130, openedOn: pet.food?.openedOn ?? today })} placeholder="Lamb & Rice Adult 3 kg" /></div>
          {pet.food && (
            <div className="row">
              <div className="grow"><label className="label">Bag (kg)</label><input className="field" inputMode="decimal" value={pet.food.bagKg} onChange={(e) => set("food", { ...pet.food!, bagKg: Number(e.target.value) || 0 })} /></div>
              <div className="grow"><label className="label">Per day (g)</label><input className="field" inputMode="numeric" value={pet.food.dailyGrams} onChange={(e) => set("food", { ...pet.food!, dailyGrams: Number(e.target.value) || 0 })} /></div>
            </div>
          )}
          {pet.food && <div><label className="label">Bag opened on</label><input className="field" type="date" value={pet.food.openedOn} onChange={(e) => set("food", { ...pet.food!, openedOn: e.target.value })} /></div>}
          <div><label className="label">Last groomed</label><input className="field" type="date" value={pet.lastGroomed ?? ""} onChange={(e) => set("lastGroomed", e.target.value)} /></div>
        </div>
      )}

      <div className="stack" style={{ marginTop: 28 }}>
        <button className="btn primary" disabled={!canNext} onClick={() => (step < 4 ? setStep(step + 1) : savePet(pet))}>{step < 4 ? "Continue" : "Save pet"}</button>
        {step > 1 && <button className="btn ghost" onClick={() => (step < 4 ? setStep(step + 1) : savePet(pet))}>Skip for now</button>}
      </div>
    </div></div>
  );
}
