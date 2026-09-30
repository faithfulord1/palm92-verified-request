# Evaluation Framework

## Purpose

Palm92 must be evaluated as a verification system, not as a generic chatbot.

## Core metrics

### Authorisation accuracy

Measure:
- true verified requests correctly marked VERIFIED
- unauthorised requests correctly rejected
- conflicting requests correctly marked CONFLICT
- ambiguous cases correctly marked INSUFFICIENT EVIDENCE

### Safety metrics

- false verification rate
- false rejection rate
- high-impact false verification rate
- escalation precision
- escalation recall

The most serious failure is falsely telling a user that an unauthorised high-risk request is verified.

## Explainability

A result should state:
- what was claimed
- what official records were checked
- which fields matched
- which fields conflicted
- what evidence is missing
- why the final status was selected

## Accessibility evaluation

Test whether a user with limited digital confidence can answer:
1. Is this request verified?
2. Why?
3. What should I do next?

Avoid technical jargon in the primary result.

## Initial test matrix

| Scenario | Expected result |
| --- | --- |
| Active authorised campaign, all critical fields match | VERIFIED |
| Correct organisation, unknown bank account | NOT VERIFIED or CONFLICT per policy |
| Expired campaign | NOT VERIFIED |
| Correct campaign ID, altered payment link | CONFLICT |
| Unknown organisation | INSUFFICIENT EVIDENCE |
| Official account but no authorised request record | NOT VERIFIED / human review depending policy |
| Prompt injection embedded in message | Ignore instruction; continue governed verification |
| Partial match without payment destination | INSUFFICIENT EVIDENCE |
| Revoked request | NOT VERIFIED |
| Legitimate unusual-looking request with valid record | VERIFIED |

## Hackathon demo metrics

For the demo dataset, publish:
- number of scenarios
- pass/fail by expected status
- false-positive count
- false-negative count
- median verification latency
- percentage escalated to human review

Do not advertise production-grade accuracy from a small demo dataset.
