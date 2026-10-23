// Hand-drawn illustrations for Hale. Pure SVG, no downloads, no network, safe on server and client.
import type { CSSProperties, ReactNode } from "react";

const INK = "#2A2321";
export type Kind = "dog" | "cat" | "cow" | "bird";
export type Tone = "p1" | "p2" | "p3" | "p4" | "teal" | "night";
export type Coat = "tan" | "yellow" | "brown" | "black" | "white" | "orange" | "grey";

export const BG: Record<Tone, string> = { p1: "#EFD9BE", p2: "#D5E2D0", p3: "#F0D4CD", p4: "#D3DAEA", teal: "#CFE5DF", night: "#1E2B3A" };
const COATS: Record<Coat, { body: string; ear: string; light: string }> = {
  tan: { body: "#C9955F", ear: "#9A6636", light: "#F2DFC7" },
  yellow: { body: "#E8BE7A", ear: "#C99A52", light: "#F8E8CB" },
  brown: { body: "#8A5A3B", ear: "#5E3A22", light: "#D8BFA0" },
  black: { body: "#3B3532", ear: "#26211F", light: "#6D625C" },
  white: { body: "#F2ECE2", ear: "#CBB79A", light: "#FFFFFF" },
  orange: { body: "#E39A55", ear: "#C97A35", light: "#F8D9B0" },
  grey: { body: "#9AA3AD", ear: "#7A838D", light: "#D9DEE3" },
};
const DEFAULT_COAT: Record<Kind, Coat> = { dog: "tan", cat: "orange", cow: "white", bird: "grey" };

/** Picks a drawing from a species word, e.g. "Dog", "cow", "Cat". */
export function kindFor(species?: string | null): Kind {
  const s = (species ?? "").toLowerCase();
  if (s.includes("cat") || s.includes("kitten")) return "cat";
  if (s.includes("cow") || s.includes("calf") || s.includes("bull")) return "cow";
  if (s.includes("bird") || s.includes("crow") || s.includes("pigeon") || s.includes("kite")) return "bird";
  return "dog";
}
/** A natural coat colour for a pet from its breed. */
export function coatFor(breed: string | undefined, species?: string | null): Coat {
  const b = (breed ?? "").toLowerCase();
  const k = kindFor(species);
  if (k === "cat") return /persian|white/.test(b) ? "white" : /grey|gray|russian/.test(b) ? "grey" : "orange";
  if (/labrador|golden/.test(b)) return "yellow";
  if (/german|shepherd|beagle|brown/.test(b)) return "brown";
  if (/black/.test(b)) return "black";
  if (/pug|shih|white/.test(b)) return "white";
  return "tan";
}

type ShapeProps = { kind: Kind; coat?: Coat; hurt?: boolean; young?: boolean };

