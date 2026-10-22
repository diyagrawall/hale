"use client";
import { useState } from "react";
import { BackHeader, Skeleton, Toast } from "@/components/ui";
import { EVENTS } from "@/lib/seed";
import { useNow } from "@/lib/store";
import { addDays } from "@/lib/reminders";

const KINDS = ["All", "Vaccination camp", "Adoption drive", "Meetup", "Expo"];

export default function Events() {
  const now = useNow();
  const [kind, setKind] = useState("All");
  const [going, setGoing] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  if (!now) return <div className="screen"><Skeleton h={90} /></div>;
  const list = EVENTS.filter((e) => kind === "All" || e.kind === kind);
  return (
    <div className="screen">
      <BackHeader title="Events nearby" />
      <div className="choices" style={{ margin: "6px 0 16px" }}>{KINDS.map((k) => <button key={k} className={`choice ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>{k === "All" ? "All" : k + "s"}</button>)}</div>
      <div className="stack">
        {list.map((e) => (
          <div key={e.id} className="card">
            <div className="tiny">{addDays(now, e.inDays).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {e.time}</div>
            <div style={{ fontWeight: 600, fontSize: 17, margin: "4px 0" }}>{e.title}</div>
            <div className="sub">{e.place} · {e.km} km · by {e.host}{e.free ? " · Free" : ""}</div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className={`btn sm ${going.includes(e.id) ? "primary" : "soft"}`} onClick={() => { setGoing((g) => (g.includes(e.id) ? g.filter((x) => x !== e.id) : [...g, e.id])); setToast(going.includes(e.id) ? "RSVP removed" : "You are going. Added to calendar (demo)"); setTimeout(() => setToast(null), 2200); }}>{going.includes(e.id) ? "Going ✓" : "I'm going"}</button>
            </div>
          </div>
        ))}
      </div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo events</p>
      <Toast text={toast} />
    </div>
  );
}
