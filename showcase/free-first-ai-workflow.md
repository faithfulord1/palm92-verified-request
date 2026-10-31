# Palm92 ScamShield: Free-first AI workflow playbook

**Don’t trust the screenshot. Verify the request.**  
**AI investigates. Humans decide.**

This playbook documents a free-first workflow for Palm92 ScamShield. It is a workflow blueprint, not a claim that every integration or bot is already built or deployed.

## What Palm92 is aiming to do

Help people pause before acting on suspicious messages, payment requests, opportunities, donation appeals, or urgent instructions.

**CAPTURE → PRESERVE → EXTRACT → CHECK → CROSS-VERIFY → EXPLAIN RISK → HUMAN DECISION → REPORT / BLOCK → KEEP EVIDENCE**

AI can extract claims, identify inconsistencies, and guide checks. It must not declare a request authorised based only on a screenshot, writing style, or model confidence. Decisions need reliable evidence and, where relevant, an authorised human.

## Three plans, selected automatically

### Plan A — Use what is already available

Use tools and free accounts already available. Start from supplied product images and verified facts. Create a short script, storyboard, screen annotations, or music prompt without adding a subscription or starting a paid trial. Free accounts may have changing credit limits and usage restrictions; check current terms.

### Plan B — Reuse open source after checking it

Inspect the repository, license, dependencies, privacy behavior, and paid-service requirements first.

- The MIT-licensed [match-cut skill](https://github.com/Sac-Y/match-cut) demonstrates a product-film style where a shape or gesture passes across changing scenes, then resolves on the product and end card. Its generation setup requires Renoise and billed credits for video, music, voice, and sound effects. Use it as a style reference unless those costs are explicitly accepted.
- [OpenOptOut](https://github.com/rlnunez/OpenOptOut) is a free, AGPL-3.0, self-hosted data-broker opt-out project. Its README describes an encrypted identity vault and automated submissions. Self-hosting still takes secure storage, setup, maintenance, and possibly hardware or email costs. Review its current code and privacy model before adding real identity details.
- Open-source code is not automatically safe, free to operate, or suitable for every country.

### Plan C — No-cost manual package

If a required tool is paid, unavailable, or unsuitable, deliver a storyboard, script, edit list, prompts, official opt-out steps, request drafts, and a private tracker template.

## Example 20-second ScamShield promo

Use one clear message and real product facts. One concept is “pause, then verify.”

1. **0–3 seconds — Interrupt:** a fictional notification or payment request appears. Do not show real personal data.
2. **3–7 seconds — Pause:** a hand stops before tapping; carry the pause motif into the next shot.
3. **7–12 seconds — Check the source:** independently find an official channel. Never imply a check occurred if it did not.
4. **12–16 seconds — Explain the evidence:** show distinct outcomes: VERIFIED, NOT VERIFIED, CONFLICT, or INSUFFICIENT EVIDENCE.
5. **16–20 seconds — Human decision:** show the person deciding, then Palm92 ScamShield and “STOP → VERIFY → DECIDE.”

Review text readability, product fidelity, privacy, and every factual claim. Use fictional or sanitized examples.

## Safe, ready-to-adapt agent prompts

### Marketing-call guidance

> Help me reduce unwanted marketing calls to my own UK number. Classify each report as live marketing, automated marketing, suspected scam, silent or abandoned, or unknown. Give me the current official reporting or opt-out route. Never call, message, submit a form, or share my number without my review. Explain that TPS is for live marketing calls and does not block every scam call.

### Personal data listing removals

> Help me find and remove public listings about me, using only identity details I provide for this task. Prefer official opt-out forms. For each site, show the listing URL, exposed fields, opt-out steps, request text, proof needed, and follow-up date. Do not submit forms, upload identity documents, or send my details to another service without my explicit approval. Keep the tracker private and re-check later.

These are prompt templates, not live bots. Do not represent them as deployed services.

## UK call and privacy routes

- The [ICO nuisance-call guide](https://ico.org.uk/for-the-public/nuisance-calls/) says registering a landline or mobile number with the [Telephone Preference Service](https://www.tpsonline.org.uk/) is free for live marketing calls. It can take 28 days to take effect and does not prevent all calls.
- Report nuisance marketing through the [ICO complaint route](https://ico.org.uk/make-a-complaint/nuisance-calls-and-messages/). Scam, silent, and abandoned calls can have different reporting routes.
- UK data-protection rights can include erasure or objection in certain circumstances. Read the current [GOV.UK overview](https://www.gov.uk/data-protection); an organisation may have lawful reasons to retain data.
- Never promise TPS, an AI bot, or an opt-out service removes every listing or call.

## Free Suno and music use

A free Suno account may be useful for a personal safety jingle or draft soundtrack, subject to current credits, account access, and terms. Check current [Suno MCP information](https://suno.com/hub/mcp), [Suno Help](https://help.suno.com/), and [Suno Terms](https://suno.com/terms) before relying on a feature or using a track commercially. Free access does not mean unlimited generation or commercial rights.

Example prompt:

> Create a short, memorable UK community-safety jingle about pausing before paying, independently checking the sender, and verifying the request. Warm, reassuring, upbeat, easy to sing. No fear language, real names, or claims that a tool guarantees protection. End with: “Stop, check, verify — check before you pay.”

## Private opt-out tracker template

Keep this local or in a private, access-controlled workspace. Do not commit personal listings or identity data to this public repository.

| Broker / site | Listing URL | Exposed fields | Official opt-out steps | Request date | Status | Follow-up date |
|---|---|---|---|---|---|---|
|  |  |  |  |  | Not started |  |

## Public sharing checklist

- Use fictional or sanitized screenshots and examples.
- Separate observed facts, AI suggestions, and verified evidence.
- State whether a feature is a concept, prototype, or live deployment.
- Respect external code and asset licenses.
- Do not expose names, phone numbers, addresses, account details, or real case evidence.
- Disclose free-tier limits and paid dependencies honestly.
