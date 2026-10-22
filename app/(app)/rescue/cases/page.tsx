"use client";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { BackHeader, Toast } from "@/components/ui";
import { NGO_CASES, SHELTERS, VOLUNTEERS } from "@/lib/seed";
import { rankVolunteers } from "@/lib/volunteers";

type Tab = "Cases" | "Volunteers" | "Shelter";
const TABS: Tab[] = ["Cases", "Volunteers", "Shelter"];

export default function Cases() {
  const [tab, setTab] = useState<Tab>("Cases");
  const [open, setOpen] = useState<(typeof NGO_CASES)[number] | null>(null);
  const [path, setPath] = useState("vet");
  const [merged, setMerged] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ranked = useMemo(() => rankVolunteers(VOLUNTEERS, { skills: ["Bleeding", "Lifting"] }), []);
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2600); };
  const col = (u: string) => (u === "Critical" ? "var(--red)" : "var(--amber)");

  return (
    <div className="screen">
      <BackHeader title="Live cases" />
      <p className="sub" style={{ marginBottom: 10 }}>{NGO_CASES.length} open · {NGO_CASES.filter((c) => c.urgency === "Critical").length} critical · sorted by urgency, then by wait</p>
      <div className="choices" style={{ marginBottom: 16 }}>{TABS.map((t) => <button key={t} className={`choice ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === "Cases" && (
        <div className="stack">
          {NGO_CASES.map((c) => (
            <button key={c.id} className="card" style={{ textAlign: "left" }} onClick={() => { setOpen(c); setMerged(false); setPath("vet"); }}>
              <div className="row"><b style={{ color: col(c.urgency) }}>{c.urgency}</b><span className="tiny" style={{ marginLeft: "auto" }}>{c.age}</span></div>
              <div style={{ fontWeight: 600, fontSize: 17, margin: "4px 0 2px" }}>{c.title}</div>
              <div className="sub">{c.place} · {c.km} km</div>
              <div className="sub" style={{ marginTop: 6, color: c.assigned === "Unassigned" ? "var(--red)" : "var(--teal)", fontWeight: 600 }}>{c.assigned}</div>
            </button>
          ))}
        </div>
      )}

      {tab === "Volunteers" && (
        <div className="stack">
          {ranked.map((v) => (
            <div key={v.id} className="card row">
              <div className="ic" style={{ width: 46, height: 46, borderRadius: 16, background: "var(--teal-soft)", color: "var(--teal)", display: "grid", placeItems: "center", fontWeight: 700 }}>{v.name.split(" ").map((x) => x[0]).join("")}</div>
              <div className="grow"><div style={{ fontWeight: 600 }}>{v.name}</div><div className="sub">{v.area} · {v.vehicle}{v.carrier ? " · carrier" : ""}</div><div className="tiny">{v.skills.join(", ")} · {v.lessons}/6 lessons</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontWeight: 600, color: v.free ? "var(--teal)" : "var(--ink3)", fontSize: 14 }}>{v.free ? "Free now" : "Busy"}</div><div className="tiny">{v.verified ? "Verified" : "To verify"}</div></div>
            </div>
          ))}
          <button className="btn soft" onClick={() => say("Invite link copied (demo)")}><Icon name="plus" size={18} />Invite a volunteer</button>
        </div>
      )}

      {tab === "Shelter" && (
        <div className="stack">
          <p className="sub">8 places free across Pune. Updated by each shelter.</p>
          {SHELTERS.map((s) => (
            <div key={s.id} className="card">
              <div className="row"><div className="grow"><div style={{ fontWeight: 600 }}>{s.name}</div><div className="tiny">{s.km} km · updated {s.updated}</div></div><b style={{ color: s.free ? "var(--teal)" : "var(--red)" }}>{s.free ? `${s.free} of ${s.total} free` : "Full"}</b></div>
              <div className="progress" style={{ margin: "10px 0 12px" }}><i style={{ width: `${((s.total - s.free) / s.total) * 100}%`, background: s.free ? "var(--teal)" : "var(--red)" }} /></div>
              <button className="btn soft sm" onClick={() => say(s.free ? `Space requested at ${s.name} (demo)` : `Added to the waitlist at ${s.name} (demo)`)}>{s.free ? "Request space" : "Waitlist"}</button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <>
          <div className="scrim" onClick={() => setOpen(null)} />
          <div className="sheet">
            <div className="grab" />
            <div className="row"><b style={{ color: col(open.urgency) }}>{open.urgency}</b><span className="tiny">· {open.age} ago · {open.assigned}</span></div>
            <h2 className="h2" style={{ margin: "6px 0" }}>{open.title}</h2>
            <div className="sub">{open.place} · {open.km} km</div>
            {open.duplicate && !merged && (
              <div className="card" style={{ background: "var(--amber-soft)", boxShadow: "none", marginTop: 14 }}>
                <div style={{ fontWeight: 600 }}>Possible duplicate of PN-2417</div>
                <div className="sub">80 m apart, 4 minutes apart, both a brown dog with a back-leg injury. AI match, you decide.</div>
                <div className="row" style={{ marginTop: 10 }}><button className="btn sm primary" onClick={() => setMerged(true)}>Merge into this case</button><button className="btn sm ghost" onClick={() => setMerged(true)}>Keep separate</button></div>
              </div>
            )}
            <div className="sectionTitle" style={{ margin: "18px 0 8px" }}>AI suggests · you decide</div>
            <div className="stack" style={{ gap: 8 }}>
              {[{ id: "vet", t: "Vet now", s: open.urgency === "Critical" ? "Danger signs by fixed rule. Sahyadri 24/7 is 4.7 km away." : "Needs a vet today." }, { id: "vol", t: "Send a volunteer", s: "Closest helper brings a carrier." }, { id: "aid", t: "First aid and monitor", s: "Only if it looks stable." }].map((o) => (
                <button key={o.id} className="card flat row" style={{ textAlign: "left", outline: path === o.id ? "2px solid var(--teal)" : "none" }} onClick={() => setPath(o.id)}><div className="grow"><div style={{ fontWeight: 600 }}>{o.t}</div><div className="sub">{o.s}</div></div>{path === o.id && <Icon name="check" size={20} />}</button>
              ))}
            </div>
            <div className="sectionTitle" style={{ margin: "18px 0 8px" }}>Best matches</div>
            <div className="stack" style={{ gap: 8 }}>
              {ranked.slice(0, 2).map((v, i) => <div key={v.id} className="card flat"><div style={{ fontWeight: 600 }}>{i + 1}. {v.name}</div><div className="sub">{v.why}</div></div>)}
            </div>
            <button className="btn primary" style={{ marginTop: 18 }} onClick={() => { setOpen(null); say(`Confirmed: ${path === "vet" ? "vet now" : path === "vol" ? "volunteer" : "first aid"} + asked ${ranked[0].name.split(" ")[0]} (demo)`); }}>Confirm and ask {ranked[0].name.split(" ")[0]}</button>
            <p className="demoNote" style={{ textAlign: "center", marginTop: 8 }}>AI is not a vet. A person always decides.</p>
          </div>
        </>
      )}
      <Toast text={toast} />
    </div>
  );
}
