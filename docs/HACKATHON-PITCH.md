# Hackathon Pitch

## One-line pitch

**Palm92 Verified Request helps people verify whether a high-risk request was actually authorised before they send money, share data or act.**

## The problem

AI has made convincing impersonation cheaper, but the danger is broader than deepfakes.

A fraudulent message can be:
- AI-generated
- manually written
- copied from a real announcement
- sent from a compromised account
- paired with a fake payment destination

Deepfake detection alone cannot answer the question a user actually needs answered:

> "Should I act on this request?"

## The solution

Organisations register their official channels and high-risk actions. Every legitimate request can receive a verification record, ID and QR code.

When a recipient receives a suspicious message, Palm92:
1. extracts the claimed organisation and requested action
2. checks the official organisation registry
3. checks for a matching active authorised request
4. compares payment/contact details
5. gathers supporting evidence
6. applies deterministic rules
7. returns VERIFIED, NOT VERIFIED, CONFLICT or INSUFFICIENT EVIDENCE

## Differentiator

**Most tools detect fake content. Palm92 verifies authorised intent.**

This still works if:
- no AI was used
- the image is real
- the voice is real
- the account is genuine but compromised

## First users

Initial validation:
- churches and ministries
- charities
- community organisations
- small businesses

Future extensions:
- schools
- recruitment
- creators
- family fraud prevention
- enterprise payment verification

## Agentic AI

The AI layer:
- extracts structured facts
- selects verification checks
- summarises evidence
- explains uncertainty
- routes uncertain cases to humans

It does not invent or grant authorisation.

## Demo story

A user receives:

> "Pastor has asked every member to urgently send £200 to this account today."

They paste the message into Palm92.

Palm92 extracts:
- organisation
- £200 request
- destination account
- urgency

It finds:
- no authorised campaign matching the request
- payment destination absent from the organisation registry

Result:

**NOT VERIFIED**

Reason:
- no matching authorised request
- payment destination is not registered

Action:
- do not pay
- contact organisation through verified channel
- submit for human review

## What we measure

- false verification rate
- false rejection rate
- time to verification
- percentage of cases resolved without human review
- evidence completeness
- user comprehension
- incident escalation accuracy

## Tagline

**Verify before you act.**
