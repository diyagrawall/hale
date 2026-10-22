"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { BackHeader } from "./ui";
import { fileToDataUrl } from "@/lib/image";
import { listen, speechInputSupported } from "@/lib/speech";
import { saveCase } from "@/lib/session";
import { useHale } from "@/lib/store";
import type { AiCase } from "@/lib/types";

export default function Capture({ mode }: { mode: "sos" | "check" }) {
  const router = useRouter();
  const { state } = useHale();
  const [text, setText] = useState("");
  const [loc, setLoc] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [hearing, setHearing] = useState(false);
  const [busy, setBusy] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const canSpeak = useSyncExternalStore(() => () => {}, speechInputSupported, () => true);
  const place = loc ?? state.location;
  const sos = mode === "sos";
  const canSend = (text.trim() || photo) && !busy;

  async function onPhoto(file?: File) {
    if (!file) return;
    try { setPhoto(await fileToDataUrl(file)); } catch {}
  }
  function startVoice() {
    if (hearing) return;
    const stop = listen(lang, setText, () => setHearing(false));
    if (stop) { stopRef.current = stop; setHearing(true); }
  }
  function stopVoice() { stopRef.current?.(); setHearing(false); }

  async function send() {
    setBusy(true);
    const full = [text.trim(), place ? `Location: ${place}` : ""].filter(Boolean).join(". ");
    let ai: AiCase | null = null;
    let problem: string | null = null;
    try {
      const res = await fetch("/api/triage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: full || "(photo only)", image: photo ?? undefined }) });
      const data = await res.json();
      if (data.ok) ai = data.ai; else problem = data.message;
    } catch { problem = "Couldn't reach the server, so the AI wasn't used."; }
    saveCase({ text: full, ai, aiProblem: problem, thumb: photo ?? undefined, at: Date.now(), mode });
    router.push("/rescue/triage");
  }

  return (
    <div>
      {sos ? (
        <div className="emHead">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="tag"><i />EMERGENCY</span>
            <Link href="/home" className="iconbtn" style={{ background: "rgba(255,255,255,.18)", boxShadow: "none", color: "#fff" }} aria-label="Close"><Icon name="x" /></Link>
          </div>
          <h1 className="display" style={{ color: "#fff", marginTop: 14, fontSize: 28 }}>Stay calm. We are getting help.</h1>
        </div>
      ) : (
        <div style={{ padding: "0 24px" }}>
          <BackHeader />
          <h1 className="display" style={{ fontSize: 28 }}>Check on an animal</h1>
          <p className="lead">For things like a limp or a thin dog. No rush.</p>
        </div>
      )}

      <div className="screen noNav" style={{ paddingTop: 20 }}>
        <div className="stack">
          {photo ? (
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Your photo of the animal" style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 22 }} />
              <button className="iconbtn" style={{ position: "absolute", top: 10, right: 10 }} onClick={() => setPhoto(null)} aria-label="Remove photo"><Icon name="x" size={18} /></button>
            </div>
          ) : (
            <label className="card" style={{ display: "grid", placeItems: "center", height: 170, textAlign: "center", border: "1.5px dashed var(--line)", boxShadow: "none", cursor: "pointer" }}>
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
              <div>
                <div className="ic" style={{ width: 52, height: 52, borderRadius: 18, background: "var(--teal-soft)", color: "var(--teal)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><Icon name="camera" size={24} /></div>
                <div style={{ fontWeight: 600 }}>Take a photo</div>
                <div className="tiny">Show the injury and the whole animal</div>
              </div>
            </label>
          )}

          {canSpeak && <div className="row">
            <button className={`btn ${hearing ? "danger" : "soft"} grow`} onPointerDown={startVoice} onPointerUp={stopVoice} onPointerLeave={() => hearing && stopVoice()} onClick={(e) => e.preventDefault()}>
              <Icon name="mic" size={20} />{hearing ? "Listening… release to stop" : "Hold to talk"}
            </button>
            <button className="btn sm ghost" onClick={() => setLang(lang === "en-IN" ? "hi-IN" : "en-IN")} style={{ flex: "none" }}>{lang === "en-IN" ? "EN" : "हिं"}</button>
          </div>}

          <textarea className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Or type what happened, in any language" />

          <div className="row card flat" style={{ padding: "10px 14px" }}>
            <Icon name="pin" size={20} />
            <input className="grow" style={{ border: 0, background: "none", font: "inherit", outline: "none", color: "var(--ink)" }} value={place} onChange={(e) => setLoc(e.target.value)} aria-label="Location" />
            <span className="tiny">Edit</span>
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <button className={`btn ${sos ? "primary" : "primary"}`} disabled={!canSend} onClick={send}>{busy ? "Reading…" : sos ? "Send for help" : "Check"}</button>
          <p className="tiny" style={{ textAlign: "center", marginTop: 12 }}>AI is not a vet. Danger signs are also checked by a fixed rule.</p>
        </div>
      </div>
    </div>
  );
}