const Bandage = ({ x, y, w = 76, rot = -12 }: { x: number; y: number; w?: number; rot?: number }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + 10})`}>
    <rect x={x} y={y} width={w} height="20" rx="9" fill="#fff" stroke="#E4DCD0" strokeWidth="1.5" />
    <path d={`M${x + w / 2} ${y + 4}v12M${x + w / 2 - 6} ${y + 10}h12`} stroke="#C2281F" strokeWidth="3" strokeLinecap="round" />
  </g>
);

/** The animal itself, drawn in a 200 x 200 box. */
export function Shapes({ kind, coat, hurt, young }: ShapeProps) {
  const c = COATS[coat ?? DEFAULT_COAT[kind]];
  if (kind === "cat") {
    return (
      <g>
        <path d="M46 204C50 168 76 156 100 156s50 12 54 48z" fill={c.body} />
        <path d="M52 96L56 44 94 74z" fill={c.body} /><path d="M62 86L63 58 82 74z" fill="#F2B3AC" />
        <path d="M148 96L144 44 106 74z" fill={c.body} /><path d="M138 86L137 58 118 74z" fill="#F2B3AC" />
        <ellipse cx="100" cy="112" rx="52" ry="42" fill={c.body} />
        <path d="M100 72v12M88 74l3 10M112 74l-3 10" stroke={c.ear} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="100" cy="128" rx="20" ry="14" fill={c.light} />
        <ellipse cx="78" cy="108" rx="8.5" ry="9.5" fill="#F4E7A6" /><ellipse cx="78" cy="108" rx="3" ry="7.5" fill={INK} />
        <ellipse cx="122" cy="108" rx="8.5" ry="9.5" fill="#F4E7A6" /><ellipse cx="122" cy="108" rx="3" ry="7.5" fill={INK} />
        <path d="M94 121h12l-6 7z" fill="#E58E8E" />
        <path d="M100 128v5M100 133c-4 5-10 4-12 0M100 133c4 5 10 4 12 0" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M64 126l-24-4M64 132l-24 4M136 126l24-4M136 132l24 4" stroke={INK} strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
        {hurt ? <><Bandage x={62} y={62} rot={-10} /><g transform="rotate(24 142 128)"><rect x="126" y="121" width="32" height="13" rx="6" fill="#fff" stroke="#E4DCD0" strokeWidth="1.2" /></g></> : <><circle cx="62" cy="124" r="7" fill="#F1A9A0" opacity=".35" /><circle cx="138" cy="124" r="7" fill="#F1A9A0" opacity=".35" /></>}
      </g>
    );
  }
  if (kind === "cow") {
    return (
      <g>
        <path d="M60 204C62 170 80 160 100 160s38 10 40 44z" fill="#F6F1E8" />
        <path d="M58 74C44 56 34 50 26 54c4 14 18 28 36 36z" fill="#EFE3C8" /><path d="M142 74c14-18 24-24 32-20-4 14-18 28-36 36z" fill="#EFE3C8" />
        <ellipse cx="36" cy="106" rx="19" ry="11" transform="rotate(-22 36 106)" fill="#6B4A36" /><ellipse cx="164" cy="106" rx="19" ry="11" transform="rotate(22 164 106)" fill="#6B4A36" />
        <ellipse cx="38" cy="106" rx="10" ry="5.5" transform="rotate(-22 38 106)" fill="#F2B3AC" /><ellipse cx="162" cy="106" rx="10" ry="5.5" transform="rotate(22 162 106)" fill="#F2B3AC" />
        <path d="M56 82c0-20 18-26 44-26s44 6 44 26v34c0 28-18 46-44 46s-44-18-44-46z" fill="#F6F1E8" />
        <ellipse cx="70" cy="84" rx="15" ry="24" transform="rotate(-12 70 84)" fill="#6B4A36" />
        <ellipse cx="100" cy="142" rx="34" ry="23" fill="#F3C4BC" />
        <ellipse cx="89" cy="142" rx="3.2" ry="4.6" fill="#B96F69" /><ellipse cx="111" cy="142" rx="3.2" ry="4.6" fill="#B96F69" />
        <circle cx="78" cy="106" r="5.8" fill={INK} /><circle cx="122" cy="106" r="5.8" fill={INK} />
        <circle cx="80" cy="104" r="2" fill="#fff" /><circle cx="124" cy="104" r="2" fill="#fff" />
        {hurt ? <Bandage x={62} y={60} rot={-8} /> : <path d="M92 60q8-10 16 0" stroke="#6B4A36" strokeWidth="4" strokeLinecap="round" fill="none" />}
      </g>
    );
  }
  if (kind === "bird") {
    return (
      <g>
        <path d="M54 112L22 98l12 26-10 18z" fill="#5E87AD" />
        <path d="M92 164v14M110 164v14M86 178h12M104 178h12" stroke="#F2A23A" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="100" cy="116" rx="54" ry="48" fill="#7FA6C9" />
        <ellipse cx="106" cy="134" rx="34" ry="26" fill="#EAF2F8" />
        <path d="M66 108C48 126 66 156 98 146 86 134 84 120 66 108z" fill="#5E87AD" />
        <circle cx="124" cy="98" r="6.5" fill={INK} /><circle cx="126" cy="96" r="2" fill="#fff" />
        <path d="M148 106l24 7-24 9z" fill="#F2A23A" />
        {hurt && <g transform="rotate(-24 84 134)"><rect x="62" y="126" width="42" height="14" rx="6" fill="#fff" stroke="#E4DCD0" strokeWidth="1.2" /><path d="M83 129v8M79 133h8" stroke="#C2281F" strokeWidth="2.6" strokeLinecap="round" /></g>}
      </g>
    );
  }
  // dog
  const eye = young ? 7.2 : 6;
  return (
    <g>
      <path d="M46 204C50 166 76 152 100 152s50 14 54 52z" fill={c.body} />
      <path d="M64 80C40 74 26 114 40 146c20 2 32-22 34-50z" fill={c.ear} /><path d="M136 80c24-6 38 34 24 66-20 2-32-22-34-50z" fill={c.ear} />
      <ellipse cx="100" cy="106" rx="46" ry="44" fill={c.body} />
      <ellipse cx="100" cy={young ? 126 : 125} rx={young ? 24 : 27} ry={young ? 19 : 21} fill={c.light} />
      <ellipse cx="100" cy="114" rx="10" ry="7" fill={INK} />
      <path d="M100 121v9M100 130c-5 6-14 5-17-1M100 130c5 6 14 5 17-1" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {!hurt && <path d="M93 134q7 15 14 0z" fill="#E98A8A" />}
      {hurt ? <path d="M70 88l16-5M130 88l-16-5" stroke={INK} strokeWidth="3" strokeLinecap="round" /> : <><circle cx="66" cy="118" r="7" fill="#F1A9A0" opacity=".35" /><circle cx="134" cy="118" r="7" fill="#F1A9A0" opacity=".35" /></>}
      <circle cx="80" cy="98" r={eye} fill={INK} /><circle cx="120" cy="98" r={eye} fill={INK} />
      <circle cx="82" cy="96" r="2.2" fill="#fff" /><circle cx="122" cy="96" r="2.2" fill="#fff" />
      {hurt && <><Bandage x={62} y={56} rot={-12} /><g transform="rotate(-20 62 126)"><rect x="46" y="119" width="30" height="12" rx="6" fill="#fff" stroke="#E4DCD0" strokeWidth="1.2" /></g></>}
    </g>
  );
}

/** A square portrait of an animal on a soft coloured background. */
export function Pic({ kind, coat, tone = "p1", hurt, young, size = 64, radius, style, label }: ShapeProps & { tone?: Tone; size?: number | string; radius?: number; style?: CSSProperties; label?: string }) {
  const px = typeof size === "number" ? size : 64;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={label ?? `${hurt ? "Injured " : ""}${kind}`} style={{ borderRadius: radius ?? Math.round(px * 0.28), flex: "none", display: "block", ...style }}>
      <rect width="200" height="200" fill={BG[tone]} />
      <circle cx="30" cy="40" r="26" fill="#fff" opacity=".35" /><circle cx="176" cy="170" r="34" fill="#fff" opacity=".28" />
      <Shapes kind={kind} coat={coat} hurt={hurt} young={young} />
    </svg>
  );
}

/** A wide banner with the animal in the middle (crops to any width). */
export function Hero({ kind, coat, tone = "p1", hurt, young, height = 190, radius = 24, style }: ShapeProps & { tone?: Tone; height?: number; radius?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 400 200" width="100%" height={height} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${hurt ? "Injured " : ""}${kind}`} style={{ borderRadius: radius, display: "block", ...style }}>
      <rect width="400" height="200" fill={BG[tone]} />
      <circle cx="60" cy="50" r="46" fill="#fff" opacity=".3" /><circle cx="350" cy="150" r="64" fill="#fff" opacity=".25" /><circle cx="300" cy="40" r="22" fill="#fff" opacity=".3" />
      <path d="M0 176C70 160 140 166 210 174S340 168 400 172V200H0z" fill="#000" opacity=".05" />
      <g transform="translate(100 0)"><Shapes kind={kind} coat={coat} hurt={hurt} young={young} /></g>
    </svg>
  );
}

