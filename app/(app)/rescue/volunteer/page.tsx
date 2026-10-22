"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { BackHeader } from "@/components/ui";
import { VOLUNTEERS } from "@/lib/seed";
import { rankVolunteers } from "@/lib/volunteers";
import { caseNumber, useActiveCase } from "@/lib/session";
import { buildTriage } from "@/lib/triage";

type Stage = "options" | "searching" | "accepted";
const STEPS = ["Reported", "On the way", "At the animal", "At the clinic", "Treated", "Recovering"];
type Msg = { from: "them" | "me"; text: string; original?: string };

export default function Volunteer() {
  const c = useActiveCase();
  const [stage, setStage] = useState<Stage>("options");
  const [mode, setMode] = useState<"volunteer" | "auto" | "ambulance">("volunteer");
  const [progress, setProgress] = useState(1);
  const [brief, setBrief] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const triage = useMemo(() => (c ? buildTriage(c.text, c.ai) : null), [c]);
  const card = triage && triage.status === "ready" ? triage.card : null;
  const ranked = useMemo(() => rankVolunteers(VOLUNTEERS, { skills: card ? [card.injury.includes("bleed") ? "Bleeding" : "Lifting", "Lifting"] : ["Lifting"] }), [card]);
  const top = ranked[0];
  const num = c ? caseNumber(c.text) : "PN-2418";

  const species = card?.species ?? "Dog", injury = card?.injury ?? "hurt and needs help", place = card?.location ?? "Baner";
  useEffect(() => {
    let alive = true;
    fetch("/api/volunteer-brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ species, injury, place, urgency: card?.urgency }) })
      .then((r) => r.json()).then((d) => alive && setBrief(d.brief)).catch(() => alive && setBrief(`${species}: ${injury}. Near ${place}. Bring a towel, a carrier and gloves.`));
    return () => { alive = false; };
  }, [species, injury, place, card?.urgency]);

  useEffect(() => {
    if (stage !== "searching") return;
    const t = setTimeout(() => {
      setStage("accepted");
      setMsgs([{ from: "them", text: "Don't move the dog, keep pressing the wound.", original: "कुत्त्याला हलवू नका, दाबून ठेवा." }]);
    }, 3200);
    return () => clearTimeout(t);
  }, [stage]);

  const link = `hale.app/t/${num}`;
  const share = async () => {
    const text = `Live location for ${num}: ${link}`;
    try { if (navigator.share) { await navigator.share({ text }); return; } await navigator.clipboard.writeText(text); setToast("Link copied (demo)"); } catch { setToast("Copy: " + link); }
    setTimeout(() => setToast(null), 2200);
  };
  const send = (t: string) => { if (!t.trim()) return; setMsgs((m) => [...m, { from: "me", text: t.trim() }]); setDraft(""); };

  if (stage === "options") {
    const opts = [
      { id: "volunteer" as const, icon: "users", title: "Volunteer", sub: `Verified by local NGOs · ${top.name.split(" ")[0]} is ${top.km} km away`, price: "Free", rec: true },
      { id: "auto" as const, icon: "truck", title: "Auto or cab", sub: "Animal-friendly drivers", price: "₹80–150" },
      { id: "ambulance" as const, icon: "vet", title: "Animal ambulance (Demo)", sub: "Stretcher and oxygen", price: "₹400–600" },
    ];
    return (
      <div className="screen noNav">
        <BackHeader title="Get it moved" />
        <h1 className="display" style={{ fontSize: 28 }}>Who should come?</h1>
        <p className="lead">We alert the closest helpers first. Your exact spot is shared only after someone accepts.</p>
        <div className="stack" style={{ marginTop: 18 }}>
          {opts.map((o) => (
            <button key={o.id} className="homecard" onClick={() => setMode(o.id)} style={{ outline: mode === o.id ? "2px solid var(--teal)" : "none" }}>
              <div className="ic"><Icon name={o.icon} /></div>
              <div className="grow"><div className="t">{o.title}{o.rec && <span className="tiny" style={{ marginLeft: 8, color: "var(--teal)" }}>Recommended</span>}</div><div className="s">{o.sub}</div></div>
              <div style={{ fontWeight: 600 }}>{o.price}</div>
            </button>
          ))}
        </div>
        <div className="card flat" style={{ marginTop: 14 }}>
          <div className="tiny" style={{ marginBottom: 4 }}>Sent to helpers · AI brief</div>
          {brief ? <div>{brief}</div> : <div className="skel" style={{ height: 40 }} />}
        </div>
        <div className="stack" style={{ marginTop: 20 }}>
          <button className="btn primary" onClick={() => setStage("searching")}>Request help</button>
          <Link href="/rescue/first-aid" className="btn ghost">First aid while you wait</Link>
        </div>
        <p className="demoNote" style={{ textAlign: "center", marginTop: 14 }}>Demo: helpers and prices are simulated</p>
      </div>
    );
  }

  if (stage === "searching") {
    return (
      <div className="screen noNav" style={{ textAlign: "center" }}>
        <BackHeader title="Finding help" />
        <div className="sosBtnWrap" style={{ margin: "60px auto 30px", width: 130, height: 130 }}><span className="sosBtn" style={{ width: 96, height: 96, background: "var(--teal)", color: "#fff", boxShadow: "none" }}><Icon name="users" size={34} /></span></div>
        <h1 className="display" style={{ fontSize: 26 }}>Finding help near you…</h1>
        <p className="lead">Asked {ranked.filter((v) => v.free).length + 4} helpers within 3 km</p>
        <p className="tiny" style={{ marginTop: 10 }}>If no one accepts in 3 minutes we widen the search to 6 km and alert Paws Pune Trust.</p>
        <div className="stack" style={{ marginTop: 40 }}>
          <Link href="/rescue/first-aid" className="btn soft">First aid meanwhile</Link>
          <button className="btn ghost" onClick={() => setStage("options")}>Cancel request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen noNav">
      <BackHeader title={`Case ${num}`} right={<span className="tiny">AI is not a vet</span>} />
      <div className="card">
        <div className="tiny">{mode === "volunteer" ? `${top.name.split(" ")[0]} accepted` : mode === "auto" ? "Driver accepted" : "Ambulance on the way"}</div>
        <div className="display" style={{ fontSize: 36 }}>{progress >= 3 ? "With the animal" : "7 min away"}</div>
        <div className="row" style={{ marginTop: 12 }}>
          <div className="ic" style={{ width: 46, height: 46, borderRadius: 16, background: "var(--teal-soft)", color: "var(--teal)", display: "grid", placeItems: "center", fontWeight: 700 }}>{top.name.split(" ").map((x) => x[0]).join("")}</div>
          <div className="grow"><div style={{ fontWeight: 600 }}>{mode === "volunteer" ? top.name : mode === "auto" ? "Santosh (auto)" : "Karuna ambulance"}</div><div className="sub">{mode === "volunteer" ? `Verified · ${top.vehicle}${top.carrier ? " · carrier" : ""} · free` : "Demo · fare shown before the ride"}</div></div>
          <a href="tel:+910000000000" className="iconbtn" aria-label="Call"><Icon name="phone" /></a>
        </div>
        <div className="divider" />
        <div className="row" style={{ gap: 4 }}>
          {STEPS.map((s, i) => <div key={s} className="grow" style={{ textAlign: "center" }}><div className="progress" style={{ height: 5 }}><i style={{ width: i < progress ? "100%" : "0%" }} /></div><div className="tiny" style={{ marginTop: 5, fontSize: 10, color: i < progress ? "var(--teal)" : "var(--ink3)" }}>{s}</div></div>)}
        </div>
        <button className="link" style={{ marginTop: 12 }} onClick={() => setProgress((p) => Math.min(p + 1, STEPS.length))}>Demo control: next stage →</button>
      </div>

      <div className="card flat row" style={{ marginTop: 14 }}>
        <Icon name="share" size={20} /><div className="grow"><div style={{ fontWeight: 600 }}>Share live location</div><div className="tiny">{link} · works in any browser</div></div>
        <button className="btn sm soft" onClick={share}>Share</button>
      </div>

      {progress >= 4 && <Link href="/give/fund" className="btn soft" style={{ marginTop: 14 }}>Clinic estimate ready: raise funds</Link>}

      <div className="sectionTitle">Case thread</div>
      <div className="stack" style={{ gap: 10 }}>
        {msgs.map((m, i) => <div key={i} className={`bubble ${m.from === "me" ? "me" : ""}`}>{m.text}{m.original && <div className="tiny" style={{ marginTop: 4, color: m.from === "me" ? "rgba(255,255,255,.7)" : undefined }}>Original (मराठी): {m.original} · AI translated</div>}</div>)}
      </div>
      <div className="row" style={{ marginTop: 12, gap: 8, flexWrap: "wrap" }}>
        {["I'm with it", "It moved", "Please call"].map((q) => <button key={q} className="choice" onClick={() => send(q)}>{q}</button>)}
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <input className="field" placeholder="Message in any language" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(draft)} />
        <button className="iconbtn" onClick={() => send(draft)} aria-label="Send"><Icon name="chevR" /></button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
