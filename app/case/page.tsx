import { Suspense } from "react";
import Link from "next/link";
import { decodeCase } from "@/lib/caseLink";
import { computeFunding, formatRupees } from "@/lib/funding";
import { verify } from "@/lib/sign";
import Icon from "@/components/Icon";
import CaseDonate from "@/components/CaseDonate";

export const metadata = { title: "Hale case: funding page" };

type Params = Promise<{ d?: string | string[] }>;

export default function CasePage({ searchParams }: { searchParams: Params }) {
  return (
    <div className="phone">
      <Suspense fallback={<div className="screen noNav"><p className="sub">Loading case…</p></div>}>
        <CaseBody searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CaseBody({ searchParams }: { searchParams: Params }) {
  const raw = (await searchParams).d;
  const token = Array.isArray(raw) ? raw[0] : raw;
  let payload: string | null = null;
  try { payload = token ? verify(token) : null; } catch {}
  const c = decodeCase(payload ?? undefined);
  const f = c ? computeFunding(c.estimate, c.contribution) : null;

  if (!c || !f || !f.ok) {
    return (
      <div className="screen noNav">
        <h1 className="display" style={{ marginTop: 60 }}>Case not found</h1>
        <p className="lead">This link is missing or damaged.</p>
        <Link href="/" className="btn primary" style={{ marginTop: 20 }}>Open Hale</Link>
      </div>
    );
  }
  const who = c.card.species ? `an injured ${c.card.species}` : "an injured animal";
  return (
    <div className="screen noNav">
      <div className="header"><span className="demoNote">hale.app · Demo: payments simulated</span></div>
      <div className="photo" style={{ height: 190, borderRadius: 24 }}><Icon name="paw" size={52} /></div>
      <div className="row" style={{ margin: "14px 0 4px", color: "var(--teal)", fontWeight: 600, fontSize: 14 }}><Icon name="check" size={18} />Clinic confirmed estimate (simulated)</div>
      <h1 className="display" style={{ fontSize: 28 }}>Help {who} near {c.card.location}</h1>
      <p className="sub" style={{ marginTop: 6 }}>{c.card.injury} · {c.clinic}</p>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="display" style={{ fontSize: 40 }}>{formatRupees(f.gap)} <span className="sub" style={{ fontFamily: "var(--font-sans)", fontSize: 16 }}>still needed</span></div>
        <div className="progress" style={{ margin: "12px 0 8px" }} role="progressbar" aria-valuenow={f.progressPct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${f.progressPct}%` }} /></div>
        <div className="sub">{f.progressPct}% of the {formatRupees(f.estimate)} estimate covered so far</div>
        <div className="divider" />
        <div className="row sub"><span className="grow">Clinic estimate</span><b style={{ color: "var(--ink)" }}>{formatRupees(f.estimate)}</b></div>
        <div className="row sub" style={{ marginTop: 6 }}><span className="grow">Paid by the NGO</span><b style={{ color: "var(--ink)" }}>{formatRupees(f.contribution)}</b></div>
      </div>
      <div className="card" style={{ marginTop: 14 }}><div className="tiny" style={{ marginBottom: 6 }}>Why we are asking</div><p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{c.appeal}</p></div>
      <div style={{ marginTop: 14 }}><CaseDonate /></div>
      <p style={{ textAlign: "center", marginTop: 18 }}><Link href="/" className="link">Open Hale</Link></p>
    </div>
  );
}
