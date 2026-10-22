"use client";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { BackHeader, Skeleton } from "@/components/ui";
import { describeHours, distanceKm, isOpenAt, istMinutesNow } from "@/lib/vets";
import { VETS } from "@/lib/vets";
import { matchLandmark } from "@/lib/locations";
import { useHale, useNow } from "@/lib/store";
import { buildTriage } from "@/lib/triage";
import { useActiveCase } from "@/lib/session";

const FILTERS = ["Open now", "24/7", "Government", "NGO", "Low-cost"] as const;

export default function Vets() {
  const { ready, state } = useHale();
  const now = useNow();
  const c = useActiveCase();
  const [filters, setFilters] = useState<string[]>(["Open now"]);
  const [showFilters, setShowFilters] = useState(false);
  const [all, setAll] = useState(false);
  const [alertVet, setAlertVet] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const origin = useMemo(() => matchLandmark(c?.text ?? "") ?? matchLandmark(state.location), [c, state.location]);

  if (!ready || !now || c === undefined) return <div className="screen noNav"><div className="stack"><Skeleton h={90} /><Skeleton h={90} /><Skeleton h={90} /></div></div>;

  const mins = istMinutesNow(now);
  const inPune = origin ? origin.lat < 20 : true;
  const point = origin ?? { lat: 18.559, lng: 73.7868 };
  const list = VETS.map((v) => ({ ...v, km: distanceKm(point, v), open: isOpenAt(v, mins) }))
    .filter((v) => (inPune ? v.city === "Pune" : v.city !== "Pune"))
    .filter((v) => (filters.includes("Open now") ? v.open : true) && (filters.includes("24/7") ? v.hours === "24h" : true) && (filters.includes("Government") ? v.kind === "government" : true) && (filters.includes("NGO") ? v.kind === "ngo" : true) && (filters.includes("Low-cost") ? v.price === "₹" : true))
    .sort((a, b) => a.km - b.km);
  const shown = all ? list : list.slice(0, 3);
  const tri = c ? buildTriage(c.text, c.ai) : null;
  const card = tri && tri.status === "ready" ? tri.card : null;
  const msg = card ? `${card.urgency === "unknown" ? "Urgent" : card.urgency[0].toUpperCase() + card.urgency.slice(1)} case. ${card.species ?? "Animal"}: ${card.injury}. Near ${card.location}. Arriving soon. Please be ready.` : "";
  const toggle = (f: string) => setFilters((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]));

  return (
    <div className="screen">
      <BackHeader title="Vets near you" right={<button className="btn sm soft" onClick={() => setShowFilters(!showFilters)}>Filter</button>} />
      <p className="sub">From {origin?.name ?? state.location} · hours from listed times, not AI</p>
      {showFilters && <div className="choices" style={{ margin: "12px 0" }}>{FILTERS.map((f) => <button key={f} className={`choice ${filters.includes(f) ? "on" : ""}`} onClick={() => toggle(f)}>{f}</button>)}</div>}

      {list.length === 0 ? (
        <div className="stack" style={{ marginTop: 16 }}>
          <div className="alertBox"><b>No vet open with these filters</b><div>Try removing a filter. If this is critical, do not wait for morning: call a 24/7 clinic.</div></div>
          <button className="btn primary" onClick={() => setFilters([])}>Show all vets</button>
        </div>
      ) : (
        <div className="stack" style={{ marginTop: 14 }}>
          {shown.map((v) => (
            <div key={v.id} className="card">
              <div className="row" style={{ alignItems: "flex-start" }}>
                <div className="grow"><div style={{ fontWeight: 600, fontSize: 17 }}>{v.name}</div><div className="sub">{v.area} · {v.km.toFixed(1)} km · {v.open ? <span style={{ color: "var(--teal)", fontWeight: 600 }}>{describeHours(v)}</span> : <span style={{ color: "var(--red)" }}>Closed now</span>}</div></div>
                <span className="tiny">{v.price}</span>
              </div>
              <div className="sub" style={{ marginTop: 6 }}>{v.kind ? v.kind[0].toUpperCase() + v.kind.slice(1) + " · " : ""}{v.note ?? ""}</div>
              <div className="row" style={{ marginTop: 12 }}>
                <a className="btn primary grow" href="tel:+910000000000"><Icon name="phone" size={18} />Call</a>
                <a className="btn soft sm" href={`https://maps.google.com/?q=${v.lat},${v.lng}`} target="_blank" rel="noreferrer">Navigate</a>
                {card && <button className="btn ghost sm" onClick={() => { setAlertVet(v.name); setSent(false); }}>Pre-alert</button>}
              </div>
            </div>
          ))}
          {!all && list.length > 3 && <button className="btn ghost" onClick={() => setAll(true)}>Show {list.length - 3} more</button>}
        </div>
      )}
      <p className="demoNote" style={{ textAlign: "center", marginTop: 18 }}>Demo clinics · Emergency vets are ranked only by distance and open hours</p>

      {alertVet && (
        <>
          <div className="scrim" onClick={() => setAlertVet(null)} />
          <div className="sheet">
            <div className="grab" />
            <h2 className="h2">Pre-alert {alertVet}</h2>
            <p className="sub" style={{ marginTop: 4 }}>So they are ready when you arrive.</p>
            <div className="card flat" style={{ marginTop: 14 }}><div className="tiny" style={{ marginBottom: 4 }}>Message to the clinic</div>{msg}</div>
            {sent ? <div className="notBox" style={{ background: "var(--teal-soft)", color: "var(--teal-d)" }}>Sent to {alertVet} (simulated). They know you are coming.</div> : <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setSent(true)}>Send pre-alert</button>}
          </div>
        </>
      )}
    </div>
  );
}
