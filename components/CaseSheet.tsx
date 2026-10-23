"use client";
import { useState } from "react";
import Icon from "./Icon";
import { CASES, money, type CaseItem } from "@/lib/seed";
import { Hero, Scene, kindFor, type Coat } from "./Art";
import { useHale } from "@/lib/store";

const AMOUNTS = [200, 500, 1000];

export default function CaseSheet({ item, onClose }: { item: CaseItem; onClose: () => void }) {
  const { state, update } = useHale();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const raised = item.raised + (state.raised[item.id] ?? 0);
  const left = Math.max(item.goal - raised, 0);
  const pct = Math.min(100, Math.round((raised / item.goal) * 100));
  const value = custom ? Number(custom.replace(/\D/g, "")) || 0 : amount;

  function give() {
    if (value < 10) return;
    update((s) => ({ ...s, raised: { ...s.raised, [item.id]: (s.raised[item.id] ?? 0) + value }, given: s.given + value, helped: s.helped + (s.raised[item.id] ? 0 : 1) }));
    setDone(value);
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={`Support ${item.name}`}>
        <div className="grab" />
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="tiny">Verified by clinic · Demo</span>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="row" style={{ gap: 8, margin: "12px 0", alignItems: "stretch" }}>
          <div style={{ flex: 2 }}><Hero kind={kindFor(item.species)} coat={item.coat as Coat} tone={item.tone} hurt height={130} radius={18} /></div>
          <div style={{ flex: 1 }}><Scene kind="clinic" height={130} radius={18} /></div>
          <div style={{ flex: 1 }}><Scene kind="recovery" height={130} radius={18} /></div>
        </div>
        <h2 className="h2">{item.title}</h2>
        <div className="sub" style={{ marginTop: 4 }}>{item.name} · {item.species} · {item.place}</div>
        <p style={{ marginTop: 12 }}>{item.story}</p>
        <div className="card flat" style={{ marginTop: 6 }}>
          <div className="row" style={{ alignItems: "baseline" }}>
            <div className="h2" style={{ fontSize: 28 }}>{money(left)}</div>
            <div className="sub">still needed</div>
          </div>
          <div className="progress" style={{ margin: "10px 0 6px" }}><i style={{ width: `${pct}%` }} /></div>
          <div className="sub">{money(raised)} of {money(item.goal)} · {item.donors + (state.raised[item.id] ? 1 : 0)} people</div>
          <div className="divider" />
          <div className="sub">Treating clinic: <b>{item.clinic}</b>. Money goes straight to the clinic. Run by {item.ngo}.</div>
        </div>
        <div className="sectionTitle" style={{ margin: "20px 0 10px" }}>Updates</div>
        <div className="stack" style={{ gap: 8 }}>
          {item.updates.map((u) => (<div key={u} className="row sub"><span className="dot teal" />{u}</div>))}
        </div>
        {done ? (
          <div className="card" style={{ marginTop: 20, textAlign: "center" }}>
            <div className="h2">Thank you</div>
            <p className="sub">Your {money(done)} (simulated) is added to {item.name}&apos;s fund. We will send you an update after treatment.</p>
            <button className="btn soft" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div style={{ marginTop: 20 }}>
            <div className="choices" style={{ marginBottom: 12 }}>
              {AMOUNTS.map((a) => (
                <button key={a} className={`choice ${!custom && amount === a ? "on" : ""}`} onClick={() => { setAmount(a); setCustom(""); }}>{money(a)}</button>
              ))}
              <input className="field" style={{ width: 120, height: 44 }} inputMode="numeric" placeholder="Other" value={custom} onChange={(e) => setCustom(e.target.value)} />
            </div>
            <button className="btn primary" onClick={give} disabled={value < 10}>Give {money(value)} by UPI</button>
            <div className="demoNote" style={{ textAlign: "center", marginTop: 8 }}>Demo: payments simulated</div>
          </div>
        )}
      </div>
    </>
  );
}

export const FEATURED = CASES[0];
