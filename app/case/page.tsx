import { Suspense } from "react";
import Link from "next/link";
import { decodeCase } from "@/lib/caseLink";
import { verify } from "@/lib/sign";
import { computeFunding, formatRupees } from "@/lib/funding";

type Params = Promise<{ d?: string | string[] }>;

export default function CasePage({ searchParams }: { searchParams: Params }) {
  return (
    <Suspense fallback={<main><p>Loading case…</p></main>}>
      <CaseBody searchParams={searchParams} />
    </Suspense>
  );
}

async function CaseBody({ searchParams }: { searchParams: Params }) {
  const raw = (await searchParams).d;
  const token = Array.isArray(raw) ? raw[0] : raw;
  let payload: string | null = null;
  try {
    payload = token ? verify(token) : null; // an edited link fails this check
  } catch {}
  const c = decodeCase(payload ?? undefined);
  const f = c ? computeFunding(c.estimate, c.contribution) : null;

  if (!c || !f || !f.ok) {
    return (
      <main>
        <h1>Case not found</h1>
        <p>This link is missing or damaged.</p>
        <Link href="/">Report a new case</Link>
      </main>
    );
  }
  return (
    <main>
      <h1>Hale case</h1>
      <p className="demo-note">Simulated clinic confirmation · demo. No real payment happens.</p>
      <div className="panel card">
        <h2>{c.card.species ? `Injured ${c.card.species}` : "Injured stray animal"} near {c.card.location}</h2>
        <dl>
          <dt>Injury</dt><dd>{c.card.injury}</dd>
          <dt>Clinic</dt><dd>{c.clinic}</dd>
          <dt>Estimate</dt><dd>{formatRupees(c.estimate)}</dd>
          <dt>NGO paid</dt><dd>{formatRupees(c.contribution)}</dd>
        </dl>
        <p className="big">{formatRupees(f.gap)} still needed</p>
        <div className="bar" role="progressbar" aria-valuenow={f.progressPct} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${f.progressPct}%` }} />
        </div>
        <p className="muted">{f.progressPct}% of the estimate covered so far</p>
      </div>
      <div className="panel">
        <h2>Why we are asking</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{c.appeal}</p>
      </div>
      <p><Link href="/">Report a new case</Link></p>
    </main>
  );
}
