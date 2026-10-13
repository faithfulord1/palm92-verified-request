# Palm92 Verified Request | Authority Gate demo

**Access does not equal authority. AI investigates. Humans decide.**

This runnable, dependency-free demo shows a fictional charity supplier payment request moving through identity, authority, permission, scope, risk and human review. It creates a hash-linked audit sequence and downloadable case evidence. The action is simulated. No payment, message or repository mutation occurs.

## Run

Requires Node.js 18 or later.

```bash
npm test
npm start
```

Open `http://localhost:3000`. The form loads a valid fixture. Submit it and observe `AWAITING_HUMAN`; approve with a reviewer label and reason or reject it. Change the destination to `GB-ATTACKER` and submit a second case. It must show `BLOCKED_CHECKS`, with approval unavailable. Download the case JSON to inspect evidence and event hashes.

## Architecture

```text
Browser → POST /api/requests → fixed fictional registry → five deterministic checks
                                                ↓
                                      blocked or awaiting human
                                                ↓
                              POST /decision → simulated permit or reject
                                                ↓
                                   per-case hash-linked audit export
```

`gate.js` holds the registry fixture, checks and state transitions. `server.js` serves the UI and API. `public/` is the accessible explanatory layer. `test/` exercises permitted, blocked, rejected and invalid decision paths. `paypal-sandbox.js` preserves the previous Sandbox order adapter but is intentionally **not wired to an endpoint** until reviewer authentication and approved-parameter binding are implemented.

## API

- `GET /api/scenario`: fictional fixture and example.
- `POST /api/requests`: submit claimed person, channel, action, amount, destination and invoice.
- `GET /api/requests/:id`: read case.
- `POST /api/requests/:id/decision`: `APPROVE` or `REJECT` with `reviewer` and `reason`.
- `GET /api/requests/:id/audit`: ordered events and SHA-256 hash chain.

## Security and threat model

| Risk | Demo control | Production gap |
| --- | --- | --- |
| Spoofed identity or channel | Exact match against a fictional registry | Authenticate user, verify channel ownership, establish trusted provenance |
| Agent has access but exceeds authority | Role, action, amount and destination checked before decision | Signed policy, separation of duties, revocation, policy versioning |
| Direct API approval bypass | State transition refuses failed checks and repeated decisions | Authenticate reviewer, bind approval to request digest, CSRF protection and step-up verification |
| Altered evidence | Events include previous SHA-256 hash | Immutable durable store, signed timestamps, access controls and independent verification |
| Data loss on restart | None | Database, retention schedule, backup and deletion policy |
| Race or duplicate execution | One synchronous in-memory transition | Transactional storage and idempotent execution adapter |

The reviewer field is **an unverified label**. The hash chain detects some accidental edits within an exported sequence, but a server operator could rewrite the entire chain. This is a demonstration of the gate logic, not a secure production authorisation service or an identity guarantee. Do not put real personal data in the demo. No PayPal credentials or live actions are required.

## Two-minute demo script

1. **0:00 to 0:20**: “A familiar name and technical connection are only claims. Here is a fictional request for a £125 supplier payment.”
2. **0:20 to 0:45**: Submit the fixture. Show five checks passing and the action still waiting for a human.
3. **0:45 to 1:10**: Enter reviewer label and reason, approve. Show `PERMITTED_DEMO` and audit events. State clearly that no money moves.
4. **1:10 to 1:35**: Change the destination to `GB-ATTACKER`, resubmit. Show scope failure, blocked status and disabled approval.
5. **1:35 to 2:00**: Download JSON, point out the checks, decision and hashes. “AI investigates. Humans decide. Evidence is the asset.”

## Submission positioning

**Project:** Palm92 Verified Request, the Authority Gate. **Problem:** Agents and people may have system access or receive convincing requests without authority to carry out the specific action. **Demo:** A fictional payment request is checked against a controlled registry and policy, stopped pending human approval, then permitted only as a simulation or blocked with an evidence trail. **Next integration:** PayPal Sandbox order creation only after authenticated approval and binding of the approved details to the execution request. Sandbox integration is planned, not shown in this demo.

**Status:** WORKING Authority Gate demo locally. **Outstanding for PayPal submission:** authenticated approval, persistent audit store, binding the preserved Sandbox adapter to the approved request, a meaningful AI function, recorded screenshots/video and submission form. No submission or external action has occurred.
