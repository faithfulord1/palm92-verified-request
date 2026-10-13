# Verified Request: The Authority Gate

**Access does not equal authority.**

This branch upgrades Palm92 Verified Request into a governed action-control demonstration.

## Flow
REQUEST -> IDENTITY -> AUTHORITY -> PERMISSION -> SCOPE -> RISK -> HUMAN APPROVAL -> ACTION -> AUDIT

## What changed
- Added server-side Authority Gate logic.
- Added a dedicated `/api/gate` check.
- Human APPROVE cannot bypass a failed gate.
- HIGH risk blocks execution.
- Human REJECT never invokes PayPal.
- Added SHA-256 evidence fingerprint to decision records.
- Added mobile-friendly Authority Gate interface.
- Added architecture, security and test-scenario documentation.
- Added automated regression tests and GitHub Actions CI.

## Run
```bash
npm test
npm start
```

PayPal credentials are optional for testing gate/rejection paths. A successful approved payment demo requires PayPal Sandbox credentials in server environment variables.

## Truth boundary
The checkbox controls are a demonstration of policy orchestration, not proof of identity or delegated authority. A production implementation must obtain those facts from independently governed authoritative sources.

**Palm92 Intelligence: AI investigates. Humans decide. Evidence proves what happened.**
