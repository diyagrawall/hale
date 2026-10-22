# Hale

**Report an injured stray in one message. See how urgent it is and which vets are open nearby. Turn the clinic's estimate into a funding page.**

A hackathon MVP for rescue NGO coordinators and volunteers in Indian cities (demo city: Delhi).

> **Demo data and simulated steps.** The 17 vet clinics and 40 Delhi places are made up and seeded. "Clinic confirmed" is simulated and no real payment or payout happens. Hale is a triage aid, not a replacement for a vet.

## Job to be done

When a volunteer finds an injured stray animal, often at night or far from a clinic, they want to report it in one message and immediately see how urgent it is and which vets are open nearby. Then they want to turn the clinic's estimate into a clinic-verified funding page, so the animal gets treated fast without hours of phoning NGOs, chasing vets and proving bills to donors.

**User:** a rescue NGO coordinator or volunteer who pays for treatment case by case on a small budget.

## The 3 tests the MVP must pass

| # | Test | Result |
| --- | --- | --- |
| 1 | Type `dog bleeding near Govindpuri metro, can't stand`. Within 10 seconds see a case card (species, injury, location, urgency), a red "Go to a vet now" alert and the 3 nearest open vets from the demo list. | Pass. Alert in about 0.15 s; AI-read card in about 1.4 to 3.6 s. |
| 2 | Enter a clinic estimate of ₹8,000 and an NGO contribution of ₹2,000. See a ₹6,000 gap and an AI-drafted appeal. Click "Clinic confirmed (simulated)" and get a shareable case page showing "₹6,000 still needed" with a progress bar. | Pass. |
| 3 | Bad input is handled without guessing: a vague report ("help") asks for what happened and where; an AI error or timeout shows a clear message and the red-flag rule still works; an empty, negative, non-numeric or too-small estimate shows a message and no case page. | Pass. |

These were run by hand in the browser with the real AI, and the plain-code rules are covered by 20 automated tests (`npm test`).

## Current workflow → future workflow

**Today (without Hale)**
1. Volunteer finds an injured animal and describes it in a WhatsApp group.
2. They phone clinics one by one to find one that is open and nearby.
3. They judge urgency from guesswork or advice from others.
4. They get an estimate by phone, then message NGOs and donors to ask for money.
5. They screenshot bills later to prove where the money went.

**With Hale**
1. Volunteer types one message.
2. Hale flags danger instantly, shows a structured case card and lists the 3 nearest open vets.
3. Volunteer picks a vet and enters the clinic's estimate and the NGO's contribution.
4. Hale shows the gap and drafts an appeal. The volunteer reviews and edits it.
5. The volunteer confirms the clinic's estimate and gets a shareable, tamper-proof case page that donors can open.

*Not built yet (v2):* real clinic confirmation and payouts, live vet availability, bill photos, recovery tracking and donor updates.

## Architecture: Input → AI → Logic → Action → Output

| Stage | What happens | Where in the code |
| --- | --- | --- |
| **Input** | The report text. The clinic name, estimate and NGO contribution. Seeded demo data: 40 Delhi places and 17 vets. | `app/page.tsx`, `data/landmarks.json`, `data/vets.json` |
| **AI** | (A) Read the report into species, injury, location and urgency. (B) Draft the appeal wording. | `lib/claude.ts`, `app/api/triage/route.ts`, `app/api/appeal/route.ts` |
| **Logic** (plain code) | Danger-word rule and urgency floor. "Needs more info" rule. Place matching, distance, open-now check, nearest 3 vets. All money maths. Appeal safety checks. Link signing. | `lib/redFlags.ts`, `lib/triage.ts`, `lib/locations.ts`, `lib/vets.ts`, `lib/funding.ts`, `lib/appeal.ts`, `lib/sign.ts`, `lib/caseLink.ts` |
| **Action** | The person decides: which vet to go to, the numbers, edits to the appeal, and clicking "Clinic confirmed (simulated)". | `app/page.tsx`, `app/api/share/route.ts` |
| **Output** | Red alert, case card, 3 vets, funding gap, appeal, and a signed shareable case page with a progress bar. | `app/page.tsx`, `app/case/page.tsx` |

## Where AI is used

