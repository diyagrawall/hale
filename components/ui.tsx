"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

export function BackHeader({ title, href, right }: { title?: string; href?: string; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="header">
      {href ? (
        <Link href={href} className="iconbtn" aria-label="Back"><Icon name="chevL" /></Link>
      ) : (
        <button className="iconbtn" onClick={() => router.back()} aria-label="Back"><Icon name="chevL" /></button>
      )}
      {title && <div className="grow" style={{ fontWeight: 600, fontSize: 17 }}>{title}</div>}
      {right}
    </div>
  );
}

export function HomeCard({ icon, tone, title, status, href, due, onClick }: { icon: string; tone?: "warm" | "blue"; title: string; status?: string; href?: string; due?: boolean; onClick?: () => void }) {
  const inner = (
    <>
      <div className={`ic ${tone ?? ""}`}><Icon name={icon} /></div>
      <div className="grow">
        <div className="t">{title}</div>
        {status && <div className={`s ${due ? "due" : ""}`}>{status}</div>}
      </div>
      <span className="chev"><Icon name="chevR" size={20} /></span>
    </>
  );
  if (href) return <Link href={href} className="homecard">{inner}</Link>;
  return <button className="homecard" onClick={onClick}>{inner}</button>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="sectionTitle">{children}</div>;
}

export function Toast({ text }: { text: string | null }) {
  return text ? <div className="toast" role="status">{text}</div> : null;
}

export function Skeleton({ h = 72 }: { h?: number }) {
  return <div className="skel" style={{ height: h }} />;
}

export function DemoNote({ children = "Demo data" }: { children?: React.ReactNode }) {
  return <div className="demoNote">{children}</div>;
}

export function Toggle({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className="row" style={{ width: "100%", textAlign: "left", padding: "10px 0" }} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <div className="grow"><div style={{ fontWeight: 600 }}>{label}</div>{sub && <div className="sub">{sub}</div>}</div>
      <span style={{ width: 50, height: 30, borderRadius: 999, background: on ? "var(--teal)" : "var(--line)", position: "relative", transition: "background .2s", flex: "none" }}>
        <i style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
      </span>
    </button>
  );
}
