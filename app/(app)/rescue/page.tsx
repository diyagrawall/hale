"use client";
import Link from "next/link";
import { HomeCard, SectionTitle } from "@/components/ui";
import { useHale } from "@/lib/store";

export default function Rescue() {
  const { state } = useHale();
  return (
    <div className="screen">
      <h1 className="display">Rescue</h1>
      <p className="lead">Help an animal in trouble, fast.</p>
      <Link href="/rescue/sos" className="btn danger" style={{ marginTop: 18 }}>Emergency SOS</Link>
      <SectionTitle>Not an emergency?</SectionTitle>
      <div className="stack">
        <HomeCard icon="eye" title="Check on an animal" status="A calm check for a limp or a thin dog" href="/rescue/check" />
        <HomeCard icon="book" title="First-aid guides" status="Works without signal" href="/rescue/first-aid" />
        <HomeCard icon="users" title="Call a volunteer" status="Verified helpers nearby" href="/rescue/volunteer" />
        <HomeCard icon="vet" title="Find a vet" status="Open now, 24/7, low-cost" href="/rescue/vets" />
        <HomeCard icon="paw" title="Adopt or foster" status="Animals waiting for a home" href="/rescue/adopt" />
      </div>
      <SectionTitle>{state.persona === "ngo" ? "NGO tools" : "For rescue groups"}</SectionTitle>
      <div className="stack">
        <HomeCard icon="rescue" title="Live cases" status="Queue, volunteers and shelter space" href="/rescue/cases" />
      </div>
    </div>
  );
}
