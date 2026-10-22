const P: Record<string, React.ReactNode> = {
  home: <path d="M3 11l9-8 9 8M5.5 9.5V20h13V9.5" />,
  care: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  rescue: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M12 9v6M9 12h6" /></>,
  give: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" /></>,
  me: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  paw: <><circle cx="6" cy="10" r="1.8" /><circle cx="10" cy="6" r="1.8" /><circle cx="14" cy="6" r="1.8" /><circle cx="18" cy="10" r="1.8" /><path d="M12 12c-3 0-5.5 3-5.5 5.2 0 1.5 1.2 2.3 2.7 2.3 1 0 1.9-.5 2.8-.5s1.8.5 2.8.5c1.5 0 2.7-.8 2.7-2.3C17.5 15 15 12 12 12z" /></>,
  vet: <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />,
  scissors: <><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 8l12 8M8 16L20 8" /></>,
  bowl: <><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M9 7c0-1 1-1 1-2M13 7c0-1 1-1 1-2" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M8 3v4M16 3v4" /></>,
  tag: <><path d="M3 12l9-9h8v8l-9 9z" /><circle cx="16" cy="8" r="1.2" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 6a2 2 0 0 1 2-2z" />,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  pin: <><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  bell: <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12l4.5 4.5L19 7" />,
  chevR: <path d="M9 6l6 6-6 6" />,
  chevL: <path d="M15 6l-6 6 6 6" />,
  alert: <path d="M12 3l10 18H2zM12 10v5M12 18v.5" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14a5 5 0 0 1 6 5" /></>,
  bag: <path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  truck: <><path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  book: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8v8M8 12h8" /></>,
  speaker: <path d="M4 10v4h4l5 4V6l-5 4zM16 9a4 4 0 0 1 0 6" />,
  heartbeat: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  home2: <path d="M4 20V10l8-6 8 6v10zM10 20v-6h4v6" />,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 11l7.6-4M8.2 13l7.6 4" /></>,
};

export default function Icon({ name, size = 22, stroke = 1.8 }: { name: string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {P[name] ?? P.paw}
    </svg>
  );
}
