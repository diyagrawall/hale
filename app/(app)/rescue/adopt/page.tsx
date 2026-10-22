"use client";
import { useState } from "react";
import Icon from "@/components/Icon";
import { BackHeader, Toast } from "@/components/ui";
import { ADOPTABLES, type Adoptable } from "@/lib/seed";

export default function Adopt() {
  const [sel, setSel] = useState<Adoptable | null>(null);
  const [months, setMonths] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const say = (t: string) => { setSel(null); setToast(t); setTimeout(() => setToast(null), 2800); };
  return (
    <div className="screen">
      <BackHeader title="Adopt or foster" />
      <p className="lead" style={{ marginTop: 0 }}>Animals from local rescues waiting for a home.</p>
      <div className="stack" style={{ marginTop: 16 }}>
        {ADOPTABLES.map((a) => (
          <button key={a.id} className="card" style={{ textAlign: "left" }} onClick={() => setSel(a)}>
            <div className="row">
              <div className={`photo ${a.tone === "p1" ? "" : a.tone}`} style={{ width: 84, height: 84 }}><Icon name="paw" size={32} /></div>
              <div className="grow"><div style={{ fontWeight: 600, fontSize: 18 }}>{a.name}</div><div className="sub">{a.species} · {a.age}</div><div className="tiny" style={{ marginTop: 4 }}>{a.facts.join(" · ")}</div></div>
              <Icon name="chevR" size={20} />
            </div>
          </button>
        ))}
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo animals</p>
      {sel && (
        <>
          <div className="scrim" onClick={() => setSel(null)} />
          <div className="sheet"><div className="grab" />
            <div className={`photo ${sel.tone === "p1" ? "" : sel.tone}`} style={{ height: 150 }}><Icon name="paw" size={46} /></div>
            <h2 className="h2" style={{ marginTop: 14 }}>{sel.name}</h2>
            <div className="sub">{sel.species} · {sel.age} · {sel.facts.join(", ")} · with {sel.ngo}</div>
            <p style={{ marginTop: 10 }}>{sel.story}</p>
            <div className="sectionTitle" style={{ margin: "16px 0 8px" }}>Foster for</div>
            <div className="choices">{[1, 2, 3].map((m) => <button key={m} className={`choice ${months === m ? "on" : ""}`} onClick={() => setMonths(m)}>{m} month{m > 1 ? "s" : ""}</button>)}</div>
            <div className="stack" style={{ marginTop: 18 }}>
              <button className="btn primary" onClick={() => say(`Request sent to ${sel.ngo} to adopt ${sel.name} (demo)`)}>Ask to adopt</button>
              <button className="btn soft" onClick={() => say(`Foster offer for ${months} month${months > 1 ? "s" : ""} sent (demo)`)}>Offer to foster</button>
            </div>
          </div>
        </>
      )}
      <Toast text={toast} />
    </div>
  );
}
