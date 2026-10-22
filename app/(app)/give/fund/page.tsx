"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/ui";
import { computeFunding, formatRupees, type FundingErrors } from "@/lib/funding";
import { useActiveCase } from "@/lib/session";
import { buildTriage } from "@/lib/triage";

type Ok = Extract<ReturnType<typeof computeFunding>, { ok: true }>;

export default function Fund() {
  const router = useRouter();
  const c = useActiveCase();
  const t = c ? buildTriage(c.text, c.ai) : null;
  const card = t && t.status === "ready" ? t.card : null;

  const [injury, setInjury] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [clinic, setClinic] = useState("");
  const [estimate, setEstimate] = useState("");
  const [contribution, setContribution] = useState("");
  const [errors, setErrors] = useState<FundingErrors & { clinic?: string; what?: string }>({});
  const [funding, setFunding] = useState<Ok | null>(null);
  const [appeal, setAppeal] = useState("");
  const [ready, setReady] = useState(false);
  const [fromAi, setFromAi] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const injuryVal = injury ?? card?.injury ?? "";
  const placeVal = place ?? card?.location ?? "";
  const species = card?.species ?? null;
  const reset = () => { setFunding(null); setAppeal(""); setReady(false); setNotice(""); setErr(""); };

  async function calc() {
    const r = computeFunding(estimate, contribution);
    const e: FundingErrors & { clinic?: string; what?: string } = r.ok ? {} : { ...r.errors };
    if (!clinic.trim()) e.clinic = "Enter the clinic's name.";
    if (!injuryVal.trim() || !placeVal.trim()) e.what = "Say what happened and where.";
    setErrors(e); reset();
    if (!r.ok || e.clinic || e.what) return;
    setFunding(r); setBusy(true);
    try {
      const res = await fetch("/api/appeal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ card: { species, injury: injuryVal.trim(), location: placeVal.trim(), urgency: card?.urgency ?? "unknown" }, clinic: clinic.trim(), estimate: r.estimate, contribution: r.contribution }) });
      const d = await res.json();
      if (d.ok) { setAppeal(d.appeal); setFromAi(d.source === "ai"); setNotice(d.notice ?? ""); } else setNotice(d.message);
    } catch { setNotice("Couldn't draft the appeal. Write one below."); }
    setReady(true); setBusy(false);
  }
  async function publish() {
    if (!funding) return;
    if (!appeal.trim()) { setErr("The appeal is empty. Write a few lines above first."); return; }
    setErr("");
    try {
      const res = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ card: { species, injury: injuryVal.trim(), location: placeVal.trim(), urgency: card?.urgency ?? "unknown" }, clinic: clinic.trim(), estimate: funding.estimate, contribution: funding.contribution, appeal }) });
      const d = await res.json();
      if (d.ok) router.push(`/case?d=${d.d}`); else setErr(d.message);
    } catch { setErr("Couldn't create the page. Try again."); }
  }
  const edit = (set: (v: string) => void) => (e: { target: { value: string } }) => { set(e.target.value); reset(); };

  return (
    <div className="screen noNav">
      <BackHeader title="Create a campaign" />
      <h1 className="display" style={{ fontSize: 28 }}>From estimate to funding page</h1>
      <p className="lead">The clinic&apos;s number goes in. Hale works out the gap and drafts the appeal.</p>
      <div className="stack" style={{ marginTop: 20 }}>
        <div><label className="label">What happened</label><input className="field" value={injuryVal} onChange={edit(setInjury)} placeholder="Dog hit by a vehicle, broken leg" /></div>
        <div><label className="label">Where</label><input className="field" value={placeVal} onChange={edit(setPlace)} placeholder="Baner" />{errors.what && <p className="tiny" style={{ color: "var(--red)", marginTop: 4 }}>{errors.what}</p>}</div>
        <div><label className="label">Clinic name</label><input className="field" value={clinic} onChange={edit(setClinic)} placeholder="Sahyadri Animal Clinic" />{errors.clinic && <p className="tiny" style={{ color: "var(--red)", marginTop: 4 }}>{errors.clinic}</p>}</div>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div className="grow"><label className="label">Clinic estimate (₹)</label><input className="field" inputMode="numeric" value={estimate} onChange={edit(setEstimate)} placeholder="28500" />{errors.estimate && <p className="tiny" style={{ color: "var(--red)", marginTop: 4 }}>{errors.estimate}</p>}</div>
          <div className="grow"><label className="label">NGO pays (₹)</label><input className="field" inputMode="numeric" value={contribution} onChange={edit(setContribution)} placeholder="5000" />{errors.contribution && <p className="tiny" style={{ color: "var(--red)", marginTop: 4 }}>{errors.contribution}</p>}</div>
        </div>
        {errors.form && <p className="tiny" style={{ color: "var(--red)" }}>{errors.form}</p>}
        <button className="btn primary" onClick={calc} disabled={busy}>{busy ? "Drafting…" : "Calculate gap and draft appeal"}</button>
      </div>

      {funding && (
        <div className="card" style={{ marginTop: 22 }}>
          <div className="tiny">Funding gap</div>
          <div className="display" style={{ fontSize: 38 }}>{formatRupees(funding.gap)}</div>
          <div className="sub">{formatRupees(funding.estimate)} estimate − {formatRupees(funding.contribution)} from the NGO</div>
          {ready && (
            <>
              <div className="divider" />
              <label className="label" htmlFor="appeal">{fromAi ? "Appeal (AI draft: check it before sharing)" : "Appeal (plain template: edit as you like)"}</label>
              {notice && <p className="tiny" style={{ marginBottom: 8 }}>{notice}</p>}
              <textarea id="appeal" className="field" rows={7} value={appeal} onChange={(e) => setAppeal(e.target.value)} />
              {err && <p className="tiny" style={{ color: "var(--red)", marginTop: 6 }}>{err}</p>}
              <button className="btn primary" style={{ marginTop: 14 }} onClick={publish}>Clinic confirmed (simulated): publish</button>
              <p className="demoNote" style={{ textAlign: "center", marginTop: 8 }}>Demo: no real clinic check or payment happens</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
