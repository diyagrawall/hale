"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import PetSwitcher from "@/components/PetSwitcher";
import CaseSheet from "@/components/CaseSheet";
import { HomeCard, SectionTitle, Skeleton } from "@/components/ui";
import { activePet, useHale, useNow } from "@/lib/store";
import { ABOVE_FOLD, cardOrder } from "@/lib/persona";
import { cardInfo } from "@/lib/homecards";
import { CASES, money } from "@/lib/seed";
import { describeDays, nextVaccine } from "@/lib/reminders";

export default function Home() {
  const router = useRouter();
  const { ready, state } = useHale();
  const now = useNow();
  const [sheet, setSheet] = useState(false);

  useEffect(() => { if (ready && !state.persona) router.replace("/welcome"); }, [ready, state.persona, router]);

  if (!ready || !now || !state.persona) {
    return <div className="screen"><div className="stack"><Skeleton h={230} /><Skeleton /><Skeleton /><Skeleton /></div></div>;
  }

  const pet = activePet(state);
  const order = cardOrder(state.persona);
  const [heroId, ...rest] = order;
  const visible = rest.slice(0, ABOVE_FOLD - 1);
  const below = rest.slice(ABOVE_FOLD - 1);
  const v = pet ? nextVaccine(pet, now) : null;

  const render = (id: typeof order[number]) => {
    const c = cardInfo(id, { pet, now, state });
    return <HomeCard key={id} icon={c.icon} tone={c.tone === "red" ? undefined : c.tone} title={c.title} status={c.status} href={c.href} due={c.due} onClick={c.sheet ? () => setSheet(true) : undefined} />;
  };

  return (
    <div className="screen">
      {state.persona === "owner" && <PetSwitcher />}

      {heroId === "sos" && (
        <div className="sosPanel" style={{ marginTop: 6 }}>
          <h2>Animal hurt or in danger?</h2>
          <Link href="/rescue/sos" className="sosBtnWrap" aria-label="SOS: report an injured animal"><span className="sosBtn">SOS</span></Link>
          <div className="small">Tap to get help · takes 10 seconds</div>
        </div>
      )}
      {heroId === "vet" && (
        <div className="herocard" style={{ marginTop: 6 }}>
          <div className="row" style={{ gap: 10 }}><Icon name="vet" /><span style={{ fontWeight: 600 }}>{pet ? `Vet care for ${pet.name}` : "Vet care"}</span></div>
          <div className="display" style={{ color: "#fff", fontSize: 26, marginTop: 14 }}>{pet && v ? `${v.name} ${describeDays(v.inDays)}` : "Add your pet to get reminders"}</div>
          <div className="s" style={{ marginTop: 6 }}>{pet ? (pet.lastVisit ? "Keep every vaccine on time." : "Add your last vet visit in Care.") : "Vaccines, vet visits and records in one place."}</div>
          <div className="row" style={{ marginTop: 18 }}>
            <Link href="/rescue/vets" className="btn light grow">Find a vet now</Link>
            <Link href={pet ? "/care/vet" : "/onboarding/pet"} className="btn sm" style={{ color: "#fff", background: "rgba(255,255,255,.14)" }}>{pet ? "Health card" : "Add pet"}</Link>
          </div>
        </div>
      )}
      {heroId === "fundraising" && (
        <div className="herocard" style={{ marginTop: 6 }}>
          <div className="row" style={{ gap: 10 }}><Icon name="give" /><span style={{ fontWeight: 600 }}>Fundraising</span></div>
          <div className="display" style={{ color: "#fff", fontSize: 34, marginTop: 14 }}>{money(48200)}</div>
          <div className="s">Emergency pool. Pays clinics right away. Refilled by gifts.</div>
          <div className="row" style={{ marginTop: 18 }}>
            <Link href="/give/fund" className="btn light grow">Create a campaign</Link>
            <Link href="/give" className="btn sm" style={{ color: "#fff", background: "rgba(255,255,255,.14)" }}>Appeals</Link>
          </div>
        </div>
      )}

      <div className="stack" style={{ marginTop: 16 }}>{visible.map(render)}</div>
      <SectionTitle>Everything else</SectionTitle>
      <div className="stack">{below.map(render)}</div>
      <p className="demoNote" style={{ textAlign: "center", marginTop: 22 }}>Demo: partners, offers and payments are simulated · AI is not a vet</p>
      {sheet && <CaseSheet item={CASES[0]} onClose={() => setSheet(false)} />}
    </div>
  );
}
