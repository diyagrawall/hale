"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import CaseSheet from "./CaseSheet";
import { Pic, kindFor, type Coat } from "./Art";
import { inFocus } from "./TabBar";
import { CASES, money } from "@/lib/seed";
import { useHale, useNow } from "@/lib/store";

const DAY = 86_400_000;

export default function DonateBar() {
  const path = usePathname() ?? "";
  const { ready, state, update } = useHale();
  const [i, setI] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const nowDate = useNow();
  const now = nowDate ? nowDate.getTime() : 0;

  useEffect(() => {
    const t = setInterval(() => setI((x) => x + 1), 7000);
    return () => clearInterval(t);
  }, []);

  if (!ready || !now || inFocus(path) || !state.prefs.cases) return null;
  const visible = CASES.filter((c) => !state.dismissed[c.id] || now - state.dismissed[c.id] > DAY);
  if (visible.length === 0) return null;
  const c = visible[i % visible.length];
  const raised = c.raised + (state.raised[c.id] ?? 0);
  const left = Math.max(c.goal - raised, 0);
  const pct = Math.min(100, Math.round((raised / c.goal) * 100));

  return (
    <>
      <div className="donate" key={c.id}>
        <div className="inner">
          <button className="row grow" style={{ textAlign: "left" }} onClick={() => setOpenId(c.id)} aria-label={`Open case: ${c.name}`}>
            <Pic kind={kindFor(c.species)} coat={c.coat as Coat} tone={c.tone} hurt size={44} radius={13} />
            <div className="grow">
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25 }}>{c.name} needs {money(left)} for {c.title.toLowerCase().includes("surgery") ? "surgery" : "treatment"}</div>
              <div className="progress" style={{ height: 5, margin: "6px 0 2px" }}><i style={{ width: `${pct}%` }} /></div>
              <div className="tiny">Verified by clinic · Demo</div>
            </div>
          </button>
          <button className="btn primary sm" onClick={() => setOpenId(c.id)}>Give</button>
          <button className="x" aria-label="Hide for 24 hours" onClick={() => update((s) => ({ ...s, dismissed: { ...s.dismissed, [c.id]: Date.now() } }))}><Icon name="x" size={18} /></button>
        </div>
      </div>
      {openId && <CaseSheet item={CASES.find((x) => x.id === openId) ?? c} onClose={() => setOpenId(null)} />}
    </>
  );
}
