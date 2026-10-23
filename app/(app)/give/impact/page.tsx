"use client";
import { BackHeader, Skeleton } from "@/components/ui";
import { Pic, kindFor, type Coat } from "@/components/Art";
import { CASES, money } from "@/lib/seed";
import { groupRef } from "@/lib/payments";
import { useHale } from "@/lib/store";

export default function Impact() {
  const { ready, state } = useHale();
  if (!ready) return <div className="screen"><Skeleton h={160} /></div>;
  const mine = CASES.filter((c) => (state.raised[c.id] ?? 0) > 0);
  return (
    <div className="screen">
      <BackHeader title="My impact" />
      <div className="herocard" style={{ marginTop: 8 }}>
        <div className="s">You have given</div>
        <div className="display" style={{ color: "#fff", fontSize: 40 }}>{money(state.given)}</div>
        <div className="s" style={{ marginTop: 6 }}>{state.helped} {state.helped === 1 ? "animal" : "animals"} helped{state.sponsor && !state.sponsor.paused ? ` · ${money(state.sponsor.amount)} a month` : ""}</div>
      </div>
      <div className="sectionTitle">Updates from cases you supported</div>
      <div className="stack">
        {mine.length === 0 && <div className="card sub">When you give, updates and photos from the case will appear here.</div>}
        {mine.map((c) => (
          <div key={c.id} className="card">
            <div className="row"><Pic kind={kindFor(c.species)} coat={c.coat as Coat} tone={c.tone} size={48} radius={14} /><div className="grow"><div style={{ fontWeight: 600 }}>{c.name}</div><div className="sub">You gave {money(state.raised[c.id])}</div></div></div>
            <div className="stack sub" style={{ gap: 6, marginTop: 10 }}>{c.updates.map((u) => <div key={u} className="row"><span className="dot teal" />{u}</div>)}</div>
          </div>
        ))}
      </div>
      {state.receipts.length > 0 && (
        <>
          <div className="sectionTitle">Payment receipts</div>
          <div className="stack" style={{ gap: 10 }}>
            {[...state.receipts].reverse().map((r) => (
              <div key={r.id} className="card">
                <div className="row"><div className="grow"><div style={{ fontWeight: 600 }}>{r.payee}</div><div className="sub">{r.note}</div><div className="tiny">UPI ref {groupRef(r.ref)}</div></div><b>{money(r.amount)}</b></div>
              </div>
            ))}
          </div>
        </>
      )}
      <button className="btn soft" style={{ marginTop: 18 }} onClick={async () => { try { await navigator.clipboard.writeText(`I helped ${state.helped} animals on Hale: hale.app`); } catch {} }}>Share my impact</button>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 14 }}>Demo data</p>
    </div>
  );
}
