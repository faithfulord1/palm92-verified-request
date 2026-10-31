# Nebius AI Builder Program Compute Grant Proposal

## Project
Palm92 Open Verification Engine

## Problem
People increasingly receive convincing high-risk requests through email, messaging, social media, voice and images. Media-authenticity detection alone does not answer the operational question: was this exact action actually authorised by the claimed organisation?

## Open-source contribution
Palm92 is building an evidence-first verification engine that separates AI interpretation from trusted source-of-truth checks. The engine extracts claims and identifiers, compares them with trusted registries, records provenance, produces explainable risk signals and routes uncertain or consequential cases to human review.

The reusable engine is intended to support community organisations, charities, recruitment, accommodation, SMEs and other high-trust environments. It will expose documented APIs and an evaluation harness so other builders can test open-weight models for evidence-grounded verification.

## Why Nebius compute is needed
The next phase requires systematic experiments across open-weight models and multimodal inputs rather than a single hosted-model demo. Compute will be used to:

1. benchmark open models on claim extraction, entity extraction, evidence-grounding and calibrated abstention;
2. evaluate text plus screenshot/document evidence where supported;
3. run adversarial and ambiguity suites measuring false verification, false rejection and unsupported claims;
4. compare model quality, latency, token use and cost under repeatable configurations;
5. test prompt/evaluation improvements and, where justified, lightweight post-training or adapters;
6. publish reproducible benchmark results and reference configurations for other open-source builders.

## Proposed Nebius stack
- Nebius Token Factory for open-model inference and model comparison.
- Nebius AI Cloud GPU compute for experiments that require dedicated compute or post-training.
- Tavily or equivalent evidence retrieval behind explicit provenance controls.
- Persistent experiment artifacts and checkpoints so preemptible compute can be safely resumed.

## Safety architecture
AI does not independently authorise payments or other consequential actions. Trusted records and deterministic rules establish authorisation evidence. Conflicts and insufficient evidence fail safely into human review. Evaluation explicitly measures dangerous false-positive verification.

## Deliverables
- Open verification engine and documented API.
- Reproducible evaluation harness and synthetic/privacy-safe benchmark cases.
- Model comparison report covering quality, latency and cost.
- Human-review and audit-trail reference workflow.
- Deployment documentation and example integrations.

## Success metrics
- False VERIFIED rate on known conflict/adversarial cases.
- Precision/recall for extracted verification signals.
- Abstention/human-review quality on ambiguous cases.
- Evidence citation/provenance completeness.
- Latency and cost per verification across tested models.
- Reproducibility from a clean environment.

## Current status
A working MVP already exists in the public repository. The grant branch adds a deterministic open verification core and automated benchmark cases. The next milestone is open-model extraction and multimodal evaluation on Nebius.

## European builder context
The project is being developed in the United Kingdom as an open developer tool with community-safety applications. The objective is to contribute reusable verification and evaluation infrastructure to the European open AI ecosystem.
