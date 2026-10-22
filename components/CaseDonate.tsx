"use client";
import { useState } from "react";
import { money } from "@/lib/seed";

export default function CaseDonate() {
  const [amount, setAmount] = useState(500);
  const [done, setDone] = useState(false);
  if (done) return <div className="card" style={{ textAlign: "center" }}><div className="h2">Thank you</div><p className="sub">Your {money(amount)} (simulated) will go straight to the clinic.</p></div>;
  return (
    <div className="card">
      <div className="choices" style={{ marginBottom: 12 }}>{[200, 500, 1000].map((a) => <button key={a} className={`choice ${amount === a ? "on" : ""}`} onClick={() => setAmount(a)}>{money(a)}</button>)}</div>
      <button className="btn primary" onClick={() => setDone(true)}>Give {money(amount)} by UPI</button>
      <div className="demoNote" style={{ textAlign: "center", marginTop: 8 }}>Demo: payments simulated</div>
    </div>
  );
}
