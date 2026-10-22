"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

export const FOCUS_PATHS = ["/rescue/sos", "/rescue/triage", "/rescue/first-aid", "/rescue/volunteer", "/rescue/check", "/give/fund"];
export const inFocus = (p: string) => FOCUS_PATHS.some((f) => p.startsWith(f));

const TABS = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/care", label: "Care", icon: "care" },
  { href: "/rescue", label: "Rescue", icon: "rescue" },
  { href: "/give", label: "Give", icon: "give" },
  { href: "/me", label: "Me", icon: "me" },
];

export default function TabBar() {
  const path = usePathname() ?? "";
  if (inFocus(path)) return null;
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={`tab ${path === t.href || path.startsWith(t.href + "/") ? "on" : ""}`}>
          <Icon name={t.icon} size={24} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
