import { APPEAL_SYSTEM, appealAmountsOk, cleanAppeal, appealHasGender, appealTemplate, appealUserMessage } from "@/lib/appeal";
import { AiError, aiErrorMessage, askForText } from "@/lib/claude";
import { computeFunding } from "@/lib/funding";

export async function POST(req: Request) {
  let body: Record<string, unknown> & { card?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {}

  // Re-check the money here with the same rules as the form.
  const funding = computeFunding(body.estimate as string, body.contribution as string);
  const card = body.card as Record<string, unknown> | undefined;
  const clinic = typeof body.clinic === "string" ? body.clinic.trim().slice(0, 200) : "";
  if (!funding.ok || !card || typeof card.injury !== "string" || typeof card.location !== "string" || !clinic) {
    return Response.json({ ok: false, message: "Invalid case details." }, { status: 400 });
  }
  const facts = {
    card: {
      species: typeof card.species === "string" ? card.species.slice(0, 60) : null,
      injury: card.injury.slice(0, 300),
      location: card.location.slice(0, 300),
      urgency: "unknown" as const, // the appeal text does not use urgency
    },
    clinic,
    estimate: funding.estimate,
    contribution: funding.contribution,
    gap: funding.gap,
  };

  try {
    const text = cleanAppeal(await askForText({ system: APPEAL_SYSTEM, user: appealUserMessage(facts) }));
    if (!appealAmountsOk(text, [facts.estimate, facts.contribution, facts.gap])) {
      return Response.json({
        ok: true,
        source: "template",
        notice: "The AI wrote an amount we didn't give it, so we used a plain appeal instead.",
        appeal: appealTemplate(facts),
      });
    }
    if (appealHasGender(text)) {
      return Response.json({
        ok: true,
        source: "template",
        notice: "The AI described the animal as male or female, which we don't know, so we used a plain appeal instead.",
        appeal: appealTemplate(facts),
      });
    }
    return Response.json({ ok: true, source: "ai", appeal: text.slice(0, 1500) });
  } catch (err) {
    const reason = err instanceof AiError ? err.reason : "unavailable";
    return Response.json({
      ok: true,
      source: "template",
      notice: `${aiErrorMessage(reason)} Here is a plain appeal instead; you can edit it.`,
      appeal: appealTemplate(facts),
    });
  }
}
