"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { BackHeader, Skeleton } from "@/components/ui";
import { BITE_NOTE, TOPICS } from "@/lib/firstaid";
import { speak, stopSpeaking } from "@/lib/speech";
import { useSuggestedTopic } from "@/lib/session";

export default function FirstAid() {
  const suggested = useSuggestedTopic();
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  if (suggested === undefined) return <div className="screen noNav"><Skeleton h={300} /></div>;
  const id = picked === undefined ? suggested : picked;
  const topic = TOPICS.find((t) => t.id === id);

  const pick = (t: string | null) => { stopSpeaking(); setPicked(t); setStep(0); };

  if (!topic) {
    const list = TOPICS.filter((t) => t.label.toLowerCase().includes(q.toLowerCase()));
    return (
      <div className="screen noNav">
        <BackHeader title="First aid" right={<span className="tiny">Stored in the app</span>} />
        <div className="row card flat" style={{ padding: "10px 14px", marginTop: 6 }}><Icon name="search" size={20} /><input className="grow" style={{ border: 0, background: "none", font: "inherit", outline: "none" }} placeholder="What happened? e.g. bleeding" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="stack" style={{ marginTop: 14 }}>
          {list.map((t) => <button key={t.id} className="homecard" onClick={() => pick(t.id)}><div className="ic"><Icon name={t.icon === "bolt" ? "alert" : t.icon === "flask" ? "sparkle" : t.icon === "hand" ? "users" : t.icon} /></div><div className="grow"><div className="t">{t.label}</div><div className="s">{t.steps.length} steps</div></div><span className="chev"><Icon name="chevR" size={20} /></span></button>)}
          {list.length === 0 && <p className="sub">No match. Try a word like bleeding, burn or poison, or call a vet.</p>}
        </div>
        <div className="alertBox" style={{ marginTop: 20, background: "var(--bg2)", color: "var(--ink2)", fontSize: 14 }}>{BITE_NOTE}</div>
        <div style={{ position: "sticky", bottom: 16, marginTop: 20 }}><Link href="/rescue/vets" className="btn danger"><Icon name="phone" size={20} />Call a vet now</Link></div>
        <p className="demoNote" style={{ textAlign: "center", marginTop: 12 }}>General guidance, not veterinary advice · Pending vet review</p>
      </div>
    );
  }

  const s = topic.steps[step];
  const last = step === topic.steps.length - 1;
  return (
    <div className="screen noNav">
      <div className="header">
        <button className="iconbtn" onClick={() => pick(null)} aria-label="All topics"><Icon name="x" size={20} /></button>
        <div className="grow"><div style={{ fontWeight: 600 }}>{topic.label}</div><div className="tiny">Stored in the app</div></div>
        <Link href="/rescue/vets" className="sospill" style={{ fontSize: 13, padding: "8px 12px" }}><Icon name="phone" size={15} />Call a vet</Link>
      </div>
      <div className="row" style={{ gap: 6, margin: "6px 0 20px" }}>{topic.steps.map((_, i) => <div key={i} className="progress grow" style={{ height: 5 }}><i style={{ width: i <= step ? "100%" : "0%" }} /></div>)}</div>
      <div className="stepNum">Step {step + 1} of {topic.steps.length}</div>
      <h1 className="display" style={{ fontSize: 30, margin: "6px 0 18px" }}>{s.title}</h1>
      <div className="doBox">{s.do}</div>
      <div className="notBox">{s.not}</div>
      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn soft grow" onClick={() => speak(`${s.title}. ${s.do} ${s.not.replace("Do NOT", "Do not")}`)}><Icon name="speaker" size={20} />Read aloud</button>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn ghost" style={{ width: 110 }} disabled={step === 0} onClick={() => { stopSpeaking(); setStep(step - 1); }}>Back</button>
        {last ? <Link href="/rescue/vets" className="btn primary grow">Find a vet</Link> : <button className="btn primary grow" onClick={() => { stopSpeaking(); setStep(step + 1); }}>Next step</button>}
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 22 }}>General guidance, not veterinary advice · Pending vet review</p>
    </div>
  );
}
