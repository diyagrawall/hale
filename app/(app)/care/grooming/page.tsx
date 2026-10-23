"use client";
import { useState } from "react";
import Icon from "@/components/Icon";
import { Thumb } from "@/components/Art";
import PetSwitcher from "@/components/PetSwitcher";
import PaymentFlow, { type PayMethod } from "@/components/Payment";
import { BackHeader, Skeleton, Toast } from "@/components/ui";
import { GROOMERS, money, type Groomer } from "@/lib/seed";
import { activePet, newId, useHale, useNow, type Appointment } from "@/lib/store";
import { describeDays, groomDueIn } from "@/lib/reminders";
import { PARTS, SLOT_TIMES, dayOptions, fmtTime, icsForAppointment, localIso, prettyDate, quoteGrooming, slotAvailable, weekdayOf } from "@/lib/grooming";
import { groupRef, makeRef } from "@/lib/payments";

const priceRange = (g: Groomer) => { const p = g.services.map((s) => s.price); return `${money(Math.min(...p))}–${money(Math.max(...p))}`; };

export default function Grooming() {
  const { ready, state, update } = useHale();
  const now = useNow();
  const [sel, setSel] = useState<Groomer | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [dateIso, setDateIso] = useState("");
  const [mins, setMins] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  if (!ready || !now) return <div className="screen"><Skeleton h={90} /></div>;
  const pet = activePet(state);
  const due = pet ? groomDueIn(pet, now) : null;
  const today = localIso(now);
  const days = dayOptions(now);
  const day = dateIso || today;
  const upcoming = state.appointments.filter((a) => a.dateIso >= today).sort((a, b) => (a.dateIso + String(1000 + a.mins)).localeCompare(b.dateIso + String(1000 + b.mins)));

  function open(g: Groomer) {
    setSel(g); setPicked([g.services[0].name]); setDateIso(""); setMins(null); setDone(null); setPaying(false);
  }
  const quote = sel ? quoteGrooming(sel, picked, weekdayOf(day)) : null;
  const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const canPay = !!sel && !!quote && mins !== null && picked.length > 0;

  function finish(r: { ref: string; method: PayMethod }) {
    if (!sel || !quote || mins === null) return;
    const a: Appointment = { id: newId(), ref: r.ref || makeRef(), mins, groomerId: sel.id, groomer: sel.name, petName: pet?.name ?? "Your pet", services: picked, dateIso: day, time: fmtTime(mins), subtotal: quote.subtotal, discount: quote.discount, total: quote.total, paid: r.method === "upi", at: new Date().toISOString() };
    update((s) => ({ ...s, appointments: [...s.appointments, a] }));
    setDone(a);
  }
  function cancel(id: string) {
    update((s) => ({ ...s, appointments: s.appointments.filter((a) => a.id !== id) }));
    setToast("Appointment cancelled (demo)"); setTimeout(() => setToast(null), 2400);
  }
  function download(a: Appointment) {
    const url = URL.createObjectURL(new Blob([icsForAppointment(a, a.mins)], { type: "text/calendar" }));
    const l = document.createElement("a"); l.href = url; l.download = `grooming-${a.ref}.ics`; l.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="screen">
      <BackHeader title="Grooming" />
      <PetSwitcher />
      {pet && due !== null && <div className="card" style={{ background: due <= 7 ? "var(--amber-soft)" : "var(--teal-soft)", boxShadow: "none" }}><div style={{ fontWeight: 600 }}>{pet.name} is {describeDays(due)} for a groom</div><div className="sub">We remind you before, based on coat length and the last groom.</div></div>}

      {upcoming.length > 0 && (
        <>
          <div className="sectionTitle">Your appointments</div>
          <div className="stack" style={{ gap: 10 }}>
            {upcoming.map((a) => (
              <div key={a.id} className="card">
                <div className="row"><div className="grow"><div style={{ fontWeight: 600 }}>{a.groomer}</div><div className="sub">{prettyDate(a.dateIso)}, {a.time} · {a.petName}</div><div className="tiny">{a.services.join(", ")} · {money(a.total)} {a.paid ? "paid" : "at salon"}</div></div><span className="tiny">#{a.ref.slice(-4)}</span></div>
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn sm soft" onClick={() => download(a)}>Add to calendar</button>
                  <button className="btn sm ghost" onClick={() => cancel(a.id)}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sectionTitle">Centres near you</div>
      <div className="stack">
        {GROOMERS.map((g) => (
          <div key={g.id} className="card">
            <div className="row" style={{ alignItems: "flex-start" }}><Thumb kind={g.id === "g3" ? "spa" : "groom"} size={52} /><div className="grow"><div style={{ fontWeight: 600, fontSize: 17 }}>{g.name}</div><div className="sub">{g.area} · {g.km} km · ★ {g.rating}</div></div><span className="tiny">{priceRange(g)}</span></div>
            <div className="sub" style={{ marginTop: 6 }}>{g.services.map((s) => s.name).join(" · ")}</div>
            {g.offer && <div className="row" style={{ marginTop: 10, color: "var(--amber)", fontWeight: 600, fontSize: 14 }}><Icon name="tag" size={18} />{g.offer}</div>}
            <button className="btn soft" style={{ marginTop: 12 }} onClick={() => open(g)}>Book a slot</button>
          </div>
        ))}
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo: partners, slots and prices are simulated</p>

      {sel && quote && (
        <>
          <div className="scrim" onClick={() => setSel(null)} />
          <div className="sheet" role="dialog" aria-label={`Book ${sel.name}`}>
            <div className="grab" />
            {done ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--teal)", color: "#fff", display: "grid", placeItems: "center", margin: "6px auto 12px", animation: "pop .5s both" }}><Icon name="check" size={38} stroke={2.8} /></div>
                <h2 className="h2" style={{ fontSize: 26 }}>You&apos;re booked</h2>
                <div className="sub">{done.groomer} · {done.petName}</div>
                <div className="card flat" style={{ marginTop: 14, textAlign: "left" }}>
                  <div className="row sub"><span className="grow">When</span><b style={{ color: "var(--ink)" }}>{prettyDate(done.dateIso)}, {done.time}</b></div>
                  <div className="row sub" style={{ marginTop: 8 }}><span className="grow">Services</span><span style={{ color: "var(--ink)", textAlign: "right" }}>{done.services.join(", ")}</span></div>
                  <div className="row sub" style={{ marginTop: 8 }}><span className="grow">{done.paid ? "Paid" : "To pay at salon"}</span><b style={{ color: "var(--ink)" }}>{money(done.total)}</b></div>
                  <div className="row sub" style={{ marginTop: 8 }}><span className="grow">Booking ID</span><span style={{ color: "var(--ink)" }}>{groupRef(done.ref)}</span></div>
                </div>
                <p className="sub" style={{ marginTop: 10 }}>We&apos;ll remind you the day before.</p>
                <button className="btn soft" style={{ marginTop: 10 }} onClick={() => download(done)}>Add to calendar</button>
                <button className="btn primary" style={{ marginTop: 10 }} onClick={() => setSel(null)}>Done</button>
                <p className="demoNote" style={{ marginTop: 10 }}>Demo booking: the salon is not actually notified.</p>
              </div>
            ) : (
              <>
                <h2 className="h2">{sel.name}</h2>
                <div className="sub">{sel.area} · ★ {sel.rating} · for {pet?.name ?? "your pet"}</div>

                <div className="sectionTitle" style={{ marginTop: 18 }}>Services</div>
                <div className="stack" style={{ gap: 8 }}>
                  {sel.services.map((s) => (
                    <button key={s.name} className={`choice ${picked.includes(s.name) ? "on" : ""}`} style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left" }} onClick={() => toggle(s.name)} aria-pressed={picked.includes(s.name)}>
                      <span>{s.name}</span><span>{money(s.price)}</span>
                    </button>
                  ))}
                </div>

                <div className="sectionTitle">Pick a date</div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -24px", padding: "2px 24px 8px" }}>
                  {days.map((d) => {
                    const on = d.iso === day;
                    return (
                      <button key={d.iso} onClick={() => { setDateIso(d.iso); setMins(null); }} aria-pressed={on} aria-label={`${d.dow} ${d.num} ${d.month}`}
                        style={{ flex: "none", width: 58, padding: "10px 0", borderRadius: 16, background: on ? "var(--teal)" : "#fff", color: on ? "#fff" : "var(--ink)", boxShadow: "var(--shadow)", textAlign: "center" }}>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{d.dow}</div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{d.num}</div>
                        <div style={{ fontSize: 11, opacity: 0.75 }}>{d.month}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="sectionTitle" style={{ marginTop: 14 }}>Pick a time</div>
                {PARTS.map((part) => {
                  const times = SLOT_TIMES.filter((t) => t >= part.from && t < part.to);
                  if (!times.length) return null;
                  return (
                    <div key={part.name} style={{ marginBottom: 12 }}>
                      <div className="tiny" style={{ marginBottom: 6 }}>{part.name}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        {times.map((t) => {
                          const ok = slotAvailable(sel.id, day, t, now);
                          const on = mins === t;
                          return (
                            <button key={t} disabled={!ok} onClick={() => setMins(t)} aria-pressed={on} aria-label={`${fmtTime(t)}${ok ? "" : ", not available"}`}
                              style={{ padding: "11px 0", borderRadius: 12, fontSize: 14, fontWeight: 600, background: on ? "var(--teal)" : ok ? "#fff" : "var(--bg2)", color: on ? "#fff" : ok ? "var(--ink)" : "var(--ink3)", boxShadow: ok ? "var(--shadow)" : "none", textDecoration: ok ? "none" : "line-through", opacity: ok ? 1 : 0.7 }}>
                              {fmtTime(t)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div className="tiny">Greyed-out times are taken or too soon.</div>

                <div className="card flat" style={{ marginTop: 14 }}>
                  <div className="row sub"><span className="grow">Services</span><span style={{ color: "var(--ink)" }}>{money(quote.subtotal)}</span></div>
                  {quote.discount > 0 && <div className="row sub" style={{ marginTop: 6, color: "var(--amber)" }}><span className="grow">{quote.offer}</span><b>−{money(quote.discount)}</b></div>}
                  <div className="row" style={{ marginTop: 8, fontWeight: 700 }}><span className="grow">Total</span><span>{money(quote.total)}</span></div>
                </div>
                <button className="btn primary" style={{ marginTop: 14 }} disabled={!canPay} onClick={() => setPaying(true)}>
                  {!picked.length ? "Choose a service" : mins === null ? "Choose a time" : `Continue · ${prettyDate(day)}, ${fmtTime(mins)}`}
                </button>
              </>
            )}
          </div>
        </>
      )}
      {paying && sel && quote && (
        <PaymentFlow amount={quote.total} payee={sel.name} note={`Grooming for ${pet?.name ?? "your pet"}`} methods={["upi", "salon"]} onDone={finish} onClose={() => setPaying(false)} />
      )}
      <Toast text={toast} />
    </div>
  );
}
