"use client";
import Link from "next/link";
import { HomeCard, SectionTitle } from "@/components/ui";
import { useHale } from "@/lib/store";
import { Person, Pic, Scene, Thumb } from "@/components/Art";

export default function Rescue() {
  const { state } = useHale();
  return (
    <div className="screen">
      <h1 className="display">Rescue</h1>
      <p className="lead">Help an animal in trouble, fast.</p>
      <div style={{ marginTop: 16 }}><Scene kind="rescue" height={140} /></div>
      <Link href="/rescue/sos" className="btn danger" style={{ marginTop: 18 }}>Emergency SOS</Link>
      <SectionTitle>Not an emergency?</SectionTitle>
      <div className="stack">
        <HomeCard icon="eye" art={<Thumb kind="eye" />} title="Check on an animal" status="A calm check for a limp or a thin dog" href="/rescue/check" />
        <HomeCard icon="book" art={<Thumb kind="aid" />} title="First-aid guides" status="Steps stored in the app" href="/rescue/first-aid" />
        <HomeCard icon="users" art={<Person name="Rohit Kulkarni" size={46} />} title="Call a volunteer" status="Verified helpers nearby" href="/rescue/volunteer" />
        <HomeCard icon="vet" art={<Thumb kind="clinic" />} title="Find a vet" status="Open now, 24/7, low-cost" href="/rescue/vets" />
        <HomeCard icon="paw" art={<Pic kind="dog" coat="yellow" young tone="p3" size={46} radius={15} />} title="Adopt or foster" status="Animals waiting for a home" href="/rescue/adopt" />
      </div>
      <SectionTitle>{state.persona === "ngo" ? "NGO tools" : "For rescue groups"}</SectionTitle>
      <div className="stack">
        <HomeCard icon="rescue" art={<Thumb kind="aid" />} title="Live cases" status="Queue, volunteers and shelter space" href="/rescue/cases" />
      </div>
    </div>
  );
}
