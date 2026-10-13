# Authority Gate Architecture

Palm92 Verified Request applies a control sequence before a consequential action.

REQUEST -> IDENTITY -> AUTHORITY -> PERMISSION -> SCOPE -> RISK -> HUMAN APPROVAL -> ACTION -> AUDIT

## Design rules

- Access does not equal authority.
- AI may investigate and explain, but it is not the source of authorisation.
- A human approval cannot bypass a failed control gate.
- A rejected request causes no payment execution.
- The current payment integration is PayPal Sandbox only and moves no real money.
- Every decision produces an audit identifier and evidence fingerprint.

## Demo API

- GET /api/health
- POST /api/gate
- POST /api/decision
- GET /api/audit

## Production boundary

The current checkbox controls demonstrate workflow logic only. A production implementation must replace them with authoritative identity, delegation, permission, scope and destination evidence from independently governed systems.
