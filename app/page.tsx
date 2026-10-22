"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkRedFlags } from "@/lib/redFlags";
import { buildTriage, type TriageResult } from "@/lib/triage";
import { describeHours, istMinutesNow, nearestOpenVets } from "@/lib/vets";
import { computeFunding, formatRupees, type FundingErrors } from "@/lib/funding";
import type { AiCase } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sent, setSent] = useState("");
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState<string[]>([]);
  const [aiProblem, setAiProblem] = useState<string | null>(null);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [emptyMsg, setEmptyMsg] = useState("");

  const [clinic, setClinic] = useState("");
  const [estimate, setEstimate] = useState("");
  const [contribution, setContribution] = useState("");
  const [errors, setErrors] = useState<FundingErrors>({});
  const [clinicErr, setClinicErr] = useState("");
  const [funding, setFunding] = useState<Extract<ReturnType<typeof computeFunding>, { ok: true }> | null>(null);
  const [appeal, setAppeal] = useState("");
  const [appealNotice, setAppealNotice] = useState("");
  const [appealFromAi, setAppealFromAi] = useState(false);
  const [shareError, setShareError] = useState("");
  const [appealLoading, setAppealLoading] = useState(false);

  async function report() {
    const t = text.trim();
    if (!t) {
      setEmptyMsg("Describe what happened and where, for example: dog bleeding near Govindpuri metro.");
      setTriage(null);
      setFlags([]);
      setFunding(null);
      setAppeal("");
      setAiProblem(null);
      return;
    }
    setEmptyMsg("");
    setSent(t);
    setTriage(null);
    setFunding(null);
    setAppeal("");
    setAiProblem(null);
    setFlags(checkRedFlags(t).matched); // instant, plain code: shows before the AI answers
    setLoading(true);
    let ai: AiCase | null = null;
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (data.ok) ai = data.ai;
      else setAiProblem(data.message);
    } catch {
      setAiProblem("Couldn't reach the server, so the AI wasn't used.");
    }
    setTriage(buildTriage(t, ai));
    setLoading(false);
  }

  const card = triage?.status === "ready" ? triage.card : null;
  const vets = triage?.status === "ready" ? nearestOpenVets(triage.landmark, istMinutesNow()) : [];

  async function getFunding() {
    if (!card) return;
    setClinicErr("");
    const r = computeFunding(estimate, contribution);
    setErrors(r.ok ? {} : r.errors);
    setFunding(null);
    setAppeal("");
    if (!clinic.trim()) setClinicErr("Enter the clinic's name.");
    if (!r.ok || !clinic.trim()) return;
    setFunding(r);
    setAppealLoading(true);
    setAppealNotice("");
    try {
      const res = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, clinic: clinic.trim(), estimate: r.estimate, contribution: r.contribution }),
      });
      const data = await res.json();
      if (data.ok) {
        setAppeal(data.appeal);
        setAppealFromAi(data.source === "ai");
        setAppealNotice(data.notice ?? "");
      } else setAppealNotice(data.message);
    } catch {
      setAppealNotice("Couldn't draft the appeal. Write one below.");
    }
    setAppealLoading(false);
  }

  async function confirm() {
    if (!card || !funding || !appeal.trim()) return;
    setShareError("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, clinic: clinic.trim(), estimate: funding.estimate, contribution: funding.contribution, appeal }),
      });
      const data = await res.json();
      if (data.ok) router.push(`/case?d=${data.d}`);
      else setShareError(data.message);
    } catch {
      setShareError("Couldn't create the case page. Try again.");
    }
  }

  return (
    <main>
      <h1>Hale</h1>
      <p className="muted">Report an injured stray in one message.</p>
      <p className="demo-note">Prototype. Vet clinics and places are made-up demo data, not real.</p>

      <div className="panel">
        <label htmlFor="report" style={{ marginTop: 0 }}>What happened, and where?</label>
        <textarea id="report" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="dog bleeding near Govindpuri metro, can't stand" />
        {emptyMsg && <p className="error">{emptyMsg}</p>}
        <button onClick={report} disabled={loading}>{loading ? "Reading…" : "Report"}</button>
      </div>

      {flags.length > 0 && (
        <div className="alert" role="alert">
          <strong>Go to a vet now</strong>
          Safety rule triggered by your words: {flags.join(", ")}.
        </div>
      )}

      {aiProblem && <p className="notice">{aiProblem} The red-flag safety rule still checked your text.</p>}

      {triage?.status === "needs_info" && (
        <div className="panel">
          <h2>We need a bit more</h2>
          {triage.missing.includes("what") && (
            <p>
              What happened to the animal? (for example: bleeding, can&apos;t walk) Hale is for injured or sick animals, so if
              this one looks fine, there is nothing to report.
            </p>
          )}
          {triage.missing.includes("where") && (
            <p>
              {triage.heardLocation
                ? `We couldn't find "${triage.heardLocation}" on our demo map. `
                : "We couldn't find a place in your message. "}
              Name a nearby landmark, area or metro station in Delhi, for example Govindpuri metro, Hauz Khas, Dwarka, Karol Bagh or Laxmi Nagar.
            </p>
          )}
          <p className="muted">We won&apos;t guess. Add the details above and press Report again.</p>
        </div>
      )}

      {card && triage?.status === "ready" && (
        <>
          <div className="panel card">
            <h2>Case card</h2>
            <p className="muted">{aiProblem ? "Read by plain code only (AI unavailable)." : "Read by AI from your message. Check it against what you typed:"} “{sent}”</p>
            <dl>
              <dt>Species</dt><dd>{card.species ?? "Not stated"}</dd>
              <dt>Injury</dt><dd>{card.injury}</dd>
              <dt>Location</dt><dd>{card.location}</dd>
              <dt>Urgency</dt>
              <dd><span className={`badge ${card.urgency}`}>{card.urgency === "unknown" ? "Not rated" : card.urgency.toUpperCase()}</span></dd>
            </dl>
          </div>

          <div className="panel">
            <h2>3 nearest vets open now (demo data)</h2>
            {vets.length === 0 && <p>No demo vets are open right now. Call a vet directly.</p>}
            {vets.map((v) => (
              <div className="vet" key={v.id}>
                <strong>{v.name}</strong>
                <div className="muted">{v.distanceKm.toFixed(1)} km away · {describeHours(v)}</div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2>Fund the treatment</h2>
            <label htmlFor="clinic">Clinic name</label>
            <input id="clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Demo Vet 24x7 – Govindpuri" />
            {clinicErr && <p className="error">{clinicErr}</p>}
            <label htmlFor="est">Clinic estimate (₹)</label>
            <input id="est" inputMode="numeric" value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="8000" />
            {errors.estimate && <p className="error">{errors.estimate}</p>}
            <label htmlFor="con">NGO contribution (₹)</label>
            <input id="con" inputMode="numeric" value={contribution} onChange={(e) => setContribution(e.target.value)} placeholder="2000" />
            {errors.contribution && <p className="error">{errors.contribution}</p>}
            {errors.form && <p className="error">{errors.form}</p>}
            <button onClick={getFunding} disabled={appealLoading}>Calculate gap and draft appeal</button>

            {funding && (
              <>
                <p className="big">Funding gap: {formatRupees(funding.gap)}</p>
                {appealLoading && <p className="muted">Drafting appeal…</p>}
                {appealNotice && <p className="notice">{appealNotice}</p>}
                {appeal && (
                  <>
                    <label htmlFor="appeal">{appealFromAi ? "Appeal (AI draft: check it before sharing, you can edit)" : "Appeal (plain template, not AI: you can edit)"}</label>
                    <textarea id="appeal" rows={6} value={appeal} onChange={(e) => setAppeal(e.target.value)} />
                    <button onClick={confirm}>Clinic confirmed (simulated)</button>
                    {shareError && <p className="error">{shareError}</p>}
                    <p className="muted">Simulated for the demo. No real clinic check or payment happens.</p>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}
