"use client";
import { useState } from "react";
import { BackHeader, Skeleton, Toast } from "@/components/ui";
import { CASES, money } from "@/lib/seed";
import { useHale } from "@/lib/store";

const AMOUNTS = [100, 300, 500];

export default function Sponsor() {
  const { ready, state, update } = useHale();
  const [amount, setAmount] = useState(300);
  const [target, setTarget] = useState("Emergency pool");
  const [toast, setToast] = useState<string | null>(null);
  if (!ready) return <div className="screen"><Skeleton h={120} /></div>;
  const sp = state.sponsor;
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2400); };

  return (
    <div className="screen">
      <BackHeader title="Sponsor a rescue" />
      {sp ? (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="tiny">Your monthly gift</div>
          <div className="display" style={{ fontSize: 36 }}>{money(sp.amount)}</div>
          <div className="sub">Goes to: {sp.target} · {sp.paused ? "Paused" : "Active"}</div>
          <div className="stack" style={{ marginTop: 16 }}>
            <button className="btn soft" onClick={() => { update((s) => ({ ...s, sponsor: s.sponsor ? { ...s.sponsor, paused: !s.sponsor.paused } : null })); say(sp.paused ? "Sponsorship resumed" : "Sponsorship paused"); }}>{sp.paused ? "Resume" : "Pause"}</button>
            <button className="btn ghost" onClick={() => { update((s) => ({ ...s, sponsor: null })); say("Sponsorship cancelled"); }}>Cancel sponsorship</button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="display" style={{ fontSize: 28, marginTop: 8 }}>Steady help for strays</h1>
          <p className="lead">A small monthly gift lets rescuers say yes to the next emergency without waiting for a campaign.</p>
          <div className="sectionTitle">Each month</div>
          <div className="choices">{AMOUNTS.map((a) => <button key={a} className={`choice ${amount === a ? "on" : ""}`} onClick={() => setAmount(a)}>{money(a)}</button>)}</div>
          <div className="sectionTitle">Where it goes</div>
          <div className="choices">{["Emergency pool", ...CASES.slice(0, 2).map((c) => c.name)].map((t) => <button key={t} className={`choice ${target === t ? "on" : ""}`} onClick={() => setTarget(t)}>{t}</button>)}</div>
          <button className="btn primary" style={{ marginTop: 26 }} onClick={() => { update((s) => ({ ...s, sponsor: { amount, target, paused: false } })); say("Thank you! Sponsorship started (demo)"); }}>Sponsor {money(amount)} a month</button>
          <p className="demoNote" style={{ textAlign: "center", marginTop: 12 }}>Demo: payments simulated. Cancel anytime.</p>
        </>
      )}
      <Toast text={toast} />
    </div>
  );
}
