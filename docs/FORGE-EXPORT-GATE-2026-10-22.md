# FORGE evidence: ScamShield export gate

Date: 2026-10-22

## Problem addressed

The Evidence Pack builder previously accepted any selected status. A user could therefore export `VERIFIED RISK` or `NO MATERIAL RISK DETECTED` without recording an authoritative check, and could export any status with the human decision still pending.

## Change

The shared core now validates the case before an Evidence Pack is built. Every export requires:

- a valid ScamShield mode and evidence status;
- a recorded claim;
- a statement of what the available evidence actually proves; and
- a recorded human decision.

`VERIFIED RISK` and `NO MATERIAL RISK DETECTED` additionally require at least one authoritative source marked as checked with a non-empty note explaining what was confirmed. The same validation runs in the browser interface and the Evidence Pack builder, so bypassing the button handler does not bypass the control.

## Expected verification

The automated suite covers the two conclusive statuses, required human-review fields, invalid modes/statuses, a valid provisional offline workflow, privacy redaction, the sanitised public case, and preview-server security headers/path handling. Run `npm test` and `node --check public/app.js && node --check public/core.js` from the repository root.

## Remaining limit

This gate verifies that the user recorded a check. It does not query the external source, authenticate the reviewer, or make the resulting JSON tamper-proof. The interface and exported pack continue to state those limits.