1. **Reading the report** (`/api/triage`). Claude is asked to extract species, injury, location and urgency, use `null` for anything not stated, never guess a place, and treat the text as untrusted. It answers through a fixed form, so we get clean fields. *Why AI:* people write messy sentences ("pup", "hit by an auto", "not able to get up"); a keyword rule cannot reliably pull out what the injury is.
2. **Drafting the appeal** (`/api/appeal`). Claude gets the facts and exact rupee amounts and writes a short plain-text appeal. *Why AI:* warm, readable wording is language work. A plain template is the fallback.

**What the AI never does:** pick vets, calculate money, decide something is safe, or lower the urgency set by the danger-word rule.

## What stays human

- Writing the report and choosing which vet to go to. Hale only suggests 3.
- Typing the clinic's estimate and the NGO's contribution. Hale never invents them.
- Reading and editing the appeal before it is shared (it is labelled "AI draft: check it before sharing").
- Clicking "Clinic confirmed" and sharing the link.
- Real treatment decisions, which belong to a vet.

## Why these tools

| Choice | Why |
| --- | --- |
| **Next.js (App Router) + TypeScript** | One app holds the screen and the small server routes that keep the API key secret. It deploys to Vercel as-is. |
| **Claude (`anthropic/claude-haiku-5.5`) via OpenRouter** | Fast and cheap enough to stay under the 10-second goal, and good at returning clean structured fields. OpenRouter is the route the available API key supports. |
| **Plain code for safety and money** | Danger signs, distances and rupee maths must be exact and testable, and must keep working when the AI is down. |
| **No database; signed links** | Vercel cannot keep files and a database is overkill for a demo. The case lives inside its link, signed on the server (HMAC) so an edited link shows "Case not found". |
| **Seeded demo data** | Keeps the MVP honest: no live vet availability, and every list is labelled as demo data. |
| **Vitest** | Fast tests for the plain-code rules. |

## Failure cases and how they are handled

| What goes wrong | What the person sees |
| --- | --- |
| Vague report like `help` | "We need a bit more": asks what happened and where. Nothing is invented. |
| Place not in the demo list | Names it back: `We couldn't find "Gurgaon sector 29" on our demo map`, and asks for a Delhi landmark. |
| Animal looks fine | Explains that Hale is for injured or sick animals. |
| Claude error, timeout (8 s) or missing key | A clear message. The red alert still works from the typed text, and the card is built by plain code only. |
| AI misreads the report | The card says "Read by AI from your message" and shows the original text beside it. Empty fields say "Not stated". |
| AI under-rates urgency | The danger-word rule overrides it and the card shows which rule fired. |
| Rule misses a phrase but the AI sees the danger | The red alert also shows when the AI rates the case critical. |
| AI appeal invents an amount, a gender or markdown | Code rejects wrong amounts and gendered words and swaps in a plain template with a note; markdown is stripped. The label says whether the text is AI or template. |
| Estimate empty, negative, not a number, or smaller than the contribution | A message under the field and no case page. "Rs. 8,000/-", "INR 8000" and "8000.00" are accepted. |
| Estimate or clinic edited after calculating | The old gap and appeal are cleared so the case page can't mix old and new numbers. |
| Case link edited, damaged or missing | "Case not found". |

**Known limits:** the danger-word list can never cover every phrase, so if both the rule and the AI miss something unusual, no red alert shows. The signature proves a link came from Hale, not that a real clinic confirmed anything. English only. Demo vets sit only in the seeded areas, so outer areas can show vets about 10 km away.

## Run it locally

You need Node.js (LTS or newer) and an [OpenRouter](https://openrouter.ai) API key that is allowed to use Claude models.

```bash
git clone https://github.com/diyagrawall/hale.git
cd hale
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in both values:

```
OPENROUTER_API_KEY=your-openrouter-key
CASE_SECRET=a-long-random-string
```

`CASE_SECRET` can be any long random string, for example from `openssl rand -hex 32`. It signs the shareable links.

```bash
npm run dev     # open http://localhost:3000
npm test        # 20 automated tests
npm run build   # production build check
```

**First click:** type `dog bleeding near Govindpuri metro, can't stand` and press **Report**. Then enter 8000 and 2000, press **Calculate gap and draft appeal**, and click **Clinic confirmed (simulated)**.

`.env.local` is git-ignored and must never be committed. To deploy on Vercel, add the same two variables in the project's environment settings.

## Out of scope for the MVP

Real payments and payouts, WhatsApp Business API intake, first-aid guidance (needs vet-reviewed content), bill reading from photos, live vet availability, recovery and foster tracking, reconciliation, donor updates, budget warnings, vet-student responders, and voice or regional-language intake.