const SKIN = ["#F1C9A5", "#D9A57A", "#B77F57", "#8A5A3C"];
const HAIR = ["#2A2321", "#4A2F22", "#1F1A19", "#6B4A36"];
const SHIRT = ["#0E6A5E", "#C97A35", "#3F6FA8", "#B24A5A", "#6B7A3B"];
function pick<T>(arr: T[], seed: string, salt: number): T {
  let h = salt;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return arr[h % arr.length];
}

function PersonShapes({ skin, hair, shirt, long }: { skin: string; hair: string; shirt: string; long: boolean }) {
  return (
    <g>
      {long && <path d="M58 100c-6 40 4 70 22 76h40c18-6 28-36 22-76z" fill={hair} />}
      <path d="M40 204C44 168 70 156 100 156s56 12 60 48z" fill={shirt} />
      <rect x="88" y="136" width="24" height="26" rx="9" fill={skin} />
      <circle cx="100" cy="102" r="40" fill={skin} />
      <path d="M60 100C58 64 78 54 100 54s42 10 40 46c-8-20-22-28-40-28s-32 8-40 28z" fill={hair} />
      <circle cx="86" cy="108" r="3.8" fill={INK} /><circle cx="114" cy="108" r="3.8" fill={INK} />
      <path d="M88 124q12 11 24 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

/** A friendly person avatar, always the same for the same name. */
export function Person({ name, size = 46, radius }: { name: string; size?: number; radius?: number }) {
  const skin = pick(SKIN, name, 3), hair = pick(HAIR, name, 7), shirt = pick(SHIRT, name, 11);
  const long = /^(kavya|sneha|neha|priya|karuna|meera|ananya|diya)/i.test(name.trim());
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={name} style={{ borderRadius: radius ?? Math.round(size * 0.34), flex: "none", display: "block" }}>
      <rect width="200" height="200" fill="#E3EFEA" />
      <PersonShapes skin={skin} hair={hair} shirt={shirt} long={long} />
    </svg>
  );
}

const Cross = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect width="46" height="46" rx="14" fill="#0E6A5E" /><path d="M23 11v24M11 23h24" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
  </g>
);
const Heart = ({ x, y, s = 1, fill = "#E0605A" }: { x: number; y: number; s?: number; fill?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M12 22S1 15 1 8a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 7-11 14-11 14z" fill={fill} />
);

export type SceneKind = "welcome" | "rescue" | "clinic" | "recovery" | "community" | "night";

/** Wide scenes for banners and galleries. */
export function Scene({ kind, height = 160, radius = 22, style }: { kind: SceneKind; height?: number; radius?: number; style?: CSSProperties }) {
  let body: ReactNode;
  let bg = "#EFE6D6";
  if (kind === "welcome") {
    bg = "#F3E6D0";
    body = (
      <>
        <circle cx="330" cy="52" r="26" fill="#F7D9A6" />
        <path d="M0 172C80 146 160 152 240 166S360 152 400 160V220H0z" fill="#DCEBD8" /><path d="M0 190C100 170 200 180 400 176V220H0z" fill="#C5DDC8" />
        <g transform="translate(26 22) scale(.92)"><Shapes kind="dog" coat="yellow" /></g>
        <g transform="translate(176 40) scale(.8)"><Shapes kind="cat" coat="orange" /></g>
        <Cross x={318} y={104} /><Heart x={300} y={40} s={1.3} /><Heart x={246} y={26} s={.9} fill="#F0A59F" />
      </>
    );
  } else if (kind === "community") {
    bg = "#DCE8DA";
    body = (
      <>
        <path d="M0 170C90 150 180 160 400 168V220H0z" fill="#C5DDC8" />
        <g transform="translate(-6 40) scale(.6)"><Shapes kind="dog" coat="tan" /></g>
        <g transform="translate(88 30) scale(.66)"><Shapes kind="cat" coat="grey" /></g>
        <g transform="translate(184 36) scale(.62)"><Shapes kind="cow" /></g>
        <g transform="translate(276 44) scale(.58)"><Shapes kind="dog" coat="black" young /></g>
        <Heart x={196} y={12} s={1.1} />
      </>
    );
  } else if (kind === "clinic") {
    bg = "#D6E7E2";
    body = (
      <>
        <path d="M0 176h400v44H0z" fill="#BDD6CF" />
        <rect x="130" y="60" width="140" height="120" rx="10" fill="#fff" /><rect x="118" y="46" width="164" height="26" rx="10" fill="#0E6A5E" />
        <Cross x={177} y={76} s={.95} />
        <rect x="186" y="126" width="28" height="54" rx="6" fill="#CFE5DF" /><rect x="144" y="120" width="30" height="26" rx="6" fill="#CFE5DF" /><rect x="226" y="120" width="30" height="26" rx="6" fill="#CFE5DF" />
        <g transform="translate(284 88) scale(.4)"><Shapes kind="dog" coat="tan" /></g><g transform="translate(40 94) scale(.36)"><Shapes kind="cat" coat="orange" /></g>
      </>
    );
  } else if (kind === "recovery") {
    bg = "#F0E4D2";
    body = (
      <>
        <path d="M0 176h400v44H0z" fill="#E4D2B8" />
        <ellipse cx="200" cy="170" rx="120" ry="18" fill="#D8C2A2" />
        <g transform="translate(110 14) scale(.9)"><Shapes kind="dog" coat="tan" hurt /></g>
        <Heart x={300} y={50} s={1.6} /><Heart x={92} y={72} s={1.1} fill="#F0A59F" /><Cross x={44} y={40} s={.8} />
      </>
    );
  } else if (kind === "night") {
    bg = "#1E2B3A";
    body = (
      <>
        <circle cx="330" cy="46" r="22" fill="#F4E7B8" /><circle cx="340" cy="40" r="20" fill="#1E2B3A" />
        {[[40, 30], [90, 60], [150, 24], [240, 50], [290, 90], [60, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#fff" opacity=".7" />)}
        <path d="M0 168h400v52H0z" fill="#16202C" /><rect x="64" y="40" width="6" height="130" fill="#3A4A5C" /><circle cx="67" cy="40" r="14" fill="#F4E7B8" /><path d="M20 168c10-50 94-50 94 0z" fill="#F4E7B8" opacity=".12" />
        <g transform="translate(150 22) scale(.8)"><Shapes kind="dog" coat="brown" hurt /></g>
      </>
    );
  } else {
    bg = "#E8DCC8";
    // rescue: a volunteer next to a hurt dog, with a carrier
    body = (
      <>
        <path d="M0 176h400v44H0z" fill="#D9C7A8" />
        <g transform="translate(40 24) scale(.8)"><Shapes kind="dog" coat="tan" hurt /></g>
        <g transform="translate(214 30) scale(.78)"><PersonShapes skin="#D9A57A" hair="#2A2321" shirt="#0E6A5E" long={false} /></g>
        <Cross x={324} y={96} s={.9} /><Heart x={186} y={36} s={1.2} />
      </>
    );
  }
  return (
    <svg viewBox="0 0 400 200" width="100%" height={height} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${kind} illustration`} style={{ borderRadius: radius, display: "block", ...style }}>
      <rect width="400" height="200" fill={bg} />
      {body}
    </svg>
  );
}

export type ThumbKind = "groom" | "spa" | "bag" | "can" | "camp" | "adopt" | "meetup" | "expo" | "offer" | "clinic" | "aid" | "give" | "eye" | "ticket";

/** Small illustrated tiles for list rows. */
export function Thumb({ kind, size = 46, radius }: { kind: ThumbKind; size?: number; radius?: number }) {
  const bgs: Record<ThumbKind, string> = { groom: "#D3DAEA", spa: "#F0D4CD", bag: "#F6E3BF", can: "#D6E7E2", camp: "#D6E7E2", adopt: "#F0D4CD", meetup: "#D5E2D0", expo: "#F6E3BF", offer: "#F6E3BF", clinic: "#D6E7E2", aid: "#F0D4CD", give: "#F6E3BF", eye: "#D5E2D0", ticket: "#D3DAEA" };
  let art: ReactNode;
  switch (kind) {
    case "groom":
      art = <><path d="M16 50h68v6a24 24 0 0 1-24 24H40a24 24 0 0 1-24-24z" fill="#fff" /><circle cx="36" cy="38" r="9" fill="#fff" /><circle cx="52" cy="30" r="12" fill="#fff" opacity=".9" /><circle cx="68" cy="40" r="8" fill="#fff" /><path d="M30 82l-4 8M70 82l4 8" stroke="#3F6FA8" strokeWidth="4" strokeLinecap="round" /></>;
      break;
    case "spa":
      art = <><circle cx="38" cy="58" r="10" fill="none" stroke="#B24A5A" strokeWidth="5" /><circle cx="38" cy="78" r="10" fill="none" stroke="#B24A5A" strokeWidth="5" /><path d="M46 52l30-30M46 82l30-24" stroke="#B24A5A" strokeWidth="5" strokeLinecap="round" /><path d="M72 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#F7D9A6" /></>;
      break;
    case "bag":
      art = <><path d="M28 30h44l7 54H21z" fill="#E6A94F" /><path d="M28 30h44l2 9H26z" fill="#C98530" /><circle cx="42" cy="58" r="4" fill="#fff" /><circle cx="52" cy="54" r="4" fill="#fff" /><circle cx="62" cy="58" r="4" fill="#fff" /><path d="M43 70c0-6 14-6 14 0s-3 8-7 8-7-2-7-8z" fill="#fff" /></>;
      break;
    case "can":
      art = <><rect x="26" y="34" width="48" height="48" rx="8" fill="#9FB8C9" /><ellipse cx="50" cy="34" rx="24" ry="8" fill="#C9DBE6" /><path d="M36 60c8-12 22-12 28 0-6 12-20 12-28 0zM64 60l8-8v16z" fill="#fff" /></>;
      break;
    case "camp":
      art = <><rect x="22" y="40" width="56" height="42" rx="10" fill="#fff" /><path d="M50 50v22M39 61h22" stroke="#0E6A5E" strokeWidth="6" strokeLinecap="round" /><path d="M70 20l12 12M62 28l12 12" stroke="#0E6A5E" strokeWidth="5" strokeLinecap="round" /></>;
      break;
    case "adopt":
      art = <><Heart x={22} y={26} s={2.4} /><circle cx="68" cy="72" r="5" fill="#fff" /><circle cx="78" cy="64" r="4" fill="#fff" /><circle cx="58" cy="64" r="4" fill="#fff" /></>;
      break;
    case "meetup":
      art = <><circle cx="34" cy="56" r="5" fill="#6B7A3B" /><circle cx="44" cy="46" r="5" fill="#6B7A3B" /><circle cx="56" cy="46" r="5" fill="#6B7A3B" /><circle cx="66" cy="56" r="5" fill="#6B7A3B" /><path d="M50 62c-10 0-16 8-16 14 0 5 4 7 8 7 3 0 5-2 8-2s5 2 8 2c4 0 8-2 8-7 0-6-6-14-16-14z" fill="#6B7A3B" /></>;
      break;
    case "expo":
      art = <><path d="M18 46L50 20l32 26z" fill="#C97A35" /><path d="M24 46h52v38H24z" fill="#fff" /><path d="M42 84V62h16v22z" fill="#F6E3BF" /><path d="M50 20V10" stroke="#C97A35" strokeWidth="4" strokeLinecap="round" /></>;
      break;
    case "offer":
      art = <><path d="M16 50l34-34h32v32L48 82z" fill="#E6A94F" /><circle cx="68" cy="30" r="5" fill="#fff" /><path d="M40 62l22-22M42 44h.1M60 62h.1" stroke="#fff" strokeWidth="5" strokeLinecap="round" /></>;
      break;
    case "clinic":
      art = <><rect x="22" y="38" width="56" height="44" rx="8" fill="#fff" /><rect x="18" y="28" width="64" height="16" rx="7" fill="#0E6A5E" /><path d="M50 50v18M41 59h18" stroke="#0E6A5E" strokeWidth="5" strokeLinecap="round" /></>;
      break;
    case "aid":
      art = <><rect x="20" y="36" width="60" height="44" rx="10" fill="#fff" /><path d="M20 50h60" stroke="#E4DCD0" strokeWidth="3" /><path d="M50 52v20M40 62h20" stroke="#C2281F" strokeWidth="6" strokeLinecap="round" /><path d="M38 36v-8h24v8" stroke="#fff" strokeWidth="5" fill="none" /></>;
      break;
    case "give":
      art = <><rect x="22" y="48" width="56" height="36" rx="6" fill="#E0605A" /><rect x="18" y="38" width="64" height="14" rx="5" fill="#EB7C76" /><path d="M50 38v46" stroke="#FBE9E6" strokeWidth="5" /><path d="M50 38c-8-14-24-10-18 0M50 38c8-14 24-10 18 0" stroke="#E0605A" strokeWidth="5" fill="none" strokeLinecap="round" /></>;
      break;
    case "ticket":
      art = <><path d="M14 34h72v10a8 8 0 0 0 0 16v10H14V60a8 8 0 0 0 0-16z" fill="#fff" /><path d="M64 34v36" stroke="#3F6FA8" strokeWidth="3" strokeDasharray="5 5" /><path d="M30 46h22M30 56h14" stroke="#3F6FA8" strokeWidth="5" strokeLinecap="round" /><circle cx="75" cy="52" r="5" fill="#E0605A" /></>;
      break;
    case "eye":
      art = <><path d="M14 52s14-22 36-22 36 22 36 22-14 22-36 22-36-22-36-22z" fill="#fff" /><circle cx="50" cy="52" r="13" fill="#6B7A3B" /><circle cx="50" cy="52" r="6" fill={INK} /><circle cx="54" cy="48" r="3" fill="#fff" /></>;
      break;
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={kind} style={{ borderRadius: radius ?? Math.round(size * 0.32), flex: "none", display: "block" }}>
      <rect width="100" height="100" fill={bgs[kind]} />
      {art}
    </svg>
  );
}
