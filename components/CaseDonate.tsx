"use client";
import { useState } from "react";
import { money } from "@/lib/seed";
import PaymentFlow from "./Payment";

export default function CaseDonate() {
  const [amount, setAmount] = useState(500);
  const [done, setDone] = useState(false);
  const [paying, setPaying] = useState(false);
  if (done && !paying) return <div className="card" style={{ textAlign: "center" }}><div className="h2">Thank you</div><p className="sub">Your {money(amount)} will go straight to the clinic.</p></div>;
  return (
    <div className="card">
      <div className="choices" style={{ marginBottom: 12 }}>{[200, 500, 1000].map((a) => <button key={a} className={`choice ${amount === a ? "on" : ""}`} onClick={() => setAmount(a)}>{money(a)}</button>)}</div>
      <button className="btn primary" onClick={() => setPaying(true)}>Give {money(amount)} by UPI</button>
      <div className="demoNote" style={{ textAlign: "center", marginTop: 8 }}>Demo: payments simulated</div>
      {paying && <PaymentFlow amount={amount} payee="Treating clinic" note="Treatment fund" onDone={() => setDone(true)} onClose={() => setPaying(false)} />}
    </div>
  );
}
