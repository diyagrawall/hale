"use client";
import Icon from "@/components/Icon";
import { BackHeader, Skeleton } from "@/components/ui";
import { OFFERS } from "@/lib/seed";
import { useNow } from "@/lib/store";

const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

export default function Offers() {
  const now = useNow();
  if (!now) return <div className="screen"><Skeleton h={90} /></div>;
  const dow = now.getDay();
  const today = OFFERS.filter((o) => o.weekday === dow);
  const rest = OFFERS.filter((o) => o.weekday !== dow);
  const card = (o: (typeof OFFERS)[number], hot: boolean) => (
    <div key={o.id} className="card row" style={hot ? { outline: "2px solid var(--amber)" } : undefined}>
      <div className="ic homecard" style={{ width: 46, height: 46, padding: 0, justifyContent: "center", boxShadow: "none", background: "var(--amber-soft)", color: "var(--amber)", borderRadius: 15 }}><Icon name="tag" /></div>
      <div className="grow"><div style={{ fontWeight: 600 }}>{o.title}</div><div className="sub">{o.partner} · {o.kind}{o.weekday !== null ? ` · ${DAYS[o.weekday]}` : ""}{o.km ? ` · ${o.km} km` : ""}</div></div>
    </div>
  );
  return (
    <div className="screen">
      <BackHeader title="Offers" />
      {today.length > 0 && <><div className="sectionTitle">Today</div><div className="stack">{today.map((o) => card(o, true))}</div></>}
      <div className="sectionTitle">This week</div>
      <div className="stack">{rest.map((o) => card(o, false))}</div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo offers from partner businesses. Emergency vets are never ranked by offers.</p>
    </div>
  );
}
