# Palm92 Verified Request

**Verify before you act.**

Palm92 Verified Request is an evidence-first verification platform for confirming whether high-risk requests, payments, donation appeals, emergency messages and organisational actions were genuinely authorised before people act.

## The problem

People increasingly receive believable messages through WhatsApp, email, social media, voice notes and video. A message can look authentic, use a trusted person's name or image, and still ask the recipient to send money, disclose information or take an unsafe action.

Generic deepfake detection asks:

> "Was this media manipulated?"

Palm92 Verified Request asks a more actionable question:

> **"Did the real organisation actually authorise this exact request?"**

## Core principle

The AI is not the source of truth.

AI may extract claims, identify entities, classify risk, summarise evidence and orchestrate checks. Final authorisation status is determined against trusted organisational records, approved channels and explicit verification rules.

## Initial MVP

1. **Organisation Registry**  
   Register official domains, phone numbers, social accounts, payment destinations and authorised administrators.

2. **Authorised Request Creator**  
   Issue a high-risk request with a unique verification ID and QR code.

3. **Public Verification**  
   Let anyone enter a verification ID, paste a message or submit a suspicious request for checking.

4. **Evidence-based Result**  
   Return one of:
   - VERIFIED
   - NOT VERIFIED
   - CONFLICT
   - INSUFFICIENT EVIDENCE

5. **Incident Evidence Pack**  
   Preserve the claim, source, timestamps, extracted facts, registry comparison and relevant evidence.

6. **Human Review**  
   Escalate uncertain or high-impact cases to an authorised reviewer.

## Safe agentic workflow

```text
Input
  ↓
Extract claim + requested action
  ↓
Identify organisation / person / destination
  ↓
Check official registry
  ↓
Check authorised request record
  ↓
Compare payment / contact / channel details
  ↓
Gather supporting evidence
  ↓
Deterministic verification rules
  ↓
Explain result + confidence / uncertainty
  ↓
Human review when required
```

## API and MCP

The project is designed to expose a versioned REST API and a Model Context Protocol server so other applications and AI agents can verify requests safely.

Planned MCP tools include:

- `verify_request`
- `lookup_official_channel`
- `check_payment_destination`
- `create_authorised_request`
- `get_verification_record`
- `prepare_incident_evidence_pack`
- `request_human_review`

## First validation markets

The first validation wedge is churches and ministries, charities and community organisations where trust is high and impersonation can cause immediate financial or reputational harm.

The underlying infrastructure is intentionally broader so it can later support schools, SMEs, recruitment, creators and other high-trust environments.

## Safety and governance

- Never claim certainty when evidence is insufficient.
- Never let an LLM independently decide whether a payment or high-impact request is authorised.
- Keep consequential actions behind human approval.
- Preserve provenance and an audit trail.
- Minimise personal data.
- Make deletion and retention controls explicit.
- Measure false positives and false negatives.
- Separate verified organisational records from AI-generated interpretation.

## Hackathon thesis

**Most tools try to detect whether content is fake. Palm92 verifies whether the requested action was authorised.**

That makes the product useful even when a message was written by a human, copied from a real account, or generated with AI.

## Status

Hackathon MVP and market-validation stage.

---

**Palm92 Intelligence**  
Evidence before action.
