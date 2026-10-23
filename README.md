# Hale

**Help for every animal, fast.** A mobile-first super app for animal care in Indian cities (demo city: Pune): emergency help for strays and pets, pet health reminders, grooming, food, events, and clinic-verified fundraising.

> **Demo build.** Clinics, volunteers, groomers, food, events, offers and cases are seeded demo content, labelled "Demo". Payments, orders and clinic confirmation are simulated. First-aid steps are general guidance and are **pending review by a vet**. Hale is a triage aid, not a replacement for a vet.

**Live demo:** https://hale-six.vercel.app (open it on a phone, or in a browser at phone width)

## The problem

Research with NGO founders, vet students, breeders and pet owners (see `proof/`) points to the same thing: animals die from **late help**: no easy way to share a location, no transport, nobody who knows first aid, poor communication, too few emergency vets, and care that costs too much. One NGO founder put it as "mortality rate is 30% because of late medical help (transportation, location, unaware about on-site treatment, improper communication)". Pet owners who can't afford care end up giving pets up, which feeds the same problem.

## What the app does

Everyone gets the same five tabs: **Home · Care · Rescue · Give · Me**. The first launch asks who you are (found an animal, pet owner, NGO), and that only changes the **order of the cards** on Home. Nothing is hidden by role.

- **Emergency (Rescue tab and the SOS pill on every screen):** report with a photo, voice or text in any language. AI reads it into species, injury and urgency. A fixed rule checks for danger words, so a red "Go to a vet now" alert works even if the AI is down. Then first-aid steps (read aloud, stored in the app), a volunteer ranked by plain code with an AI-written brief, a case thread with translation, and the nearest open vets with a pre-alert.
- **Calm check:** a no-alarm path for things like a limp or a thin dog, with clear signs for when to escalate to SOS.
- **Pet care (Care tab):** multiple pets, a health card with vaccine reminders, an AI vaccination-card scan, grooming centres and offers, allergy-aware food picks with an AI reason and a reorder reminder, an offers hub, and **event booking** (free reservations and paid tickets, with an itemised price, a 5% booking fee that is Hale's revenue, an optional rescue round-up, a confirmation ticket, calendar export, and reminders for events you booked).
- **Give tab:** verified cases to support, monthly sponsoring, round-up giving at checkout, an impact feed, and a sticky donation bar that rotates verified cases and **hides itself during emergencies**.
- **NGO tools:** fundraising first (emergency pool, create a campaign from an estimate), a live case queue with AI duplicate detection and suggested path, volunteer roster, shelter space, adopt/foster.
- **Notifications centre:** reminders and day-specific offers (for example a Wednesday grooming offer), with category switches, quiet hours and a weekly offer cap. Health reminders always outrank offers.

## What is real and what is simulated

| Real (logic or AI runs for real) | Simulated or seeded |
| --- | --- |
| Danger-word rule and urgency floor | Payments, orders, ticket payments, round-ups, sponsoring |
| AI triage from photo, voice and text | Clinic confirmation of an estimate |
| AI vaccination-card scan, food reasons, volunteer brief, appeal | Volunteers, vets, groomers, events, offers, adoptable animals |
| Reminder dates (vaccines, food bag, grooming) | Phone push notifications (shown in-app) |
| Allergen filter, volunteer ranking, funding gap | Live vet availability (hours are seeded) |
| Signed shareable funding links | Real partner data |

## Architecture: Input → AI → Logic → Action → Output

| Stage | What happens |
| --- | --- |
| **Input** | Photo, voice or text report; pet profile; clinic estimate; seeded Pune data |
| **AI** (Claude, via OpenRouter) | Reads reports and photos, reads vaccination cards, explains food picks, writes volunteer briefs and appeals |
| **Logic** (plain code) | Danger words and urgency floor, distances and open-now, reminder dates, allergen filter, volunteer ranking, notification rules, all money maths, appeal safety checks, link signing |
| **Action** | A person decides: which vet, which volunteer, the numbers, edits, and confirming |
| **Output** | Alert, case card, first aid, vets, reminders, funding page, signed shareable link |

**What stays human:** choosing the vet, entering the estimate and contribution, reviewing and sharing the appeal, confirming a campaign, and every treatment decision. The app never ranks animals or suggests euthanasia.

## Failure cases and how they are handled

| What goes wrong | What the person sees |
| --- | --- |
| Vague report ("help") | "We need a bit more", asks what happened and where, invents nothing |
| Place not on the demo map | Names the place back and asks for a nearby area |
| AI error, timeout or missing key | A clear note; the red alert still works from the fixed rule; the card is built by plain code |
| AI misreads | "See what the AI read" shows your words next to its reading |
| Rule misses a phrase but the AI sees danger | The red alert also shows when the AI rates the case critical |
| AI appeal invents an amount, a gender or markdown | Code rejects it and falls back to a plain template with a note |
| Bad estimate (empty, negative, text, smaller than the contribution) | A message and no page opens |
| Edited or broken funding link | "Case not found" (links are signed on the server) |
| No vet open with the filters | A clear message and a way to widen the search |

**Known limits:** the danger-word list can never cover every phrase, so if both the rule and the AI miss something unusual, no red alert shows. The signature proves a link came from Hale, not that a real clinic confirmed anything. First-aid content needs a vet's review before real use. Data lives on the device (no accounts or database).

## Why these tools

| Choice | Why |
| --- | --- |
| **Next.js (App Router) + TypeScript** | One app for the screens and the small server routes that keep the AI key secret. Deploys to Vercel as-is. Mobile-first and installable from a link. |
| **Claude (`anthropic/claude-haiku-5.5`) via OpenRouter** | Fast and cheap enough for a 10-second goal, reads photos, and returns clean structured fields. |
| **Plain code for safety, dates and money** | Must be exact, testable, and keep working when the AI is down. |
| **Signed links, no database** | The demo needs no accounts; the case lives inside a link signed with HMAC. |
| **Vitest** | 34 tests for the plain-code rules. |

## Run it locally

You need Node.js and an [OpenRouter](https://openrouter.ai) API key that is allowed to use Claude models.

```bash
git clone https://github.com/diyagrawall/hale.git
cd hale
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:3000 (use a phone-sized window)
npm test                     # 34 automated tests
npm run build                # production build check
```

`.env.local` (never committed):

- `OPENROUTER_API_KEY`: your OpenRouter key.
- `CASE_SECRET`: any long random string (for example `openssl rand -hex 32`). It signs the shareable links.

On Vercel, add the same two variables in the project's environment settings.

**Demo tips:** on the role screen choose "I have a pet", then "Use demo pet: Bruno" for a pet with reminders already due. In **Me** you can switch the persona or reset the demo and replay the intro. In **Me → Notifications** there is a "preview as a Wednesday" switch to show a day-specific offer.

## Proof of progress

`proof/` holds before-and-after screenshots of the PASS/FAIL checks from the MVP stage.

## Out of scope

Real payments and payouts, real ordering, live vet availability, phone push, accounts, regional-language voice beyond what the browser provides, and vet-student responders (needs a Veterinary Council rules check).
