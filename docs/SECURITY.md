# Security and Governance Notes

## Objective
A technically reachable action must not execute only because a requester or agent has access.

## Key risks
- requester impersonation
- compromised trusted channel
- genuine user acting outside delegated authority
- action outside approved scope
- changed payment destination
- unsafe reliance on AI interpretation
- human approval without sufficient evidence
- replay of an old request
- alteration of decision evidence

## Controls in this prototype
- deterministic gate checks are separate from AI interpretation
- HIGH risk blocks approval execution
- APPROVE cannot bypass a failed Authority Gate
- REJECT never invokes the payment API
- PayPal Sandbox only
- credentials remain server-side
- decision records include an evidence fingerprint
- the interface states that demo checkboxes are not identity proof

## Required before production
- strong authentication and role-based access
- authoritative organisation and delegation records
- independent destination verification
- expiry and revocation of permissions
- replay protection and idempotency
- persistent tamper-evident audit storage
- separation of duties for high-impact actions
- secure secret management
- data retention and deletion rules
- monitoring and incident response
- false-positive and false-negative testing

AI investigates. Humans decide. Authority comes from governed evidence, not model confidence.
