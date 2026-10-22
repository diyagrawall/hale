"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { BackHeader, SectionTitle, Skeleton, Toggle } from "@/components/ui";
import { useHale, useNow, type Prefs } from "@/lib/store";
import { buildNotifications } from "@/lib/notifications";

const ICON: Record<string, string> = { health: "vet", food: "bowl", grooming: "scissors", offer: "tag", event: "calendar" };
const CATS: { key: keyof Prefs; label: string }[] = [
  { key: "health", label: "Health reminders" }, { key: "grooming", label: "Grooming" }, { key: "food", label: "Food reorder" },
  { key: "offers", label: "Offers" }, { key: "events", label: "Events" }, { key: "cases", label: "Case updates and donation bar" },
];

export default function Notifications() {
  const { ready, state, update } = useHale();
  const now = useNow();
  const [wed, setWed] = useState(false);
  if (!ready || !now) return <div className="screen"><Skeleton h={90} /></div>;
  const list = buildNotifications(state.pets, state.prefs, now, wed ? 3 : undefined);
  const setPref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => update((s) => ({ ...s, prefs: { ...s.prefs, [k]: v } }));
  return (
    <div className="screen">
      <BackHeader title="Notifications" />
      <div className="card flat row" style={{ marginTop: 6 }}>
        <div className="grow"><div style={{ fontWeight: 600 }}>Demo: preview as a Wednesday</div><div className="sub">Shows how a day-specific offer arrives</div></div>
        <button className={`btn sm ${wed ? "primary" : "soft"}`} onClick={() => setWed(!wed)}>{wed ? "On" : "Off"}</button>
      </div>
      <SectionTitle>For you</SectionTitle>
      <div className="stack" style={{ gap: 10 }}>
        {list.length === 0 && <div className="card sub">Nothing right now. Add a pet to get reminders.{!state.pets.length && <Link href="/onboarding/pet" className="link" style={{ display: "block", marginTop: 8 }}>Add a pet</Link>}</div>}
        {list.map((n) => (
          <Link key={n.id} href={n.href} className="card row" style={n.priority === 1 ? { borderLeft: "4px solid var(--amber)" } : undefined}>
            <div className="ic homecard" style={{ width: 44, height: 44, padding: 0, justifyContent: "center", boxShadow: "none", background: n.kind === "offer" ? "var(--amber-soft)" : "var(--teal-soft)", color: n.kind === "offer" ? "var(--amber)" : "var(--teal)", borderRadius: 14 }}><Icon name={ICON[n.kind]} /></div>
            <div className="grow"><div style={{ fontWeight: 600 }}>{n.title}</div><div className="sub">{n.body}</div></div>
          </Link>
        ))}
      </div>
      <SectionTitle>What you want to hear about</SectionTitle>
      <div className="card">
        {CATS.map((c, i) => <div key={c.key}>{i > 0 && <div className="divider" style={{ margin: "2px 0" }} />}<Toggle label={c.label} on={state.prefs[c.key] as boolean} onChange={(v) => setPref(c.key, v as never)} /></div>)}
        <div className="divider" />
        <div className="row"><div className="grow"><div style={{ fontWeight: 600 }}>Offers per week</div><div className="sub">Health reminders always come first</div></div>
          <button className="iconbtn" onClick={() => setPref("offersPerWeek", Math.max(0, state.prefs.offersPerWeek - 1))} aria-label="Fewer">−</button>
          <b style={{ width: 20, textAlign: "center" }}>{state.prefs.offersPerWeek}</b>
          <button className="iconbtn" onClick={() => setPref("offersPerWeek", Math.min(7, state.prefs.offersPerWeek + 1))} aria-label="More"><Icon name="plus" size={18} /></button></div>
        <div className="divider" />
        <div className="row"><div className="grow"><div style={{ fontWeight: 600 }}>Quiet hours</div><div className="sub">No offers between {state.prefs.quietFrom} and {state.prefs.quietTo}</div></div></div>
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo: notifications show here. Phone push needs the installed app.</p>
    </div>
  );
}
