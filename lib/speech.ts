// Browser speech helpers. Both are optional: the app works without them.
type Rec = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void };
type RecCtor = new () => Rec;

export function speechInputSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Starts listening. Returns a stop function, or null if the browser has no speech input. */
export function listen(lang: string, onText: (t: string) => void, onEnd: () => void): (() => void) | null {
  if (!speechInputSupported()) return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  const R = (w.SpeechRecognition || w.webkitSpeechRecognition) as RecCtor;
  const r = new R();
  r.lang = lang;
  r.interimResults = true;
  r.continuous = true;
  r.onresult = (e) => {
    let t = "";
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
    onText(t);
  };
  r.onend = onEnd;
  r.onerror = onEnd;
  r.start();
  return () => r.stop();
}

export function speak(text: string, lang = "en-IN") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
  return true;
}
export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
