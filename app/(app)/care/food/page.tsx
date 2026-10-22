"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import PetSwitcher from "@/components/PetSwitcher";
import { BackHeader, Skeleton, Toast, Toggle } from "@/components/ui";
import { FOODS, money, type Food } from "@/lib/seed";
import { activePet, useHale, useNow } from "@/lib/store";
import { foodRunsOutIn, iso } from "@/lib/reminders";
import { ageYears, reasonTemplate, suitableFoods } from "@/lib/foods";

export default function FoodPage() {
  const { ready, state, update } = useHale();
  const now = useNow();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<Food | null>(null);
  const [round, setRound] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const pet = ready ? activePet(state) : null;
  const foods = pet && now ? suitableFoods(pet, FOODS, now) : [];
  const key = pet ? pet.id + ":" + pet.allergies.join(",") + ":" + foods.map((f) => f.id).join(",") : "";

  useEffect(() => {
    if (!pet || !now || foods.length === 0) return;
    let alive = true;
    const age = ageYears(pet, now);
    fetch("/api/food-advice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pet: { name: pet.name, species: pet.species, breed: pet.breed, age: age === null ? "age unknown" : age < 1 ? `${Math.round(age * 12)} months` : `${Math.floor(age)} years`, weightKg: pet.weightKg, allergies: pet.allergies, conditions: pet.conditions }, foods: foods.map((f) => ({ id: f.id, name: f.name, tags: f.tags })) }) })
      .then((r) => r.json()).then((d) => alive && setReasons(d.reasons ?? {})).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!ready || !now) return <div className="screen"><Skeleton h={90} /></div>;
  if (!pet) return <div className="screen"><BackHeader title="Food" /><div className="card sub" style={{ marginTop: 16 }}>Add a pet to get food picks and reorder reminders.</div></div>;
  const left = foodRunsOutIn(pet, now);
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2800); };

  function place() {
    if (!order || !pet) return;
    const f = order;
    update((s) => ({
      ...s,
      pets: s.pets.map((p) => (p.id === pet.id ? { ...p, food: { name: f.name, bagKg: f.kg, dailyGrams: p.food?.dailyGrams ?? 130, openedOn: iso(new Date()) } } : p)),
      given: s.given + (round ? 20 : 0),
    }));
    setOrder(null);
    say(round ? "Ordered (demo). ₹20 will help a rescue." : "Ordered (demo). Reminder reset.");
  }

  return (
    <div className="screen">
      <BackHeader title="Food" />
      <PetSwitcher />
      {left !== null && <div className="card" style={{ background: left <= 7 ? "var(--amber-soft)" : "var(--teal-soft)", boxShadow: "none" }}><div style={{ fontWeight: 600 }}>{pet.name}&apos;s food runs out in {Math.max(left, 0)} days</div><div className="sub">{pet.food?.name}. We work this out from the bag size and daily amount.</div></div>}
      <div className="sectionTitle">Picks for {pet.name}</div>
      {pet.allergies.length > 0 && <p className="sub" style={{ marginTop: -4, marginBottom: 12 }}>Foods with {pet.allergies.join(", ")} are hidden because of {pet.name}&apos;s allergy.</p>}
      <div className="stack">
        {foods.length === 0 && <div className="card sub">No matching foods in the demo catalogue.</div>}
        {foods.map((f) => (
          <div key={f.id} className="card">
            <div className="row" style={{ alignItems: "flex-start" }}><div className="grow"><div style={{ fontWeight: 600, fontSize: 17 }}>{f.name}</div><div className="sub" style={{ marginTop: 3 }}><Icon name="sparkle" size={14} /> {reasons[f.id] ?? reasonTemplate(pet, f)}</div></div><div style={{ fontWeight: 600 }}>{money(f.price)}</div></div>
            {f.offer && <div className="row" style={{ marginTop: 8, color: "var(--amber)", fontWeight: 600, fontSize: 14 }}><Icon name="tag" size={18} />{f.offer}</div>}
            <button className="btn soft" style={{ marginTop: 12 }} onClick={() => { setOrder(f); setRound(state.prefs.roundUp); }}>Order</button>
          </div>
        ))}
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>General guidance, check with your vet · Demo store, orders simulated</p>
      {order && (
        <>
          <div className="scrim" onClick={() => setOrder(null)} />
          <div className="sheet"><div className="grab" /><h2 className="h2">Order {order.name}</h2>
            <div className="row" style={{ margin: "14px 0" }}><div className="grow sub">Total</div><div className="h2">{money(order.price + (round ? 20 : 0))}</div></div>
            <Toggle label="Round up for a rescue" sub="Add ₹20 to help an injured stray" on={round} onChange={setRound} />
            <button className="btn primary" style={{ marginTop: 12 }} onClick={place}>Place order (demo)</button></div>
        </>
      )}
      <Toast text={toast} />
    </div>
  );
}
