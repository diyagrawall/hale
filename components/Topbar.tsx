"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useHale } from "@/lib/store";
import { inFocus } from "./TabBar";

export default function Topbar() {
  const path = usePathname() ?? "";
  const { state } = useHale();
  if (inFocus(path)) return null;
  return (
    <div className="topbar">
      <span className="locpill"><Icon name="pin" size={17} />{state.location}</span>
      <Link href="/rescue/sos" className="sospill" aria-label="Emergency SOS"><i />SOS</Link>
    </div>
  );
}
