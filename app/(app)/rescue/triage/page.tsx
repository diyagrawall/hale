"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { Skeleton } from "@/components/ui";
import { caseNumber, setSuggestedTopic, useActiveCase } from "@/lib/session";
import { buildTriage } from "@/lib/triage";
import { topicFor } from "@/lib/firstaid";

export default function Triage() {
  const router = useRouter();
  const c = useActiveCase();
  const [breath, setBreath] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [why, setWhy] = useState(false);
  const [look, setLook] = useState(false);
  const [toast, setToast] = useState(false);

  if (c === undefined) return <div className="screen noNav"><div className="stack"><Skeleton h={120} /><Skeleton h={200} /></div></div>;
  if (!c) return (
    <div className="screen noNav"><div className="card" style={{ marginTop: 40, textAlign: "center" }}><h1 className="h2">No report yet</h1><p className="sub">Tell us what you see and we will help.</p><Link href="/rescue/sos" className="btn primary" style={{ marginTop: 14 }}>Report an animal</Link></div></div>
  );

  const calm = c.mode === "check";
  const r = buildTriage(c.text, c.ai);
  const num = caseNumber(c.text);

  if (r.status === "needs_info") {
    return (
      <div className="screen noNav">
        <div className="header"><Link href={calm ? "/rescue/check" : "/rescue/sos"} className="iconbtn" aria-label="Back"><Icon name="chevL" /></Link><div className="grow" /></div>
        <h1 className="display" style={{ fontSize: 28 }}>We need a bit more</h1>
        <div className="stack" style={{ marginTop: 18 }}>
          {r.missing.includes("what") && <div className="card">What happened to the animal? For example: bleeding, can&apos;t walk. Hale is for injured or sick animals.</div>}
          {r.missing.includes("where") && <div className="card">{r.heardLocation ? `We couldn't find "${r.heardLocation}" on our demo map. ` : "We couldn't find a place in your message. "}Name a nearby area or landmark, for example Baner, Aundh, Kothrud or Hadapsar.</div>}
          {c.aiProblem && <div className="card flat sub">{c.aiProblem} The danger-word rule still checked your text.</div>}
          <p className="tiny">We won&apos;t guess. Add the details and send again.</p>
          <Link href={calm ? "/rescue/check" : "/rescue/sos"} className="btn primary">Add details</Link>
        </div>
      </div>
    );
  }

  const { card, flags } = r;
  const critical = card.urgency === "critical";
  const urgent = card.urgency === "urgent";
  const danger = critical || flags.length > 0;
  const topic = topicFor(flags, card.injury);
  const headline = danger ? "Go to a vet now" : urgent ? (calm ? "Please see a vet today" : "Needs a vet today") : calm && card.urgency === "stable" ? "Looks like it can wait" : calm && card.urgency === "unknown" ? "Keep an eye on it" : card.urgency === "stable" ? "Looks stable. Still get it checked" : "Not rated. If in doubt, treat it as urgent";

  return (
    <div className="screen noNav" style={{ paddingTop: 0 }}>
      <div className="header">
        <Link href={calm ? "/rescue/check" : "/rescue/sos"} className="iconbtn" aria-label="Back"><Icon name="chevL" /></Link>
        <div className="grow"><div style={{ fontWeight: 600 }}>{calm ? "Calm check" : `Case ${num}`}</div><div className="tiny">AI is not a vet</div></div>
        <Link href="/home" className="iconbtn" aria-label="Close"><Icon name="x" size={20} /></Link>
      </div>

      {danger ? (
        <div className="alertBox" role="alert">
          <b>Go to a vet now</b>
          <div style={{ marginTop: 4 }}>{flags.length > 0 ? `Danger signs found by a fixed rule: ${flags.join(", ")}.` : "The AI rated this critical from your description."}</div>
        </div>
      ) : (
        <div className="card" style={{ background: calm ? "var(--teal-soft)" : "var(--amber-soft)", boxShadow: "none" }}>
          <div className="h2">{headline}</div>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row">
          {c.thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.thumb} alt="" style={{ width: 64, height: 64, borderRadius: 16, objectFit: "cover" }} />
          )}
          <div className="grow">
            <div className="tiny">What we understood</div>
            <div style={{ fontWeight: 600, fontSize: 18, marginTop: 2 }}>{card.species ? card.species[0].toUpperCase() + card.species.slice(1) : "Animal"} · {card.injury}</div>
            <div className="sub">{card.location}</div>
          </div>
        </div>
        <div className="divider" />
        <div className="row">
          <span className="sub">Urgency</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-serif), Georgia, serif", fontSize: 22, color: critical ? "var(--red)" : urgent ? "var(--amber)" : "var(--teal)" }}>{card.urgency === "unknown" ? "Not rated" : card.urgency[0].toUpperCase() + card.urgency.slice(1)}</span>
        </div>
        {c.aiProblem && <p className="tiny" style={{ marginTop: 10 }}>The AI is unavailable, so this uses the fixed danger-word rule only.</p>}
        <button className="link" style={{ marginTop: 10 }} onClick={() => setLook(!look)}>{look ? "Hide" : "See"} what the AI read</button>
        {look && <div className="sub" style={{ marginTop: 8 }}><b>You sent:</b> “{c.text}”<br /><b>{c.ai ? "AI read:" : "AI unavailable."}</b> {c.ai ? `${c.ai.species ?? "animal not stated"}, ${c.ai.injury ?? "injury not stated"}, ${c.ai.location ?? "place not stated"}.` : (c.aiProblem ?? "")} Not right? Go back and edit.</div>}
      </div>

      {!calm && !(card.urgency === "stable") && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Is it breathing normally?</div>
          <div className="choices">{["Yes", "No", "Not sure"].map((o) => <button key={o} className={`choice ${breath === o ? "on" : ""}`} onClick={() => setBreath(o)}>{o}</button>)}</div>
          {(breath === "No" || breath === "Not sure") && <div className="notBox" style={{ marginTop: 12 }}>Tell the vet first that breathing may be a problem. Keep the head and neck straight.</div>}
        </div>
      )}

      {calm && !danger && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 600 }}>Go to SOS if you see:</div>
          <div className="stack sub" style={{ gap: 6, marginTop: 8 }}>
            <div className="row"><span className="dot" />It stops putting weight on the leg</div>
            <div className="row"><span className="dot" />You see swelling or bleeding</div>
            <div className="row"><span className="dot" />It stops eating or lies down</div>
          </div>
        </div>
      )}

      <div className="stack" style={{ marginTop: 22 }}>
        {calm && !danger && !urgent ? (
          <button className="btn primary" onClick={() => { setToast(true); setTimeout(() => setToast(false), 2200); }}>Remind me in 6 hours</button>
        ) : (
          <button className="btn primary" onClick={() => setSheet(true)}>Get help</button>
        )}
        {calm && <Link href="/rescue/sos" className="link" style={{ textAlign: "center", color: "var(--red)" }}><span className="dot" /> Escalate to SOS</Link>}
        <button className="tiny" style={{ textDecoration: "underline" }} onClick={() => setWhy(!why)}>How was this decided?</button>
        {why && <p className="tiny">Danger words are checked by a fixed rule that works even if the AI is down. The AI reads your words and photo. The rule can raise urgency, never lower it. A vet always decides treatment.</p>}
      </div>
      {toast && <div className="toast">We will remind you in 6 hours (demo)</div>}

      {sheet && (
        <>
          <div className="scrim" onClick={() => setSheet(false)} />
          <div className="sheet">
            <div className="grab" />
            <h2 className="h2" style={{ marginBottom: 14 }}>How can we help?</h2>
            <div className="stack">
              <button className="homecard" onClick={() => { setSuggestedTopic(topic); router.push("/rescue/first-aid"); }}><div className="ic"><Icon name="book" /></div><div className="grow"><div className="t">First aid now</div><div className="s">Steps while you wait or travel</div></div></button>
              <button className="homecard" onClick={() => router.push("/rescue/volunteer")}><div className="ic warm"><Icon name="users" /></div><div className="grow"><div className="t">Get it moved</div><div className="s">A volunteer, an auto or an ambulance</div></div></button>
              <button className="homecard" onClick={() => router.push("/rescue/vets")}><div className="ic blue"><Icon name="vet" /></div><div className="grow"><div className="t">Nearest vets</div><div className="s">Open now, with call and directions</div></div></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
