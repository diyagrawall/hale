# Hale

Hackathon MVP for rescue NGO coordinators and volunteers in Indian cities (demo: Delhi).
Report an injured stray in one message and Hale shows how urgent it is and which vets are open nearby. Then it turns the clinic's estimate into a shareable funding page.

**Demo data:** the vets and landmarks are made up and seeded. Clinic confirmation and payments are simulated. No real money moves.

## What it does

1. **Report** in one box, e.g. `dog bleeding near Govindpuri metro, can't stand`.
2. A plain-code **safety rule** shows a red "Go to a vet now" alert instantly, even if the AI is down.
3. The AI reads the message into a **case card** (species, injury, location, urgency). The rule can raise urgency but the AI can never lower it.
4. The **3 nearest vets open now** appear, from 17 seeded demo vets and 40 seeded Delhi places.
5. Enter the clinic **estimate** and the NGO **contribution**. Hale shows the funding gap and an AI-drafted appeal.
6. **Clinic confirmed (simulated)** opens a signed, shareable case page showing "₹X still needed" and a progress bar.

Bad input never gets guessed: a vague report asks for what happened and where, a bad estimate shows a message and no page opens, and an AI error shows a clear message while the safety rule still works.

## What is AI and what is plain code

| AI (Claude via OpenRouter) | Plain code |
| --- | --- |
| Reading the report into fields | Red-flag danger words and the urgency floor |
| Drafting the appeal wording | Landmark matching, distance, open-now check, nearest 3 vets |
| | All money: validation, gap, progress |
| | Appeal checks (no invented amounts, no made-up gender, no markdown) |
| | Signing and verifying case links |

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:3000
npm test                     # automated tests
```

`.env.local` (never committed):

- `OPENROUTER_API_KEY`: your OpenRouter key (the app uses `anthropic/claude-haiku-5.5`).
- `CASE_SECRET`: any long random string; it signs case links so they can't be edited.

On Vercel, add the same two variables in the project's environment settings.

## Not in the MVP

Real payments and payouts, WhatsApp intake, first-aid guidance, bill reading from photos, live vet availability, recovery and foster tracking, donor updates, and regional-language or voice intake.

Built with Next.js (App Router) and TypeScript.
