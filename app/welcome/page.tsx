"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { Scene } from "@/components/Art";
import { useHale, type Persona } from "@/lib/store";

const ROLES: { id: Persona; icon: string; title: string; sub: string }[] = [
  { id: "finder", icon: "pin", title: "I found an animal", sub: "A hurt stray, on the street" },
  { id: "owner", icon: "paw", title: "I have a pet", sub: "Care, reminders and emergencies" },
  { id: "ngo", icon: "home2", title: "I run a rescue or NGO", sub: "Cases, volunteers and funds" },
];

export default function Welcome() {
  const router = useRouter();
  const { update } = useHale();
  function choose(p: Persona, volunteer = false) {
    update((s) => ({ ...s, persona: p, volunteer: volunteer || s.volunteer }));
    router.push(p === "owner" ? "/onboarding/pet" : "/home");
  }
  return (
    <div className="phone">
      <div className="screen noNav" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <div style={{ paddingTop: 22 }}><span className="demoNote" style={{ background: "var(--bg2)", padding: "5px 11px", borderRadius: 999 }}>Demo</span></div>
        <div style={{ marginTop: 18 }}><Scene kind="welcome" height={176} /></div>
        <h1 className="display" style={{ marginTop: 24 }}>Who are you?</h1>
        <p className="lead">You can change this later. Everything stays available to everyone.</p>
        <div className="stack" style={{ marginTop: 28 }}>
          {ROLES.map((r) => (
            <button key={r.id} className="homecard" onClick={() => choose(r.id)} style={{ padding: "20px 18px" }}>
              <div className="ic"><Icon name={r.icon} size={24} /></div>
              <div className="grow"><div className="t">{r.title}</div><div className="s">{r.sub}</div></div>
              <span className="chev"><Icon name="chevR" size={20} /></span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "center", paddingBottom: 12 }} className="stack">
          <Link href="/rescue/sos" className="link" style={{ color: "var(--red)" }}><span className="dot" /> Animal hurt right now? Skip to SOS</Link>
          <button className="sub" onClick={() => choose("finder", true)} style={{ textDecoration: "underline" }}>Join as volunteer</button>
        </div>
      </div>
    </div>
  );
}
