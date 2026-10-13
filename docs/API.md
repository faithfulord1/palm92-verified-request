# Verified Request API v0.2

## POST /api/gate
Evaluates demo control state without executing an action.

Input fields: `identityVerified`, `authorityChecked`, `permissionValid`, `withinScope`, `risk`.

Output: `READY_FOR_HUMAN_REVIEW` or `BLOCKED`, individual checks and failed controls.

## POST /api/decision
Records an explicit human `APPROVE` or `REJECT` decision with request/evidence/payment context.

Rules:
- REJECT never calls PayPal.
- APPROVE with a failed Authority Gate returns a blocked response and does not call PayPal.
- APPROVE with a passed gate can create a PayPal Sandbox order when server credentials are configured.
- A decision record contains an audit ID, gate result and evidence fingerprint.

## GET /api/audit
Returns in-memory prototype decision records.

## GET /api/health
Returns service state, Sandbox credential configuration state and governance principles.

Production note: in-memory audit records are not sufficient for production. Use durable tamper-evident storage and appropriate access controls.
