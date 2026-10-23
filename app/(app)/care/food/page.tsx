"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { Thumb } from "@/components/Art";
import PetSwitcher from "@/components/PetSwitcher";
import PaymentFlow, { type PayMethod } from "@/components/Payment";
import { BackHeader, Skeleton, Toggle } from "@/components/ui";
import { FOODS, money, type Food } from "@/lib/seed";
import { activePet, newId, useHale, useNow, type Order } from "@/lib/store";
import { foodRunsOutIn } from "@/lib/reminders";
import { localIso } from "@/lib/grooming";
import { groupRef, makeRef } from "@/lib/payments";
import { ageYears, reasonTemplate, suitableFoods } from "@/lib/foods";

const STAGES = ["Placed", "Packed", "Out for delivery", "Delivered"];
const FREE_DELIVERY_AT = 999, DELIVERY_FEE = 40, ROUND = 20;

export default function FoodPage() {
  const { ready, state, update } = useHale();
  const now = useNow();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<Food | null>(null);
  const [round, setRound] = useState(false);
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState("Flat 4B, Sunrise Apartments, Baner, Pune 411045");
  const [slot, setSlot] = useState("");
  const [paying, setPaying] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

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

  const slots = [...(now.getHours() < 16 ? ["Today, 6–8 pm"] : []), "Tomorrow, 9–11 am", "Tomorrow, 6–8 pm", "Day after, 9–11 am"];
  const itemTotal = order ? order.price * qty : 0;
  const delivery = itemTotal >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
  const donation = round ? ROUND : 0;
  const total = itemTotal + delivery + donation;
  const chosenSlot = slot && slots.includes(slot) ? slot : slots[0];

  function openOrder(f: Food) { setOrder(f); setRound(state.prefs.roundUp); setQty(1); setSlot(""); setPlaced(null); setPaying(false); }
  function place(r: { ref: string; method: PayMethod }) {
    if (!order || !pet) return;
    const f = order;
    const o: Order = { id: newId(), ref: r.ref || makeRef(), petName: pet.name, item: f.name, qty, itemTotal, delivery, donation, total, address: address.trim() || "Pune", slot: chosenSlot, method: r.method === "cod" ? "cod" : "upi", stage: 0, at: new Date().toISOString() };
    update((s) => ({
      ...s,
      pets: s.pets.map((p) => (p.id === pet.id ? { ...p, food: { name: f.name, bagKg: f.kg * qty, dailyGrams: p.food?.dailyGrams ?? 130, openedOn: localIso(new Date()) } } : p)),
      given: s.given + donation,
      orders: [...s.orders, o],
    }));
    setPlaced(o);
  }
  const advance = (id: string) => update((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id && o.stage < 3 ? { ...o, stage: o.stage + 1 } : o)) }));
  const recent = [...state.orders].reverse();

  return (
    <div className="screen">
      <BackHeader title="Food" />
      <PetSwitcher />
      {left !== null && <div className="card" style={{ background: left <= 7 ? "var(--amber-soft)" : "var(--teal-soft)", boxShadow: "none" }}><div style={{ fontWeight: 600 }}>{pet.name}&apos;s food runs out in {Math.max(left, 0)} days</div><div className="sub">{pet.food?.name}. We work this out from the bag size and daily amount.</div></div>}
      {recent.length > 0 && (
        <>
          <div className="sectionTitle">Your orders</div>
          <div className="stack" style={{ gap: 10 }}>
            {recent.map((o) => (
              <div key={o.id} className="card">
                <div className="row"><div className="grow"><div style={{ fontWeight: 600 }}>{o.item}{o.qty > 1 ? ` × ${o.qty}` : ""}</div><div className="sub">For {o.petName} · {money(o.total)} · {o.method === "cod" ? "Pay on delivery" : "Paid by UPI"}</div></div><span className="tiny">#{o.ref.slice(-4)}</span></div>
                <Tracker stage={o.stage} />
                <div className="row" style={{ marginTop: 10 }}>
                  <div className="grow sub">{o.stage === 3 ? "Delivered. Thank you!" : `${STAGES[o.stage]} · ${o.slot}`}</div>
                  {o.stage < 3 && <button className="btn sm ghost" onClick={() => advance(o.id)}>Next step (demo)</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="sectionTitle">Picks for {pet.name}</div>
      {pet.allergies.length > 0 && <p className="sub" style={{ marginTop: -4, marginBottom: 12 }}>Foods with {pet.allergies.join(", ")} are hidden because of {pet.name}&apos;s allergy.</p>}
      <div className="stack">
        {foods.length === 0 && <div className="card sub">No matching foods in the demo catalogue.</div>}
        {foods.map((f) => (
          <div key={f.id} className="card">
            <div className="row" style={{ alignItems: "flex-start" }}><Thumb kind={f.species === "Cat" ? "can" : "bag"} size={52} /><div className="grow"><div style={{ fontWeight: 600, fontSize: 17 }}>{f.name}</div><div className="sub" style={{ marginTop: 3 }}><Icon name="sparkle" size={14} /> {reasons[f.id] ?? reasonTemplate(pet, f)}</div></div><div style={{ fontWeight: 600 }}>{money(f.price)}</div></div>
            {f.offer && <div className="row" style={{ marginTop: 8, color: "var(--amber)", fontWeight: 600, fontSize: 14 }}><Icon name="tag" size={18} />{f.offer}</div>}
            <button className="btn soft" style={{ marginTop: 12 }} onClick={() => openOrder(f)}>Order</button>
          </div>
        ))}
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>General guidance, check with your vet · Demo store, orders simulated</p>
      {order && (
        <>
          <div className="scrim" onClick={() => setOrder(null)} />
          <div className="sheet" role="dialog" aria-label={`Order ${order.name}`}><div className="grab" />
            {placed ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--teal)", color: "#fff", display: "grid", placeItems: "center", margin: "6px auto 12px", animation: "pop .5s both" }}><Icon name="check" size={38} stroke={2.8} /></div>
                <h2 className="h2" style={{ fontSize: 26 }}>Order placed</h2>
                <div className="sub">Order #{groupRef(placed.ref)}</div>
                <div className="card flat" style={{ marginTop: 14, textAlign: "left" }}>
                  <div style={{ fontWeight: 600 }}>{placed.item}{placed.qty > 1 ? ` × ${placed.qty}` : ""}</div>
                  <div className="sub" style={{ marginTop: 4 }}>Arriving {placed.slot}</div>
                  <div className="sub">{placed.address}</div>
                  <div className="row" style={{ marginTop: 8, fontWeight: 700 }}><span className="grow">{placed.method === "cod" ? "To pay on delivery" : "Paid"}</span><span>{money(placed.total)}</span></div>
                </div>
                {placed.donation > 0 && <p className="sub" style={{ marginTop: 10 }}>Your ₹{placed.donation} will help an injured stray. Thank you.</p>}
                <p className="sub" style={{ marginTop: 6 }}>{placed.petName}&apos;s reorder reminder has been reset.</p>
                <button className="btn primary" style={{ marginTop: 14 }} onClick={() => setOrder(null)}>Track my order</button>
                <p className="demoNote" style={{ marginTop: 10 }}>Demo order: nothing will be delivered.</p>
              </div>
            ) : (
              <>
                <h2 className="h2">{order.name}</h2>
                <div className="row" style={{ margin: "12px 0" }}>
                  <div className="grow sub">{money(order.price)} each</div>
                  <div className="row" style={{ gap: 14 }}>
                    <button className="btn sm soft" style={{ width: 44 }} onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button>
                    <b style={{ fontSize: 18, minWidth: 18, textAlign: "center" }}>{qty}</b>
                    <button className="btn sm soft" style={{ width: 44 }} onClick={() => setQty((q) => Math.min(5, q + 1))} aria-label="More">+</button>
                  </div>
                </div>
                <div className="sectionTitle" style={{ marginTop: 14 }}>Deliver to</div>
                <textarea className="field" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} aria-label="Delivery address" />
                <div className="sectionTitle">Delivery time</div>
                <div className="choices grid2">{slots.map((x) => <button key={x} className={`choice ${chosenSlot === x ? "on" : ""}`} onClick={() => setSlot(x)}>{x}</button>)}</div>
                <div style={{ marginTop: 14 }}><Toggle label="Round up for a rescue" sub={`Add ₹${ROUND} to help an injured stray`} on={round} onChange={setRound} /></div>
                <div className="card flat" style={{ marginTop: 12 }}>
                  <div className="row sub"><span className="grow">Items</span><span style={{ color: "var(--ink)" }}>{money(itemTotal)}</span></div>
                  <div className="row sub" style={{ marginTop: 6 }}><span className="grow">Delivery</span><span style={{ color: delivery ? "var(--ink)" : "var(--teal)" }}>{delivery ? money(delivery) : "Free"}</span></div>
                  {donation > 0 && <div className="row sub" style={{ marginTop: 6 }}><span className="grow">Rescue round-up</span><span style={{ color: "var(--ink)" }}>{money(donation)}</span></div>}
                  <div className="row" style={{ marginTop: 8, fontWeight: 700 }}><span className="grow">Total</span><span>{money(total)}</span></div>
                  {delivery > 0 && <div className="tiny" style={{ marginTop: 6 }}>Free delivery above {money(FREE_DELIVERY_AT)}</div>}
                </div>
                <button className="btn primary" style={{ marginTop: 14 }} disabled={!address.trim()} onClick={() => setPaying(true)}>Continue to pay · {money(total)}</button>
              </>
            )}
          </div>
        </>
      )}
      {paying && order && <PaymentFlow amount={total} payee="Hale Pet Store" note={`${order.name}${qty > 1 ? ` × ${qty}` : ""}`} methods={["upi", "cod"]} onDone={place} onClose={() => setPaying(false)} />}
    </div>
  );
}

function Tracker({ stage }: { stage: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginTop: 14 }} aria-label={`Order status: ${STAGES[stage]}`}>
      {STAGES.map((n, i) => (
        <div key={n} style={{ flex: 1, textAlign: "center", position: "relative" }}>
          {i > 0 && <div style={{ position: "absolute", top: 9, left: "-50%", right: "50%", height: 3, background: i <= stage ? "var(--teal)" : "var(--line)" }} />}
          <div style={{ position: "relative", width: 20, height: 20, borderRadius: "50%", margin: "0 auto", background: i <= stage ? "var(--teal)" : "var(--line)", color: "#fff", display: "grid", placeItems: "center" }}>{i <= stage && <Icon name="check" size={12} stroke={3} />}</div>
          <div className="tiny" style={{ marginTop: 4, fontSize: 11, color: i <= stage ? "var(--ink)" : undefined }}>{n}</div>
        </div>
      ))}
    </div>
  );
}
