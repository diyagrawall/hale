"use client";
import { useRef, useState } from "react";
import Icon from "./Icon";
import { money } from "@/lib/seed";
import { UPI_APPS, groupRef, makeRef, upiIdValid } from "@/lib/payments";
import { newId, useHale } from "@/lib/store";

export type PayMethod = "upi" | "cod" | "salon";
type Step = "method" | "verify" | "pin" | "processing" | "success";

/**
 * A simulated UPI checkout that looks and flows like the real thing:
 * pick an app or UPI ID, confirm with a PIN pad, wait, get a receipt.
 * No money moves. The PIN is never stored or sent anywhere, and the screen says so.
 */
export default function PaymentFlow({ amount, payee, note, methods = ["upi"], onDone, onClose }: {
  amount: number;
  payee: string;
  note: string;
  methods?: PayMethod[];
  onDone: (r: { ref: string; method: PayMethod }) => void;
  onClose: () => void;
}) {
  const { update } = useHale();
  const [step, setStep] = useState<Step>("method");
  const [app, setApp] = useState<string>("Your UPI app");
  const [appColor, setAppColor] = useState("#0E6A5E");
  const [upiId, setUpiId] = useState("");
  const [idError, setIdError] = useState("");
  const [pin, setPin] = useState("");
  const [ref, setRef] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const busy = useRef(false);

  const chooseApp = (name: string, color: string) => { setApp(name); setAppColor(color); setPin(""); setStep("pin"); };
  function verifyId() {
    if (!upiIdValid(upiId)) { setIdError("Enter a UPI ID like name@okhdfc"); return; }
    setIdError(""); setApp("Your UPI app"); setAppColor("#0E6A5E"); setStep("verify");
    setTimeout(() => { setPin(""); setStep("pin"); }, 1300);
  }
  function pay() {
    if (pin.length < 4 || busy.current) return;
    busy.current = true;
    setStep("processing");
    setTimeout(() => {
      const r = makeRef();
      const at = new Date();
      setRef(r);
      setPaidAt(at.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }));
      update((s) => ({ ...s, receipts: [...s.receipts, { id: newId(), ref: r, amount, payee, note, method: "UPI", at: at.toISOString() }] }));
      onDone({ ref: r, method: "upi" });
      setPin("");
      setStep("success");
      busy.current = false;
    }, 2000);
  }
  const choose = (m: PayMethod) => { onDone({ ref: "", method: m }); onClose(); };
  const tap = (d: string) => setPin((p) => (p.length < 6 ? p + d : p));

  return (
    <>
      <div className="scrim top" onClick={step === "processing" ? undefined : onClose} />
      <div className="sheet top" role="dialog" aria-label={`Pay ${money(amount)}`}>
        <div className="grab" />

        {step === "method" && (
          <div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 className="h2">Pay {money(amount)}</h2>
              <span className="demoNote" style={{ background: "var(--bg2)", padding: "4px 10px", borderRadius: 999 }}>Demo</span>
            </div>
            <div className="card flat row" style={{ marginTop: 12 }}>
              <div className="appdot" style={{ background: "var(--teal)" }}><Icon name="rescue" size={22} /></div>
              <div className="grow"><div style={{ fontWeight: 600 }}>{payee}</div><div className="sub">{note}</div></div>
            </div>
            {methods.includes("upi") && (
              <>
                <div className="sectionTitle" style={{ margin: "20px 0 10px" }}>Pay with UPI</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {UPI_APPS.map((a) => (
                    <button key={a.id} className="upi-tile" onClick={() => chooseApp(a.name, a.color)}>
                      <span className="appdot" style={{ background: a.color }}>{a.letter}</span>{a.name}
                    </button>
                  ))}
                </div>
                <div className="sectionTitle" style={{ margin: "18px 0 8px" }}>Or use a UPI ID</div>
                <div className="row">
                  <input className="field" value={upiId} onChange={(e) => { setUpiId(e.target.value); setIdError(""); }} placeholder="name@okhdfc" autoCapitalize="none" autoCorrect="off" aria-label="UPI ID" />
                  <button className="btn sm primary" onClick={verifyId} style={{ flex: "none" }}>Verify</button>
                </div>
                {idError && <p className="tiny" style={{ color: "var(--red)", marginTop: 6 }}>{idError}</p>}
              </>
            )}
            {(methods.includes("cod") || methods.includes("salon")) && (
              <>
                <div className="sectionTitle" style={{ margin: "20px 0 10px" }}>Other ways</div>
                <div className="stack" style={{ gap: 8 }}>
                  {methods.includes("cod") && <button className="homecard" onClick={() => choose("cod")}><div className="ic warm"><Icon name="bag" /></div><div className="grow"><div className="t">Cash on delivery</div><div className="s">Pay when your order arrives</div></div></button>}
                  {methods.includes("salon") && <button className="homecard" onClick={() => choose("salon")}><div className="ic warm"><Icon name="scissors" /></div><div className="grow"><div className="t">Pay at the salon</div><div className="s">Settle after the appointment</div></div></button>}
                </div>
              </>
            )}
            <p className="demoNote" style={{ textAlign: "center", marginTop: 16 }}>Demo: no money moves and nothing is sent to a bank.</p>
          </div>
        )}

        {step === "verify" && (
          <div style={{ textAlign: "center", padding: "36px 0 28px" }}>
            <div className="spin" />
            <h2 className="h2" style={{ marginTop: 22 }}>Verifying {upiId.trim()}</h2>
            <p className="sub">Checking the UPI ID…</p>
          </div>
        )}

        {step === "pin" && (
          <div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row"><span className="appdot" style={{ background: appColor, width: 36, height: 36, fontSize: 16 }}>{app[0]}</span><b>{app}</b></div>
              <span className="tiny" style={{ fontWeight: 700, letterSpacing: ".1em" }}>UPI</span>
            </div>
            <div style={{ textAlign: "center", margin: "16px 0 4px" }}>
              <div className="sub">Paying {payee}</div>
              <div className="display" style={{ fontSize: 40 }}>{money(amount)}</div>
              <div className="tiny" style={{ marginTop: 4 }}>From HDFC Bank ••4821 (demo)</div>
            </div>
            <div className="pindots" aria-label={`${pin.length} digits entered`}>{[0, 1, 2, 3].map((i) => <i key={i} className={pin.length > i ? "on" : ""} />)}</div>
            <div className="tiny" style={{ textAlign: "center" }}>Enter UPI PIN</div>
            <div className="keypad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <button key={d} onClick={() => tap(d)}>{d}</button>)}
              <button onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Delete">⌫</button>
              <button onClick={() => tap("0")}>0</button>
              <button onClick={pay} disabled={pin.length < 4} aria-label="Confirm payment" style={{ background: pin.length >= 4 ? "var(--teal)" : "#fff", color: pin.length >= 4 ? "#fff" : "var(--ink3)" }}><Icon name="check" size={24} stroke={2.6} /></button>
            </div>
            <div className="notBox" style={{ background: "var(--amber-soft)", color: "#7A5412", marginTop: 12, fontSize: 13 }}>Demo only: type any 4 digits, like 1234. Never enter your real UPI PIN here. This PIN is not saved or sent anywhere.</div>
          </div>
        )}

        {step === "processing" && (
          <div style={{ textAlign: "center", padding: "36px 0 28px" }}>
            <div className="spin" />
            <h2 className="h2" style={{ marginTop: 22 }}>Processing payment</h2>
            <p className="sub">Please don&apos;t close this screen.</p>
            <p className="demoNote" style={{ marginTop: 8 }}>{money(amount)} to {payee}</p>
          </div>
        )}

        {step === "success" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "var(--teal)", color: "#fff", display: "grid", placeItems: "center", margin: "10px auto 14px", animation: "pop .5s both" }}><Icon name="check" size={40} stroke={2.8} /></div>
            <h2 className="h2" style={{ fontSize: 26 }}>Payment successful</h2>
            <div className="display" style={{ fontSize: 40, margin: "6px 0 2px" }}>{money(amount)}</div>
            <div className="sub">Paid to {payee}</div>
            <div className="card flat" style={{ marginTop: 16, textAlign: "left" }}>
              <div className="row sub"><span className="grow">UPI reference</span><b style={{ color: "var(--ink)", letterSpacing: ".04em" }}>{groupRef(ref)}</b></div>
              <div className="row sub" style={{ marginTop: 8 }}><span className="grow">Date and time</span><span style={{ color: "var(--ink)" }}>{paidAt}</span></div>
              <div className="row sub" style={{ marginTop: 8 }}><span className="grow">From</span><span style={{ color: "var(--ink)" }}>{app === "Your UPI app" ? "UPI" : app} · HDFC ••4821</span></div>
              <div className="row sub" style={{ marginTop: 8 }}><span className="grow">For</span><span style={{ color: "var(--ink)", textAlign: "right" }}>{note}</span></div>
            </div>
            <button className="btn primary" style={{ marginTop: 16 }} onClick={onClose}>Done</button>
            <p className="demoNote" style={{ marginTop: 10 }}>Demo receipt: no money moved.</p>
          </div>
        )}
      </div>
    </>
  );
}
