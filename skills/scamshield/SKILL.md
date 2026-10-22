# Palm92 ScamShield Skill

## Purpose
Palm92 ScamShield is the fraud, scam and trust-verification vertical of Palm92 Verified Request. It helps people decide whether a suspicious message, opportunity, payment request, job offer, sponsorship claim, property/deposit request or social-media group is safe enough to act on.

Core principle: **AI investigates. Humans decide.**

## Workflow
CAPTURE → PRESERVE → REDACT → EXTRACT CLAIMS & INDICATORS → CLASSIFY RISK → VERIFY AGAINST AUTHORITATIVE SOURCES → SCORE EVIDENCE & CONFIDENCE → RECOMMEND SAFE ACTION → HUMAN DECISION → REPORT/BLOCK → AUDIT & LEARNING

## Allowed outcomes
- VERIFIED RISK: authoritative evidence verifies a material risk.
- LIKELY RISK: multiple strong indicators support risk, but key facts remain unverified.
- INSUFFICIENT EVIDENCE: evidence is too weak or conflicting for a reliable conclusion.
- FALSE POSITIVE: independent evidence materially resolves the suspected risk.

Never declare a person guilty or identify an operator from weak evidence.

## Product modes
1. ScamShield: WhatsApp, SMS, email and social-message checks.
2. JobShield: job, recruiter, visa sponsorship and fee verification.
3. PropertyShield: accommodation, landlord, deposit and property-lead verification.
4. Community Safety: simplified guided checks for community, church, older and vulnerable users.
5. Small Business Fraud Shield: suspicious payment, cash and supplier-request triage.
6. Check Before I Pay: pre-payment decision gate plus privacy-conscious Evidence Pack.

## Evidence Pack
Record channel, whether contact was solicited, claims made, indicators detected, what is evidence versus assertion, authoritative checks, confidence, risk status, recommended safe actions, human decision and audit timestamp. Redact unnecessary personal data before sharing.

## Case Study 001: Beginning of Wealth
An unsolicited WhatsApp group added the user without consent and advertised alleged counterfeit UK notes and alleged cloned-card products using extraordinary-value offers, supposed testimonials, delivery imagery and referral/social-proof messaging. Screenshots establish what was advertised, not whether products, testimonials, balances, identities or deliveries were genuine. The safe outcome is preserve evidence, report, block and exit. Public demos must remove phone numbers, member names, faces and other identifiers.

## Safety boundaries
Never facilitate counterfeit production or use, card cloning, stolen financial data, test purchases, cash-out instructions, evasion, infiltration, impersonation, doxxing, unlawful surveillance or vigilantism. Do not contact suspected operators. Do not use illegal or illicit sources. Prefer authoritative public sources and lawful OSINT. Human approval is required before public reporting, submission, publication or other consequential action.

## Integration
Reuse Palm92 Verified Request for the decision gate, Palm92 GRC Evidence Vault for evidence/audit patterns, Palm92 Governed Agent MCP for action boundaries, and Palm92 RepoGuard for repository integrity. Do not fragment the shared verification engine into unrelated products.

## Deployment strategy
Plan A: GitHub is the permanent source of truth, with Replit used for rapid live web deployment where practical.
Plan B: maintain a local/offline demo path with deterministic rules and sanitised sample cases so core education and triage still work when AI APIs or external verification services are unavailable. Alternate low-cost hosting may be used if Replit is unavailable.

## Product standard
Execution-first and proof-before-promise. A feature is not complete until built, tested, verified and, when intended for public use, deployed with evidence of the deployment.