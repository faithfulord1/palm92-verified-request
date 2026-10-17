# Operator gate for the sandbox demo

The decision and audit endpoints require `Authorization: Bearer <operator token>`.
Configure a random `ADMIN_API_TOKEN` of at least 32 bytes in server-side environment
settings. Without it, both endpoints fail closed. Never put the token in source,
screenshots, public logs, or a public URL. The demo page asks the operator for the
token for each decision and does not persist it. Use HTTPS on any deployed instance.

The PayPal API base is pinned to the sandbox. A production payment flow needs a
separate security review, a real authentication and role model, durable audit storage,
explicit human approval evidence, and PayPal webhook verification. This demo's
in-memory records and prompt-based token entry are not production controls.

Run `npm test` for local access-control checks. These tests do not call PayPal.
