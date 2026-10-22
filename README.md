# Palm92 ScamShield

Privacy-first, evidence-led request checking for six modes: Social / WhatsApp ScamShield, JobShield, PropertyShield, Community Safety, Small Business Fraud Shield, and Check Before I Pay.

**Don’t trust the screenshot. Verify the request.**  
**AI investigates. Humans decide.**

## What it does

- Guides people through **STOP → VERIFY → DECIDE**.
- Captures claims, requests, observed indicators, source-check notes, an evidence status, and a human decision.
- Generates a JSON Evidence Pack with clear evidence limitations and automatic redaction for email addresses, phone numbers, invite links, URLs, and user-specified names/numbers.
- Fails closed when the claim, evidence scope, or human decision is missing. Conclusive statuses also require a documented authoritative-source check.
- Provides links to authoritative UK sources. The user opens and checks each source; the app does not pretend that it queried those sources.
- Supports four evidence statuses: VERIFIED RISK, LIKELY RISK, INSUFFICIENT EVIDENCE, and NO MATERIAL RISK DETECTED.
- Keeps the case in the browser session. There is no account, upload, analytics, remote API, cookie, or server-side case storage.
- Includes only the sanitised Case Study 001: “299 strangers / £200 supposedly becomes £4,000.” It contains no private identities, phone numbers, faces, invite links or group screenshots.

## Run locally

```sh
npm test
npm start
```

Then visit `http://localhost:3000`. The app is static HTML/CSS/JS and can be deployed on Vercel or any static host. Node is used only for the local preview command and test suite.

## Safety and limitations

A screenshot can establish that a claim was made, not that it is true. Display names and phone numbers do not prove who controlled an account. `VERIFIED RISK` requires direct authoritative evidence about the proposition. `NO MATERIAL RISK DETECTED` is not a guarantee. ScamShield does not identify criminals, contact suspects, test illicit goods, make reports, approve payments or decide for the user. Never use it to facilitate counterfeit production, card cloning or other fraud.

The Evidence Pack is a user-created export, not a tamper-proof forensic record. Review it before sharing. The source links are conveniences, not proof that a check was completed.

The export gate is deliberately stricter for `VERIFIED RISK` and `NO MATERIAL RISK DETECTED`: at least one authoritative source must be marked as checked and include a note describing what the user confirmed. `LIKELY RISK` and `INSUFFICIENT EVIDENCE` remain usable offline, but still require an evidence-scope statement and a human decision.

## Deployment

GitHub Pages is the zero-cost Plan B for this static app and is available for public repositories on GitHub Free. The `.github/workflows/pages.yml` workflow publishes the `public/` directory from `feat/scamshield-case001` and can later publish from `main` after merge. Verify the GitHub repository Pages setting and the Actions deployment result; production is not considered complete until the public URL has been opened and checked against the acceptance criteria, including the public demo privacy content and Evidence Pack behavior. GitHub Pages does not let this repository set HTTP response headers, so the page includes a restrictive CSP meta policy and the application avoids remote scripts, APIs, analytics, cookies, and server-side case storage.
