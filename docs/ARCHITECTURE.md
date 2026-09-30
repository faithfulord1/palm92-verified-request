# Architecture

## Goal

Palm92 Verified Request determines whether a high-risk request was genuinely authorised by the organisation it claims to represent.

The system is designed around an evidence hierarchy:

1. Organisation-controlled registry data
2. Explicit authorised-request records
3. Verified official channels
4. External corroborating evidence
5. AI interpretation

AI is deliberately last in the authority chain.

## High-level architecture

```text
User / WhatsApp / Web / API / Agent
                 |
                 v
            Intake Layer
                 |
                 v
       Claim Extraction Agent
                 |
                 v
        Verification Orchestrator
          /        |         \
         v         v          v
 Official      Request      External
 Registry      Registry     Evidence
         \        |          /
          \       |         /
           v      v        v
        Deterministic Rules Engine
                 |
                 v
      Result + Evidence Explanation
                 |
        +--------+---------+
        |                  |
        v                  v
   User Response       Human Review
                            |
                            v
                        Audit Log
```

## Core components

### 1. Intake layer

Accepts:
- verification IDs
- text
- URLs
- payment destinations
- email addresses
- phone numbers
- screenshots
- voice/video metadata placeholders in MVP

Future versions may add direct media analysis, but Palm92 does not depend on deepfake detection to determine authorisation.

### 2. Organisation Registry

Stores authoritative organisation-controlled data:
- legal/display name
- verified domains
- official email addresses
- official phone numbers
- social accounts
- payment destinations
- authorised administrators
- approved donation pages
- public verification policy

### 3. Authorised Request Registry

A high-risk request record contains:
- request ID
- organisation ID
- request type
- title
- authorised action
- payment destination if relevant
- amount/range if relevant
- issue time
- expiry time
- approving administrator
- status
- cryptographic or database integrity metadata

### 4. Claim Extraction Agent

An LLM may extract:
- claimed organisation
- claimed sender
- requested action
- amount
- currency
- payment destination
- urgency
- contact channel
- links
- identity assertions

The extraction agent does not decide whether the request is legitimate.

### 5. Verification Orchestrator

Runs appropriate checks based on the extracted request:
- locate organisation
- locate matching authorised request
- compare payment destination
- compare domain/contact channel
- check expiry/revocation
- identify conflicts
- collect evidence
- decide whether human review is required

### 6. Deterministic Rules Engine

Initial result states:

- **VERIFIED**: a matching active authorised request exists and critical fields match.
- **NOT VERIFIED**: no authorised request exists or a critical field is explicitly unauthorised.
- **CONFLICT**: part of the request matches but one or more critical fields conflict.
- **INSUFFICIENT EVIDENCE**: the system cannot responsibly determine authorisation.

No LLM may override these rules.

### 7. Human Review

Required for:
- ambiguous organisation identity
- conflicting authoritative sources
- high-value or high-impact requests
- disputed registry ownership
- suspected compromise of an official channel
- policy-defined escalation thresholds

### 8. Audit and evidence layer

Record:
- input hash/reference
- extracted facts
- checks performed
- registry records consulted
- rule outcomes
- evidence links
- model/version used for interpretation
- human decisions
- timestamps

## API

The public API is versioned under `/v1`.

Initial endpoints:
- `POST /v1/verify`
- `GET /v1/verification/{id}`
- `POST /v1/organisations`
- `POST /v1/organisations/{id}/requests`
- `POST /v1/human-review`

See `api/openapi.yaml`.

## MCP

The MCP server exposes narrow tools that map to governed capabilities rather than unrestricted database access.

See `mcp/README.md`.

## Privacy principles

- data minimisation by default
- no unnecessary storage of message bodies
- redact secrets and identity documents from logs
- configurable retention
- explicit deletion workflow
- organisation-level access controls
- encryption in transit and at rest in production
- no model training on customer data by default

## Design principle

**AI interprets. Trusted records authorise. Humans govern.**
