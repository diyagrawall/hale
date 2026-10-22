import { encodeCase } from "@/lib/caseLink";
import { computeFunding } from "@/lib/funding";
import { sign } from "@/lib/sign";

// Called when the volunteer clicks "Clinic confirmed (simulated)".
// Re-checks the case with the same rules, then returns a signed link token.
export async function POST(req: Request) {
  let b: Record<string, unknown> = {};
  try {
    b = await req.json();
  } catch {}
  const card = b.card as Record<string, unknown> | undefined;
  const f = computeFunding(b.estimate as string, b.contribution as string);
  if (
    !f.ok ||
    !card ||
    typeof card.injury !== "string" ||
    typeof card.location !== "string" ||
    typeof b.clinic !== "string" ||
    !b.clinic.trim() ||
    typeof b.appeal !== "string" ||
    !b.appeal.trim()
  ) {
    return Response.json({ ok: false, message: "Invalid case details." }, { status: 400 });
  }
  try {
    const d = sign(
      encodeCase({
        card: {
          species: typeof card.species === "string" ? card.species.slice(0, 60) : null,
          injury: card.injury.slice(0, 300),
          location: card.location.slice(0, 300),
          urgency: (["critical", "urgent", "stable"].includes(card.urgency as string) ? card.urgency : "unknown") as "critical",
        },
        clinic: b.clinic.trim().slice(0, 200),
        estimate: f.estimate,
        contribution: f.contribution,
        appeal: b.appeal.trim().slice(0, 1500),
      }),
    );
    return Response.json({ ok: true, d });
  } catch {
    return Response.json({ ok: false, message: "The server can't sign case links (missing CASE_SECRET)." }, { status: 500 });
  }
}
