"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { useHale } from "@/lib/store";

export default function Splash() {
  const router = useRouter();
  const { ready, state } = useHale();
  const go = () => router.replace(state.persona ? "/home" : "/welcome");

  useEffect(() => {
    if (!ready) return;
    // First visit: let the intro play for 3.5 s. Returning users skip straight in.
    const t = setTimeout(go, state.persona ? 300 : 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.persona]);

  return (
    <div className="phone">
      <div className="splash" onClick={go} role="button" tabIndex={0} aria-label="Hale. Tap to continue">
        <div>
          <div className="logo"><Icon name="vet" size={46} stroke={2.2} /></div>
          <h1 className="word">Hale</h1>
          <svg className="beat" viewBox="0 0 220 40" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M0 22h70l10-16 14 32 12-24 8 8h106" />
          </svg>
          <p className="tag" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>Help for every animal, fast</p>
          <p className="tag2">हर जानवर के लिए, तुरंत मदद</p>
        </div>
        <div className="skip">Tap anywhere to skip</div>
      </div>
    </div>
  );
}
