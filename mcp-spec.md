# Palm92 Verified Request MCP Specification

The MCP layer must preserve the same authority boundary as the web/API demo. Tool access never grants business authority.

## Proposed tools

### verify_request
Returns evidence and Authority Gate state. Must not execute the requested business action.

### lookup_official_channel
Retrieves independently governed organisation contact/channel evidence.

### check_payment_destination
Compares a proposed destination with authorised destination evidence.

### get_verification_record
Returns an existing verification/audit record subject to access control.

### request_human_review
Creates a review task for an authorised human. It does not imply approval.

### prepare_incident_evidence_pack
Packages request, evidence, checks, decision and provenance for review.

## Safety contract
- MCP authentication answers who/what can call the tool, not whether the requested business action is authorised.
- Consequential action requires independent authority, permission, scope and risk checks.
- Human approval cannot override a failed mandatory gate without a separately governed exception process.
- Tool outputs must preserve uncertainty and provenance.
- Production implementations require durable audit storage, RBAC, revocation, replay protection and monitoring.
