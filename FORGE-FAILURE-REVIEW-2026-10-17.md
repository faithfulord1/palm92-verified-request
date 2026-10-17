# Payment failure review — 17 October 2026

## Scope and evidence

Palm92 Verified Request draft PR #4, branch
`forge/operator-gate-sandbox-20261014`, inspected head
`bdfad67e81ea647a08194ef6cb327bd75bfb0bc0`.
PR was open and draft, with no discussion comments at inspection. Local
`server.js` and `package.json` matched the remote head byte-for-byte.

Operational question: can the operator distinguish a failed or uncertain
provider call from a successful order without exposing raw error details?
Permitted change here: a reproducible diagnostic and review evidence only.
No runtime, credential, authentication, deployment or approval-policy changes.

## Reproduce

```sh
npm test
node diagnostics/payment-failures.cjs
```

Node v24.19.0. Existing suite: **8 passed, 0 failed, 0 skipped**.
Diagnostic: **7 scenarios, 1 passed, 6 unmet**, exit code **1**.
This is an intentionally red readiness gate, not six passing regression tests.
It is run explicitly and is not part of the default `npm test` discovery.
Exit 2 indicates a harness error rather than an unmet safety expectation.

All values are fictional. The diagnostic executes the actual server handler
in a VM, intercepts HTTP server creation and outbound fetch, and does not inherit
host credentials or open sockets. Counts below refer to stub invocations only.
VM isolation here is a testing convenience, not a secure sandbox for untrusted code.

| Simulated scenario | HTTP status | Audit status | Stub calls | Result |
| --- | --- | --- | ---: | --- |
| Missing server credentials | 500 | APPROVED_PENDING_PAYPAL | 0 | Unmet |
| OAuth rejected | 500 | APPROVED_PENDING_PAYPAL | 1 | Unmet |
| Order rejected | 500 | APPROVED_PENDING_PAYPAL | 2 | Unmet; raw error returned |
| Order transport failure | 500 | APPROVED_PENDING_PAYPAL | 2 | Unmet; raw error returned |
| Invalid order JSON | 500 | APPROVED_PENDING_PAYPAL | 2 | Unmet; raw error returned |
| Order response missing ID | 200 | PAYPAL_ORDER_CREATED | 2 | Unmet; false success |
| Human rejection control | 200 | REJECTED_NO_PAYMENT | 0 | Pass |

## Confirmed findings

1. **Stale audit state:** the handler adds an approved record before calling
   `createOrder`; its outer catch returns HTTP 500 without updating that record.
   Five simulated failure paths therefore remain pending indefinitely.
2. **Raw error disclosure:** the outer catch returns `e.message`. The order helper
   also incorporates the provider's message. Three fictional marker probes prove
   unfiltered provider/exception text reaches the client. This is a disclosure
   path, not evidence that real credentials have actually leaked.
3. **Unvalidated success:** `createOrder` accepts a successful response without an
   order ID; the handler then records `PAYPAL_ORDER_CREATED` and returns HTTP 200.

## Proposed remediation for approval

- Validate required credentials before initiating a provider request.
- Track the attempt stage and explicitly distinguish not attempted, confirmed
  failure, confirmed order creation and unknown provider outcome.
- Validate the response shape and nonempty order ID before recording success.
- Return a stable, generic error code and audit correlation ID; never send raw
  provider exception text to the client or copy secrets into the audit record.
- Do not automatically retry an uncertain order creation. A transport failure
  after submission does not prove that no order exists. Reconcile with the
  provider using the same stable request identifier before any retry design.
- Convert these probes to regression assertions alongside the reviewed fix.

These are proposed payment-flow changes, not implemented controls. Faith's
approval is required before changing sensitive payment behaviour. No real
payment, capture, financial transaction or provider lookup was performed.

## Boundaries and next work

DONE: reproducible failure diagnostic and review evidence.
WAITING: approval of the sensitive failure-state remediation and draft review.
NEXT: implement the approved state/error contract with regression tests, then
perform approved sandbox end-to-end verification using server-side credentials.

Free-first Plan A: run both commands locally without external services.
Plan B for socket-restricted environments: run
`node --test test/sandbox-contract.test.js` and the explicit diagnostic.
These are verification routes, not a hosting or deployment failover test.
Telegram, WhatsApp, live PayPal, UI and deployment remain unverified by this work.
Other engineering lanes can proceed while this payment behaviour awaits approval.
