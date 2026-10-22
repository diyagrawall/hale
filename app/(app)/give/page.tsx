"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import CaseSheet from "@/components/CaseSheet";
import { HomeCard, SectionTitle, Skeleton, Toast, Toggle } from "@/components/ui";
import { CASES, money, type CaseItem } from "@/lib/seed";
import { useHale } from "@/lib/store";

export default function Give() {
  const { ready, state, update } = useHale();
  const [open, setOpen] = useState<CaseItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  if (!ready) return <div className="screen"><Skeleton h={120} /></div>;
  const ngo = state.persona === "ngo";

  const cases = (
    <>
      <SectionTitle>{ngo ? "Active appeals" : "Cases to support"}</SectionTitle>
      <div className="stack">
        {CASES.map((c, i) => {
          const raised = c.raised + (state.raised[c.id] ?? 0);
          const pct = Math.min(100, Math.round((raised / c.goal) * 100));
          return (
            <button key={c.id} className="card" style={{ textAlign: "left" }} onClick={() => setOpen(c)}>
              <div className="row">
                <div className={`photo ${c.tone === "p1" ? "" : c.tone}`} style={{ width: 64, height: 64 }}><Icon name="paw" size={26} /></div>
                <div className="grow"><div style={{ fontWeight: 600, fontSize: 17 }}>{c.name}: {c.title}</div><div className="sub">{c.place} · {c.clinic}</div></div>
              </div>
              <div className="progress" style={{ margin: "14px 0 8px" }}><i style={{ width: `${pct}%` }} /></div>
              <div className="row"><b>{money(Math.max(c.goal - raised, 0))}</b><span className="sub">still needed</span><span className="tiny" style={{ marginLeft: "auto" }}>{c.donors + (state.raised[c.id] ? 1 : 0)} people</span></div>
              {i === 0 && <div className="tiny" style={{ marginTop: 6 }}>Verified by clinic · Demo</div>}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="screen">
      <h1 className="display">Give</h1>
      <p className="lead">Every rupee goes straight to the treating clinic.</p>

      {ngo && (
        <div className="herocard" style={{ marginTop: 18 }}>
          <div className="s">Emergency pool</div>
          <div className="display" style={{ color: "#fff", fontSize: 36, marginTop: 4 }}>{money(48200)}</div>
          <div className="s" style={{ marginTop: 6 }}>Pays clinics right away, refilled as gifts arrive.</div>
          <div className="row" style={{ marginTop: 16 }}>
            <Link href="/give/fund" className="btn light grow">Create a campaign</Link>
            <button className="btn sm" style={{ color: "#fff", background: "rgba(255,255,255,.14)" }} onClick={() => { setToast("Paid Sahyadri ₹14,500 from the pool (demo)"); setTimeout(() => setToast(null), 2600); }}>Pay clinic</button>
          </div>
        </div>
      )}

      {!ngo && cases}
      <SectionTitle>More ways to help</SectionTitle>
      <div className="stack">
        <HomeCard icon="heart" title="Sponsor a rescue monthly" status={state.sponsor ? `${money(state.sponsor.amount)} a month · ${state.sponsor.paused ? "paused" : "active"}` : "Steady help for strays"} href="/give/sponsor" />
        <HomeCard icon="trend" title="My impact" status={`${money(state.given)} given · ${state.helped} animals helped`} href="/give/impact" />
        <div className="card"><Toggle label="Round up my orders" sub="Add ₹20 at checkout to help a rescue" on={state.prefs.roundUp} onChange={(v) => update((s) => ({ ...s, prefs: { ...s.prefs, roundUp: v } }))} /></div>
      </div>
      {ngo && cases}
      <p className="demoNote" style={{ textAlign: "center", marginTop: 18 }}>Demo: cases verified by clinics (simulated) · payments simulated</p>
      {open && <CaseSheet item={open} onClose={() => setOpen(null)} />}
      <Toast text={toast} />
    </div>
  );
}
