# Threat Model

## Protected assets

Palm92 Verified Request protects:
- trusted organisation identity
- authorised payment destinations
- approved requests and campaigns
- verification results
- evidence records
- organisation administrator accounts
- user-submitted suspicious messages

## Primary threats

### Impersonation

An attacker pretends to be:
- a pastor or ministry leader
- a charity representative
- a school official
- an executive
- a recruiter
- another trusted person

### Payment redirection

A real-looking request changes:
- bank account
- payment link
- wallet
- mobile-money destination
- gift-card instruction

### Compromised official channel

A genuine social/email account is compromised. This is important because "official account" alone is not proof of authorised intent.

Mitigation: verify the specific request against the authorised-request registry.

### QR or verification-code substitution

An attacker copies the Palm92 visual language but inserts another code.

Mitigation: verification resolves against a signed/server-side record and displays the organisation identity and request details.

### Registry takeover

An attacker attempts to register an organisation they do not control.

Mitigation:
- domain/control verification
- multi-step administrator verification
- manual review for disputed/high-risk entities
- immutable audit history

### AI prompt injection

A submitted message attempts to manipulate the extraction/orchestration agent.

Mitigation:
- treat user content as untrusted data
- structured extraction schemas
- tool allowlists
- no free-form access to secrets
- deterministic final rules
- human escalation

### Model hallucination

The model invents an organisation, payment destination or evidence.

Mitigation:
- require source-bound facts
- separate extracted assertions from verified facts
- never allow model prose to create authorisation status
- display uncertainty

### Denial of service / spam

Automated requests consume verification capacity.

Mitigation:
- rate limits
- API keys for organisations
- abuse monitoring
- quotas
- caching of public verification records

### Privacy leakage

Sensitive user messages or payment details leak through logs or model calls.

Mitigation:
- minimise payloads
- redact sensitive fields
- retention controls
- role-based access
- encrypted storage
- provider data-processing controls

## Failure modes to test

1. Legitimate request from an unusual-looking channel
2. Fake request using the correct organisation logo
3. Fake request using an official leader's name
4. Compromised official account posting an unauthorised payment destination
5. Expired legitimate campaign
6. Legitimate campaign with a copied but altered payment link
7. No matching organisation
8. Conflicting registry records
9. Manipulative prompt embedded in submitted text
10. Partial evidence only

## Safety rule

Palm92 should prefer **INSUFFICIENT EVIDENCE** over false certainty.
