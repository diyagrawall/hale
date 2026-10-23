"use client";
import { useState } from "react";
import PaymentFlow from "@/components/Payment";
import { BackHeader, Skeleton, Toast, Toggle } from "@/components/ui";
import { Thumb, type ThumbKind } from "@/components/Art";
import Icon from "@/components/Icon";
import { EVENTS, money, type EventItem } from "@/lib/seed";
import { newId, useHale, useNow, type Booking } from "@/lib/store";
import { addDays, iso } from "@/lib/reminders";
import { MAX_TICKETS, ROUND_UP, icsFor, priceBooking, seatsLeft } from "@/lib/booking";

const KINDS = ["All", "Vaccination camp", "Adoption drive", "Meetup", "Workshop", "Expo"];
const thumbFor = (k: EventItem["kind"]): ThumbKind => (k === "Vaccination camp" ? "camp" : k === "Adoption drive" ? "adopt" : k === "Meetup" ? "meetup" : k === "Workshop" ? "aid" : "expo");
const when = (now: Date, inDays: number) => addDays(now, inDays).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default function Events() {
  const { ready, state, update } = useHale();
  const now = useNow();
  const [kind, setKind] = useState("All");
  const [sel, setSel] = useState<EventItem | null>(null);
  const [qty, setQty] = useState(1);
  const [bringing, setBringing] = useState<string[]>([]);
  const [round, setRound] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  if (!ready || !now) return <div className="screen"><Skeleton h={90} /></div>;

  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2600); };
  const list = EVENTS.filter((e) => kind === "All" || e.kind === kind);
  const mine = state.bookings;
  const price = sel ? priceBooking(sel, qty, round) : null;
  const left = sel ? seatsLeft(sel, mine) : 0;

  function open(e: EventItem) { setSel(e); setQty(1); setBringing([]); setRound(state.prefs.roundUp); setDone(null); }
  function book() {
    if (!sel || !price || !now || left < 1) return;
    const q = Math.min(qty, left);
    const p = priceBooking(sel, q, round);
    const b: Booking = { id: newId(), ref: "HL-" + newId().toUpperCase().slice(0, 5), eventId: sel.id, title: sel.title, place: sel.place, time: sel.time, dateIso: iso(addDays(now, sel.inDays)), qty: q, pets: bringing, tickets: p.tickets, fee: p.fee, donation: p.donation, total: p.total, at: now.toISOString() };
    update((s) => ({ ...s, bookings: [...s.bookings, b], given: s.given + p.donation }));
    setDone(b);
  }
  function cancel(b: Booking) {
    update((s) => ({ ...s, bookings: s.bookings.filter((x) => x.id !== b.id) }));
    say(b.total > 0 ? `Cancelled. ${money(b.total)} refund simulated.` : "Booking cancelled.");
  }
  function download(b: Booking) {
    const url = URL.createObjectURL(new Blob([icsFor(b)], { type: "text/calendar" }));
    const a = document.createElement("a"); a.href = url; a.download = `${b.ref}.ics`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="screen">
      <BackHeader title="Events nearby" />

      {mine.length > 0 && (
        <>
          <div className="sectionTitle" style={{ marginTop: 8 }}>Your tickets</div>
          <div className="stack" style={{ gap: 10 }}>
            {mine.map((b) => (
              <div key={b.id} className="card">
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <Thumb kind="ticket" size={52} />
                  <div className="grow"><div style={{ fontWeight: 600 }}>{b.title}</div><div className="sub">{when(addDays(new Date(b.dateIso + "T00:00:00"), 0), 0)} · {b.time} · {b.place}</div><div className="tiny" style={{ marginTop: 4 }}>{b.qty} ticket{b.qty > 1 ? "s" : ""}{b.pets.length ? ` · with ${b.pets.join(", ")}` : ""} · {b.total > 0 ? money(b.total) : "Free"} · Booking {b.ref}</div></div>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn sm soft" onClick={() => download(b)}>Add to calendar</button>
                  <button className="btn sm ghost" onClick={() => cancel(b)}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="choices" style={{ margin: "14px 0 16px" }}>{KINDS.map((k) => <button key={k} className={`choice ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>{k === "All" ? "All" : k + "s"}</button>)}</div>
      <div className="stack">
        {list.map((e) => {
          const n = seatsLeft(e, mine);
          const booked = mine.filter((b) => b.eventId === e.id).reduce((a, b) => a + b.qty, 0);
          return (
            <div key={e.id} className="card">
              <div className="row" style={{ alignItems: "flex-start" }}>
                <Thumb kind={thumbFor(e.kind)} size={56} />
                <div className="grow">
                  <div className="tiny">{when(now, e.inDays)} · {e.time}</div>
                  <div style={{ fontWeight: 600, fontSize: 17, margin: "4px 0" }}>{e.title}</div>
                  <div className="sub">{e.place} · {e.km} km · by {e.host}</div>
                </div>
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <div className="grow"><b style={{ fontSize: 18 }}>{e.price === 0 ? "Free" : money(e.price)}</b><span className="tiny">{e.price === 0 ? " · reserve your spot" : " per ticket"}{n <= 10 && n > 0 ? ` · only ${n} left` : ""}</span></div>
                {n === 0 ? <span className="tiny" style={{ color: "var(--red)", fontWeight: 600 }}>Sold out</span> : <button className="btn sm primary" onClick={() => open(e)}>{booked ? "Book more" : e.price === 0 ? "Reserve" : "Book"}</button>}
              </div>
              {booked > 0 && <div className="tiny" style={{ marginTop: 6, color: "var(--teal)", fontWeight: 600 }}>You have {booked} ticket{booked > 1 ? "s" : ""}</div>}
            </div>
          );
        })}
      </div>

      <div className="card flat" style={{ marginTop: 18 }}>
        <div className="row"><Thumb kind="expo" size={44} /><div className="grow"><div style={{ fontWeight: 600 }}>Host an event on Hale</div><div className="sub">Reach pet owners nearby. We charge a small booking fee on paid tickets.</div></div></div>
        <button className="btn sm soft" style={{ marginTop: 10 }} onClick={() => say("Thanks! We will get in touch (demo).")}>Tell us about your event</button>
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo events · payments simulated</p>

      {sel && price && (
        <>
          <div className="scrim" onClick={() => setSel(null)} />
          <div className="sheet" role="dialog" aria-label={`Book ${sel.title}`}>
            <div className="grab" />
            {done ? (
              <div>
                <div className="row" style={{ color: "var(--teal)", fontWeight: 600 }}><Icon name="check" size={20} />You are booked</div>
                <div className="card" style={{ marginTop: 12, background: "var(--blue-soft)", boxShadow: "none" }}>
                  <div className="row"><Thumb kind="ticket" size={56} /><div className="grow"><div style={{ fontWeight: 600, fontSize: 17 }}>{done.title}</div><div className="sub">{when(now, sel.inDays)} · {done.time}</div><div className="sub">{done.place}</div></div></div>
                  <div className="divider" />
                  <div className="row"><div className="grow"><div className="tiny">Booking</div><div style={{ fontWeight: 700, letterSpacing: ".06em" }}>{done.ref}</div></div><div><div className="tiny">Tickets</div><div style={{ fontWeight: 700 }}>{done.qty}</div></div><div><div className="tiny">Paid</div><div style={{ fontWeight: 700 }}>{done.total > 0 ? money(done.total) : "Free"}</div></div></div>
                  {done.pets.length > 0 && <div className="sub" style={{ marginTop: 8 }}>Bringing {done.pets.join(", ")}</div>}
                  <div className="tiny" style={{ marginTop: 8 }}>Show this booking number at the gate.{done.donation > 0 ? ` Your ${money(done.donation)} will help a rescue.` : ""}</div>
                </div>
                <div className="stack" style={{ marginTop: 16 }}>
                  <button className="btn primary" onClick={() => download(done)}>Add to calendar</button>
                  <button className="btn ghost" onClick={() => setSel(null)}>Done</button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="h2">{sel.price === 0 ? "Reserve" : "Book"}: {sel.title}</h2>
                <div className="sub" style={{ marginTop: 4 }}>{when(now, sel.inDays)} · {sel.time} · {sel.place}</div>
                <div className="row" style={{ margin: "18px 0 6px" }}>
                  <div className="grow"><div style={{ fontWeight: 600 }}>Tickets</div><div className="tiny">{left} spots left · up to {MAX_TICKETS}</div></div>
                  <button className="iconbtn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Fewer tickets">−</button>
                  <b style={{ width: 24, textAlign: "center", fontSize: 18 }}>{qty}</b>
                  <button className="iconbtn" onClick={() => setQty(Math.min(MAX_TICKETS, left, qty + 1))} aria-label="More tickets"><Icon name="plus" size={18} /></button>
                </div>
                {state.pets.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Who is coming?</div>
                    <div className="choices">{state.pets.map((p) => <button key={p.id} className={`choice ${bringing.includes(p.name) ? "on" : ""}`} onClick={() => setBringing((b) => (b.includes(p.name) ? b.filter((x) => x !== p.name) : [...b, p.name]))}>{p.name}</button>)}</div>
                  </div>
                )}
                {price.tickets > 0 && <div style={{ marginTop: 6 }}><Toggle label="Round up for a rescue" sub={`Add ${money(ROUND_UP)} to help an injured stray`} on={round} onChange={setRound} /></div>}
                <div className="card flat" style={{ marginTop: 12 }}>
                  <div className="row sub"><span className="grow">{qty} × {sel.price === 0 ? "free ticket" : money(sel.price)}</span><span>{money(price.tickets)}</span></div>
                  {price.fee > 0 && <div className="row sub" style={{ marginTop: 6 }}><span className="grow">Booking fee</span><span>{money(price.fee)}</span></div>}
                  {price.donation > 0 && <div className="row sub" style={{ marginTop: 6 }}><span className="grow">Rescue round-up</span><span>{money(price.donation)}</span></div>}
                  <div className="divider" style={{ margin: "10px 0" }} />
                  <div className="row"><b className="grow">Total</b><b style={{ fontSize: 20 }}>{price.total > 0 ? money(price.total) : "Free"}</b></div>
                </div>
                <button className="btn primary" style={{ marginTop: 16 }} disabled={left < 1} onClick={() => (price.total > 0 ? setPaying(true) : book())}>{price.total > 0 ? `Pay ${money(price.total)} and book` : "Reserve my spot"}</button>
                <p className="demoNote" style={{ textAlign: "center", marginTop: 8 }}>Demo: payment by UPI is simulated</p>
              </div>
            )}
          </div>
        </>
      )}
      {paying && sel && price && <PaymentFlow amount={price.total} payee="Hale Events" note={`${Math.min(qty, left)} ticket${qty > 1 ? "s" : ""}: ${sel.title}`} onDone={() => book()} onClose={() => setPaying(false)} />}
      <Toast text={toast} />
    </div>
  );
}
